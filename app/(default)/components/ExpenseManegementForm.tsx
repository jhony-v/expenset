import { Currency } from "@/app/constants";
import { CategoryOptions } from "@/app/shared/components/CategoryIcon";
import Icon from "@/app/shared/components/Icon";
import useGetCategories from "@/app/shared/hooks/useGetCategories";
import { Budget } from "@/app/shared/types";
import {
  Button,
  Card,
  CardBody,
  CircularProgress,
  Input,
  Select,
  SelectItem,
  Spinner,
} from "@nextui-org/react";
import { memo, useState } from "react";

export type Payload = {
  amount: number;
  description: string;
  currency: number;
  category: number;
};

export default memo(function ExpenseManegementForm({
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
  const [currency, setCurrency] = useState<Set<any>>(
    new Set([String(Currency.PEN.code)])
  );
  const [category, setCategory] = useState<Set<any>>(new Set([]));

  const { categories } = useGetCategories();

  const payload = {
    amount,
    description,
    currency: Number([...currency][0] ?? 0),
    category: Number([...category][0] ?? 0),
  };

  const reset = () => {
    setAmount(0);
    setDescription("");
  };

  return (
    <Card>
      <CardBody className="space-y-6">
        <div className="grid gap-6">
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
          <Select
            label="Currency"
            selectedKeys={currency}
            onSelectionChange={(e) => setCurrency(new Set(e))}
          >
            <SelectItem key={Currency.PEN.code} value={Currency.PEN.code}>
              PEN
            </SelectItem>
            <SelectItem key={Currency.USD.code} value={Currency.USD.code}>
              USD
            </SelectItem>
          </Select>
          <Select
            label="Category"
            selectedKeys={category}
            items={categories}
            onSelectionChange={(e) => {
              setCategory(new Set(e));
            }}
            renderValue={(items) => {
              return items.map((item) => (
                <div key={item.data?.id} className="flex items-center gap-4">
                  {item.data && (
                    <Icon name={CategoryOptions[item.data.name]} size={15} />
                  )}
                  {item.data?.name}
                </div>
              ));
            }}
          >
            {(item) => (
              <SelectItem key={item.id} value={item.id} textValue={item.name}>
                <div className="flex items-center gap-4">
                  <Icon name={CategoryOptions[item.name]} size={15} />
                  {item.name}
                </div>
              </SelectItem>
            )}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <Button
            color="primary"
            className="bg-purple-600"
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
});

function changeLimitColor(amount: number, maxAmount: number) {
  const percentage = (amount / maxAmount) * 100;
  if (percentage > 60) return "danger";
  if (percentage > 30) return "warning";
  if (percentage > 10) return "success";
  return "success";
}
