import { SupabaseClient } from "@supabase/supabase-js";
import { Budget, Movement } from "../types";

export default async function serverOwnMovements(
  supabase: SupabaseClient,
  budget: Budget
) {
  const movements = await supabase
    .from("movement")
    .select(
      `
      id,
      amount,
      currency,
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
    .order("created_at", { ascending: false })
    .then(({ data }) => data);
  return movements as any as Array<Movement>;
}
