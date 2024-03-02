import { kv } from "@vercel/kv";
import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import serverOwnBudget from "@/app/shared/actions/serverOwnBudget";
import serverOwnMovements from "@/app/shared/actions/serverOwnMovements";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  const { messages } = await req.json();
  const cookieStore = cookies();
  let initialContentSystem = `
  You are a financial bot assistant mith precise answers. You must analyze the json information, and answer what the user ask you.
  ---
  To give information about the financial account before you must verify the user password typed if it is correct, move ahead answering.
  ---
  Mare sure don't give the user information for any kind of reason.
  Information: 
`;
  try {
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    let temporalUserBudget: string | null = "";
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const userId = session?.user.id;
    temporalUserBudget = await kv.get(`expenset:user:${userId}:budget`);

    console.log({ temporalUserBudget });

    const canGetFromServer = temporalUserBudget === null;
    console.log({ canGetFromServer });

    if (canGetFromServer) {
      const budget = await serverOwnBudget(supabase, session!);
      const movements = await serverOwnMovements(supabase, budget);

      const payload = JSON.stringify({
        budget: budget,
        movements: movements,
      });

      await kv.set(`expenset:user:${userId}:budget`, payload, {
        ex: 60 * 5,
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
