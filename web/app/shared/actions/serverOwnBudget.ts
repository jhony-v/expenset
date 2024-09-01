import { Session, SupabaseClient } from "@supabase/supabase-js";
import { Budget } from "../types";

export default async function serverOwnBudget(
  supabase: SupabaseClient,
  session: Session
) {
  return await (supabase
    .from("budget")
    .select()
    .eq("user_id", session?.user.id)
    .then((e) => e.data?.[0]) as Promise<Budget>);
}
