import Navigation from "@/app/shared/layouts/Navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function Profile() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  const { data } = await supabase.auth.getSession();
  return (
    <Navigation>
      <div>{JSON.stringify(data)}</div>
    </Navigation>
  );
}
