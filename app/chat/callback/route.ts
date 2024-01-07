import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const budget = await supabase
    .from("budget")
    .select()
    .eq("user_id", session?.user.id);

  const budgetId = budget.data?.[0].id;
  const movements = await supabase
    .from("movement")
    .select()
    .eq("budget_id", budgetId);

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    stream: true,
    messages: [
      {
        role: "system",
        content: `You are a financial bot assistant, you must provide accurate answers according the analytics of the user's budget, expenses, etc.
          You must analyze this information and answer what the user ask you.

          Information:
          Budget: ${JSON.stringify(budget.data)}
          Movements: ${JSON.stringify(movements.data)}

          `,
      },
      ...messages,
    ],
  });

  const stream = OpenAIStream(response);

  return new StreamingTextResponse(stream);
}
