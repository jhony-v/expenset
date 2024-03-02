import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import BoardExpenseTracker from "./components/BoardExpenseTracker";
import Navigation from "../shared/layouts/Navigation";

export default async function Page() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  const { data } = await supabase.auth.getSession();

  if (data.session)
    return (
      <Navigation>
        <BoardExpenseTracker session={data.session} />
      </Navigation>
    );

  return redirect("/login");
}
