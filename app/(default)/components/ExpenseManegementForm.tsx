import { Budget } from "@/app/shared/types";
import {
  Button,
  Card,
  CardBody,
  CircularProgress,
  Input,
  Spinner,
  Switch,
} from "@nextui-org/react";
import { useState } from "react";

export type Payload = {
  alterBudget: boolean;
  amount: number;
  description: string;
};

export default function ExpenseManegementForm({
  locked,
  loading,
  budget,
  onDeposit,
  onSpend,
}: {
  locked: boolean;
  loading: boolean;
  budget: Budget;
  onSpend(payload: Payload): void;
  onDeposit(payload: Payload): void;
}) {
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [alterBudget, setAlterBudget] = useState(true);

  const payload = { alterBudget, amount, description };

  const reset = () => {
    setAmount(0);
    setDescription("");
  };

  return (
    <Card>
      <CardBody className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Input
            label="Amount"
            placeholder="S/00.00"
            type="number"
            readOnly={locked}
            value={String(amount)}
            onValueChange={(e) => setAmount(Number(e))}
            endContent={
              loading ? (
                <Spinner color="success" />
              ) : (
                <CircularProgress
                  minValue={0}
                  maxValue={budget.amount}
                  value={amount}
                  showValueLabel
                  aria-label="amount"
                  color={changeLimitColor(amount, budget.amount)}
                />
              )
            }
          />
          <Input
            readOnly={locked}
            label="Description"
            placeholder="What the money will be used for"
            value={description}
            onValueChange={setDescription}
          />
        </div>
        <div className="flex gap-6">
          <Switch
            size="sm"
            isDisabled={locked}
            isSelected={alterBudget}
            onValueChange={setAlterBudget}
          >
            <span className="text-gray-400">Alter own budget</span>
          </Switch>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <Button
            color="danger"
            variant="shadow"
            onClick={() => {
              reset();
              onSpend(payload);
            }}
            isDisabled={
              amount >= Math.floor(budget.amount) || locked || amount <= 0
            }
          >
            Spend
          </Button>
          <Button
            color="primary"
            variant="shadow"
            onClick={() => {
              reset();
              onDeposit(payload);
            }}
            isDisabled={locked || amount <= 0}
          >
            Income
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

function changeLimitColor(amount: number, maxAmount: number) {
  const percentage = (amount / maxAmount) * 100;
  if (percentage > 60) return "danger";
  if (percentage > 30) return "warning";
  if (percentage > 10) return "success";
  return "success";
}