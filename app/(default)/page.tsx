import BoardExpenseTracker from "./components/BoardExpenseTracker";
import Navigation from "../shared/layouts/Navigation";
import { serverAuthenticated } from "../shared/actions/serverAuth";

export default async function Page() {
  const { session } = await serverAuthenticated();
  return (
    <Navigation>
      <BoardExpenseTracker session={session} />
    </Navigation>
  );
}
