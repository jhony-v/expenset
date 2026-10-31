import { Session, SupabaseClient } from "@supabase/supabase-js";
import { Draft } from "../types";

export default async function serverOwnDrafts(
  supabase: SupabaseClient,
  session: Session
) {
  const drafts = await supabase
    .from("movement_draft")
    .select()
    .eq("user_id", session.user.id)
    .order("date", { ascending: false })
    .then(({ data }) => data);
  return (drafts ?? []) as Array<Draft>;
}
