import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.21.0";
import * as postgres from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const databaseUrl = Deno.env.get("SUPABASE_DB_URL");
const pool = new postgres.Pool(databaseUrl, 3, true);

const ai = new GoogleGenerativeAI(Deno.env.get("GOOGLE_API_KEY") ?? "");
const model = Deno.env.get("GEMINI_MODEL") ?? "gemini-3.8-flash";

type Category = { id: number; name: string; description: string | null };

// Matches "S/ 1,234.50", "$/ 10.00" or "US$ 10.00" and returns the amount and currency.
const parseMoney = (line: string) => {
  const match = line.match(/(s\/|us\$|\$\/?)\s*([\d,]+(?:\.\d+)?)/i);
  if (!match) return null;
  return {
    amount: parseFloat(match[2].replaceAll(",", "")),
    currency: match[1].toLowerCase() === "s/" ? "PEN" : "USD",
  };
};

const extractValues = (body: string) => {
  const flat = body.toLowerCase();
  const bank = flat.includes("bcp")
    ? "bcp"
    : flat.includes("interbank")
      ? "interbank"
      : "unknown";
  let amount = 0;
  let currency = "";
  let description = "";
  // Both banks only notify purchases for now
  const type = "expense";
  for (const line of body.split("\n")) {
    const lower = line.toLowerCase();
    if (bank === "bcp") {
      if (lower.includes("total del consumo")) {
        const money = parseMoney(line);
        if (money) ({ amount, currency } = money);
      }
      if (lower.includes("empresa")) {
        description = line.match(/\*(.*)\*/)?.[1].trim() ?? description;
      }
    } else if (bank === "interbank") {
      if (lower.includes("moneda y monto")) {
        const money = parseMoney(line);
        if (money) ({ amount, currency } = money);
      }
      if (lower.includes("comercio")) {
        description = line.split(":").slice(1).join(":").trim() || description;
      }
    }
  }
  return { bank, amount, currency, description, type };
};

const pickCategory = async (categories: Category[], email: string) => {
  let text = "";
  try {
    const result = await ai.getGenerativeModel({ model }).generateContent(
      `You are an assistant that classifies a bank transaction into one of the following categories. Use each category's description to decide:\n\n${JSON.stringify(
        categories
      )}\n\nGiven this transaction message:\n\n"${email}"\n\nReturn a JSON like: { "category_id": number }\n\nOnly pick one category from the list based on the message content.`
    );
    text = result.response.text();
    console.log("[read-inbox] model response:", text);
  } catch (error) {
    console.error("[read-inbox] model error:", model, String(error));
  }
  const modelId = Number(text.match(/"category_id"\s*:\s*(\d+)/)?.[1]);
  return categories.find((c) => c.id === modelId)?.id ?? null;
};

Deno.serve(async (req) => {
  try {
    return await handler(req);
  } catch (error) {
    console.error("[read-inbox] error:", String(error));
    return Response.json({ error: String(error) }, { status: 500 });
  }
});

const handler = async (req: Request) => {
  if (req.method !== "POST") {
    console.log("[read-inbox] method not allowed:", req.method);
    return new Response("Method not allowed", { status: 405 });
  }
  const email = await req.json();
  console.log("[read-inbox] received:", email.id, email.subject, "| from:", email.from);
  const values = extractValues(email.body ?? "");
  console.log("[read-inbox] parsed:", JSON.stringify(values));
  if (!values.amount) {
    console.log("[read-inbox] no amount found, skipping:", email.id);
    return Response.json({ skipped: true });
  }

  const connection = await pool.connect();
  try {
    const ownerEmail = Deno.env.get("DRAFT_USER_EMAIL") || email.owner || "";
    const user = (
      await connection.queryObject<{ id: string }>`
        SELECT id FROM auth.users WHERE lower(email) = lower(${ownerEmail})`
    ).rows[0];
    if (!user) {
      const reason = `no user found for ${ownerEmail}`;
      console.log("[read-inbox] skipped:", reason);
      return Response.json({ skipped: true, reason });
    }

    const categories = (
      await connection.queryObject<Category>`
        SELECT id, name, description FROM category`
    ).rows.map((c) => ({ ...c, id: Number(c.id) }));
    console.log("[read-inbox] categories loaded:", categories.length);
    const category_id = await pickCategory(
      categories,
      `${email.subject}\n${email.body}`
    );
    console.log("[read-inbox] category_id:", category_id);

    const inserted = await connection.queryObject`
      INSERT INTO movement_draft
        (user_id, email_id, amount, currency, type, description, category_id, bank, date, subject)
      VALUES
        (${user.id}, ${email.id}, ${values.amount}, ${values.currency}, ${values.type},
         ${values.description}, ${category_id}, ${values.bank}, ${email.date ?? null}, ${email.subject})
      ON CONFLICT (email_id) DO NOTHING
      RETURNING id`;
    const draftId = inserted.rows.length ? inserted.rows[0] : null;
    console.log("[read-inbox] draft:", draftId ? "created" : "already exists", email.id);
    return Response.json({ ...values, category_id, draft: draftId });
  } finally {
    connection.release();
  }
};
