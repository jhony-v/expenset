import Navigation from "@/app/shared/components/Navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import AnalyticsBoard from "./AnalyticsBoard";
import { Budget, Movement } from "@/app/shared/types";

export default async function Analytics() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const budget = await (supabase
    .from("budget")
    .select()
    .eq("user_id", session?.user.id)
    .then((e) => e.data?.[0]) as Promise<Budget>);

  const movements = await supabase
    .from("movement")
    .select(
      `
      id,
      amount,
      created_at,
      description,
      type,
      category (
        id,
        name
      )
    `
    )
    .eq("budget_id", budget.id)
    .then(({ data }) => data);

  return (
    <div className="px-4 container mx-auto">
      <Navigation back />
      <AnalyticsBoard
        movements={movements as any as Array<Movement>}
        budget={budget}
      />
    </div>
  );
}
