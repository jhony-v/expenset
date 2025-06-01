import { groq } from "@ai-sdk/groq";
import { extractReasoningMiddleware, streamText, wrapLanguageModel } from "ai";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import serverOwnBudget from "@/app/shared/actions/serverOwnBudget";
import serverOwnMovements from "@/app/shared/actions/serverOwnMovements";

export const runtime = "edge";

const model = wrapLanguageModel({
  model: groq("deepseek-r1-distill-llama-70b"),
  middleware: extractReasoningMiddleware({ tagName: "think" }),
});

export async function POST(req: Request) {
  const { messages } = await req.json();
  const cookieStore = cookies();
  const url = new URL(req.url);
  const baseUrl = url.origin;

  let initialContentSystem = `
  You are a financial bot assistant mith precise answers. You must analyze the json information, and answer what the user ask you IN PEN currency as total, if you need to calculate do it.
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
    const key = `expenset:user:${userId}:budget`;
    temporalUserBudget = await fetch(baseUrl + "/api/cache/redis?key=" + key)
      .then((res) => res.json())
      .then((data) => data.value);

    const canGetFromServer = temporalUserBudget === null;

    if (canGetFromServer) {
      const budget = await serverOwnBudget(supabase, session!);
      const movements = await serverOwnMovements(supabase, budget);

      const payload = JSON.stringify({
        budget: budget,
        movements: movements,
      });
      await fetch(baseUrl + "/api/cache/redis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key,
          value: payload,
        }),
      });
      temporalUserBudget = payload;
    } else {
      temporalUserBudget = JSON.stringify(temporalUserBudget || {});
    }

    initialContentSystem += temporalUserBudget;
  } catch (error) {
    console.log(error);
  }

  try {
    const result = streamText({
      model,
      messages: [
        {
          role: "system",
          content: initialContentSystem,
        },
        ...messages,
      ],
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
