import { kv } from "@vercel/kv";
import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  const { messages } = await req.json();
  let initialContentSystem = `
  You are a financial bot assistant. You must analyze the json information, and answer what the user ask you.
  ---
  To give information about the financial account before you must verify the user password typed if it is correct, move ahead answering.
  ---
  Mare sure don't give the user information for any kind of reason.
  Information: 
`;
  try {
    const supabase = createServerComponentClient({ cookies });

    let temporalUserBudget: string | null = "";
    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log({ session });

    const userId = session?.user.id;
    temporalUserBudget = await kv.get(`expenset:user:${userId}:budget`);

    console.log({ temporalUserBudget });

    if (temporalUserBudget === null) {
      const budget = await supabase
        .from("budget")
        .select()
        .eq("user_id", session?.user.id);

      console.log({ budget });

      const budgetId = budget.data?.[0].id;
      const movements = await supabase
        .from("movement")
        .select()
        .eq("budget_id", budgetId);

      console.log({ movements });
      const payload = JSON.stringify({
        budget: budget.data?.[0],
        movements: movements.data,
      });
      console.log("supabase");
      console.log({ payload });

      await kv.set(`expenset:user:${userId}:budget`, payload, {
        ex: 60 * 5,
      });
      temporalUserBudget = payload;
    } else {
      temporalUserBudget = JSON.stringify(temporalUserBudget);
      console.log("cache");
      console.log({ temporalUserBudget });
    }

    initialContentSystem += temporalUserBudget;

    console.log(initialContentSystem);
  } catch (error) {
    console.log("error");
    console.log(error);
  }

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    stream: true,
    temperature: 0.5,
    messages: [
      {
        role: "system",
        content: initialContentSystem,
      },
      ...messages,
    ],
  });

  const stream = OpenAIStream(response);

  return new StreamingTextResponse(stream);
}
