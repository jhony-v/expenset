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
  Information: 
`;
  try {
    const supabase = createServerComponentClient({ cookies });

    let temporalUserBudget: string | null = "";
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const userId = session?.user.id;
    temporalUserBudget = await kv.get(`expenset:user:${userId}:budget`);

    if (temporalUserBudget === null) {
      const budget = await supabase
        .from("budget")
        .select()
        .eq("user_id", session?.user.id);

      const budgetId = budget.data?.[0].id;
      const movements = await supabase
        .from("movement")
        .select()
        .eq("budget_id", budgetId);

      const payload = JSON.stringify({
        budget: budget.data?.[0],
        movements: movements.data,
      });
      await kv.set(`expenset:user:${userId}:budget`, payload, {
        ex: 60 * 5,
        nx: true,
      });
      temporalUserBudget = payload;
    } else {
      temporalUserBudget = JSON.stringify(temporalUserBudget);
    }

    initialContentSystem += temporalUserBudget;

    console.log(initialContentSystem);
  } catch (error) {
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
