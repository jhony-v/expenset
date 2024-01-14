import { Movement } from "@/app/shared/types";
import {
  Card,
  CardBody,
  Checkbox,
  CheckboxGroup,
  Progress,
  cn,
} from "@nextui-org/react";
import { MovementType } from "../../constants";
import LockContent from "./LockContent";
import dayjs from "dayjs";
import useCurrency from "@/app/shared/hooks/useCurrency";
import { useState } from "react";

export default function History({
  locked,
  movements,
  loading,
  onPressItem,
  renderIsChecked,
}: {
  loading: boolean;
  locked: boolean;
  onPressItem(movement: Movement): void;
  movements: Array<Movement>;
  renderIsChecked(movement: Movement): boolean;
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
        <div className="grid xl:grid-cols-2 gap-3" aria-label="movements">
          {movements.map((movement) => {
            const isExpense = checkIsExpense(movement.type);

            return (
              <Card
                key={movement.id}
                className={cn(
                  renderIsChecked?.(movement) && "border-2",
                  renderIsChecked?.(movement) &&
                    (isExpense ? "border-danger" : "border-primary")
                )}
              >
                <CardBody
                  className={cn(
                    renderIsChecked?.(movement) &&
                      (isExpense ? "bg-danger-50" : "bg-primary-50")
                  )}
                >
                  <div
                    onClick={() => {
                      onPressItem(movement);
                    }}
                    className="flex gap-4"
                  >
                    <div className="flex items-center">
                      <Checkbox value={String(movement.id)} />
                    </div>
                    <div className="whitespace-normal">
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
                    <div
                      className={cn(
                        "ml-auto flex items-center",
                        isExpense ? "text-red-400" : "text-blue-400"
                      )}
                    >
                      <LockContent locked={locked}>
                        {`${isExpense ? "-" : "+"}${currency(movement.amount)}`}
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

const checkIsExpense = (type: string | MovementType) =>
  type === MovementType.EXPENSE;
