import Navigation from "@/app/shared/layouts/Navigation";
import AnalyticsBoard from "./AnalyticsBoard";
import { serverAuthenticated } from "@/app/shared/actions/serverAuth";
import serverOwnBudget from "@/app/shared/actions/serverOwnBudget";
import serverOwnMovements from "@/app/shared/actions/serverOwnMovements";

export default async function Analytics() {
  const { supabase, session } = await serverAuthenticated();
  const budget = await serverOwnBudget(supabase, session);
  const movements = await serverOwnMovements(supabase, budget);

  return (
    <Navigation back>
      <AnalyticsBoard movements={movements} />
    </Navigation>
  );
}
