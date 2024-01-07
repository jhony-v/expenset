import { Budget } from "@/app/shared/types";
import { Card, CardBody } from "@nextui-org/react";
import LockContent from "./LockContent";
import { useFormatter } from "next-intl";
import useCurrency from "@/app/shared/hooks/useCurrency";

export default function OverviewBudget({
  budget,
  locked,
}: {
  budget: Budget;
  locked: boolean;
}) {
  const currency = useCurrency();

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-6 font-medium">
      <Card>
        <CardBody>
          Budget:
          <span className="text-green-400">
            <LockContent locked={locked}>{currency(budget.amount)}</LockContent>
          </span>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          Expense:
          <span className="text-red-400">
            <LockContent locked={locked}>
              {currency(budget.expense)}
            </LockContent>
          </span>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          Income:
          <span className="text-blue-400">
            <LockContent locked={locked}>{currency(budget.income)}</LockContent>
          </span>
        </CardBody>
      </Card>
    </div>
  );
}
