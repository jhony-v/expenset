import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.21.0";
import * as postgres from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const databaseUrl = Deno.env.get("SUPABASE_DB_URL");
const pool = new postgres.Pool(databaseUrl, 3, true);

const extractValues = (value: string) => {
  const flat = value.toLowerCase();
  const isBcp = flat.includes("bcp");
  const isInterbank = flat.includes("interbank");
  const bank = isBcp ? "bcp" : isInterbank ? "interbank" : "unknown";
  let amount = 0;
  let currency = "";
  let description = "";
  let type = "";
  const lines = flat.split("\n");
  for (const i in lines) {
    const line = lines[i];
    if (isBcp) {
      if (line.includes("total del consumo")) {
        const match = line.match(/\*([Ss\$]\/)\s*([\d,.]+)/);
        if (!match) return null;
        const symbol = match[1];
        amount = parseFloat(match[2].replace(",", ""));
        currency =
          symbol === "s/" ? "PEN" : symbol === "$/" ? "USD" : "UNKNOWN";
        type = "EXPENSE";
      }
      if (line.includes("empresa")) {
        const match = line.match(/\*(.*)\*/);
        description = match?.[1] || "";
      }
    } else if (isInterbank) {
      if (line.includes("moneda y monto")) {
        const content = line.replace("US", "").split(" ");
        const length = content.length;
        amount = parseFloat(content[length - 1].replace(",", ""));
        const symbol = content[length - 2];
        currency =
          symbol === "s/" ? "PEN" : symbol === "$/" ? "USD" : "UNKNOWN";
      }
    }
  }
  return {
    message: flat,
    bank,
    amount,
    type,
    description,
    currency,
    rate: null,
    budget_id: null,
    category_id: null,
  };
};

const ai = new GoogleGenerativeAI(Deno.env.get("GOOGLE_API_KEY") ?? "");
const model = "gemini-2.5-flash-preview-05-20";

Deno.serve(async (req) => {
  try {
    return await handler(req);
  } catch (error) {
    console.error("[read-inbox] error:", String(error));
    return Response.json({ error: String(error) }, { status: 500 });
  }
});

const handler = async (req: Request) => {
  if (req.method === "POST") {
    const response = await req.json();
    console.log("[read-inbox] received:", response.subject, "| from:", response.from);
    const values = extractValues(response.body);
    console.log("[read-inbox] parsed:", JSON.stringify({ ...values, message: undefined }));
    const date = response.date;
    const connection = await pool.connect();
    const dbCategories = (
      await connection.queryObject`SELECT id, name FROM category`
    ).rows;
    const categories = (
      dbCategories as Array<{ id: number; name: string }>
    ).map(({ id, name }) => ({
      id: Number(id),
      name,
    }));
    connection.release();
    console.log("[read-inbox] categories loaded:", categories.length);
    const modelResponse = await ai.getGenerativeModel({
      model,
    });
    const result = await modelResponse.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are an assistant that classifies a bank transaction into one of the following categories:\n\n${JSON.stringify(
                categories
              )}\n\nGiven this transaction message:\n\n"${values}"\n\nReturn a JSON like: { "category_id": number }\n\nOnly pick one category from the list based on the message content.`,
            },
          ],
        },
      ],
    });
    const text = result.response.text();
    console.log("[read-inbox] model response:", text);
    const category_id = categories.find((c) => text.includes(c.name))?.id ?? null;
    console.log("[read-inbox] category_id:", category_id);
    return Response.json({
      date,
      ...values,
      category_id,
      modelResponse: text,
    });
  } else {
    console.log("[read-inbox] method not allowed:", req.method);
    return new Response("Method not allowed", {
      status: 405,
    });
  }
};
