import Board from "./components/Board";
import Navigation from "../shared/layouts/Navigation";
import { serverAuthenticated } from "../shared/actions/serverAuth";

export default async function Page() {
  const { session } = await serverAuthenticated();
  return (
    <Navigation>
      <Board session={session} />
    </Navigation>
  );
}
