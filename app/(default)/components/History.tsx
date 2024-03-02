import { motion } from "framer-motion";
import { Movement } from "@/app/shared/types";
import { Avatar, Card, CardBody, Progress, cn } from "@nextui-org/react";
import { MovementType } from "../../constants";
import LockContent from "../../shared/components/LockContent";
import dayjs from "dayjs";
import useCurrency from "@/app/shared/hooks/useCurrency";
import React, { useState } from "react";
import Icon from "@/app/shared/components/Icon";
import { CategoryOptions } from "@/app/shared/components/CategoryIcon";

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
      <div className="grid xl:grid-cols-2 gap-3" aria-label="movements">
        {movements.map((movement) => {
          return (
            <HistoryItem
              key={movement.id}
              movement={movement}
              locked={locked}
              onPressItem={onPressItem}
              renderIsChecked={renderIsChecked}
            />
          );
        })}
      </div>
    </div>
  );
}

function HistoryItem({
  movement,
  locked,
  onPressItem,
  renderIsChecked,
}: Pick<
  React.ComponentPropsWithoutRef<typeof History>,
  "locked" | "onPressItem" | "renderIsChecked"
> & { movement: Movement }) {
  const isExpense = checkIsExpense(movement.type);
  const currency = useCurrency();
  const [showing, setShowing] = useState(false);

  return (
    <Card
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
        <div className="flex gap-2 w-full overflow-hidden relative">
          <motion.div
            drag="x"
            animate={{ translateX: showing ? -50 : 0 }}
            dragConstraints={{ left: 0, right: 0 }}
            className="flex gap-4 w-full"
            onDrag={(e: PointerEvent) => {
              if (e.movementX < -10) {
                setShowing(true);
              }
              if (e.movementX > 10) {
                setShowing(false);
              }
            }}
          >
            <div className="flex items-center">
              <Avatar
                fallback={
                  movement.category && (
                    <Icon
                      name={CategoryOptions[movement.category.name]}
                      size={16}
                      className="text-zinc-200"
                    />
                  )
                }
                size="sm"
              />
            </div>
            <div className="whitespace-normal">
              <p className="mb-unit-xs text-zinc-200 text-ellipsis">
                <LockContent locked={locked} lockedContent="**************">
                  {movement.description}
                </LockContent>
              </p>
              <p className="text-zinc-400 text-xs">
                {dayjs(movement.created_at).format("DD/MM/YYYY hh:mm a")}
              </p>
            </div>
            <div
              className={cn(
                "ml-auto flex items-center text-sm",
                isExpense ? "text-purple-400" : "text-blue-400"
              )}
            >
              <LockContent locked={locked}>
                {`${isExpense ? "-" : "+"}${currency(
                  movement.amount,
                  movement.currency
                )}`}
              </LockContent>
            </div>
          </motion.div>
          <motion.div
            className="w-[40px] absolute right-0 rounded-lg bg-zinc-800 p-3 flex items-center justify-center h-full"
            animate={{
              translateX: showing ? 0 : 40,
            }}
            onClick={() => {
              setShowing(false);
              onPressItem(movement);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m18 5-3-3H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2" />
              <path d="M8 18h1" />
              <path d="M18.4 9.6a2 2 0 1 1 3 3L17 17l-4 1 1-4Z" />
            </svg>
          </motion.div>
        </div>
      </CardBody>
    </Card>
  );
}

const checkIsExpense = (type: string | MovementType) =>
  type === MovementType.EXPENSE;
