import { Movement } from "@/app/types";
import { Avatar, Card, CardBody, Progress } from "@nextui-org/react";
import { MovementType } from "../constants";
import TrendingDown from "@/app/icons/TrendingDown";
import TrendingUp from "@/app/icons/TrendingUp";
import LockContent from "./LockContent";
import dayjs from "dayjs";
import useCurrency from "@/app/hooks/useCurrency";

export default function History({
  locked,
  movements,
  loading,
}: {
  loading: boolean;
  locked: boolean;
  movements: Array<Movement>;
}) {
  const currency = useCurrency();

  if (loading) {
    return (
      <Progress
        aria-label="loading movements"
        isIndeterminate
        size="sm"
        color="success"
        label="loading movements..."
      />
    );
  }

  return (
    <div className="space-y-3" aria-label="movements">
      {movements.map((movement) => {
        return (
          <Card key={movement.id}>
            <CardBody>
              <div className="flex gap-4">
                <div className="flex items-center">
                  <Avatar
                    icon={
                      movement.type === MovementType.EXPENSE ? (
                        <TrendingDown />
                      ) : (
                        <TrendingUp />
                      )
                    }
                  />
                </div>
                <div>
                  <p className="mb-unit-xs">
                    <LockContent locked={locked} lockedContent="**************">
                      {movement.description}
                    </LockContent>
                  </p>
                  <p className="text-zinc-400 text-sm">
                    {dayjs(movement.created_at).format("DD/MM/YYYY hh:mm a")}
                  </p>
                </div>
                <div className="ml-auto flex items-center">
                  <LockContent locked={locked}>
                    {currency(movement.amount)}
                  </LockContent>
                </div>
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
