import { Movement } from "@/app/shared/types";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  Checkbox,
  CheckboxGroup,
  Progress,
  cn,
} from "@nextui-org/react";
import { MovementType } from "../../constants";
import TrendingDown from "@/app/shared/icons/TrendingDown";
import TrendingUp from "@/app/shared/icons/TrendingUp";
import LockContent from "./LockContent";
import dayjs from "dayjs";
import useCurrency from "@/app/shared/hooks/useCurrency";
import { useState } from "react";

export default function History({
  locked,
  movements,
  loading,
  onPressItem,
}: {
  loading: boolean;
  locked: boolean;
  onPressItem(movement: Movement): void;
  movements: Array<Movement>;
}) {
  const currency = useCurrency();
  const [selectedMovements, setSelectedMovements] = useState<Array<string>>([]);

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
    <div className="flex whitespace-nowrap overflow-x-auto flex-col gap-5">
      <CheckboxGroup
        aria-label="selected movements"
        className="w-full"
        value={selectedMovements}
        onValueChange={setSelectedMovements}
      >
        <div className="space-y-3" aria-label="movements">
          {movements.map((movement) => {
            return (
              <Card key={movement.id}>
                <CardBody className="pl-0">
                  <div
                    onClick={() => {
                      onPressItem(movement);
                    }}
                    className="flex gap-4"
                  >
                    <div className="flex md:gap-unit-sm items-center">
                      <Checkbox value={String(movement.id)} />
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
                        <LockContent
                          locked={locked}
                          lockedContent="**************"
                        >
                          {movement.description}
                        </LockContent>
                      </p>
                      <p className="text-zinc-400 text-sm">
                        {dayjs(movement.created_at).format(
                          "DD/MM/YYYY hh:mm a"
                        )}
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
      </CheckboxGroup>
    </div>
  );
}
