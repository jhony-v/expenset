import Navigation from "@/app/shared/layouts/Navigation";
import { serverAuthenticated } from "@/app/shared/actions/serverAuth";
import serverOwnBudget from "@/app/shared/actions/serverOwnBudget";
import ProfileForm from "../components/ProfileForm";

export default async function Profile() {
  const { supabase, session } = await serverAuthenticated();
  const budget = await serverOwnBudget(supabase, session);

  return (
    <Navigation back>
      <ProfileForm initialBudget={budget} />
    </Navigation>
  );
}
