import { Budget } from "@/app/shared/types";
import { Card, CardBody } from "@nextui-org/react";
import LockContent from "../../shared/components/LockContent";
import useCurrency from "@/app/shared/hooks/useCurrency";
import { memo } from "react";

export default memo(function OverviewBudget({
  budget,
  locked,
}: {
  budget: Budget;
  locked: boolean;
}) {
  const currency = useCurrency();

  return (
    <div className="grid grid-cols-2 gap-2 md:gap-6 font-medium">
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-2 justify-between">
            <span>Budget:</span>
            <span className="text-green-400">
              <LockContent locked={locked}>
                {currency(budget.amount)}
              </LockContent>
            </span>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-2 justify-between">
            <span>Expense:</span>
            <span className="text-purple-400">
              <LockContent locked={locked}>
                {currency(budget.expense)}
              </LockContent>
            </span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
});
