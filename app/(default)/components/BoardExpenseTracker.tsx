"use client";

import {
  Button,
  Card,
  CardBody,
  Checkbox,
  Input,
  Slider,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import {
  Session,
  createClientComponentClient,
} from "@supabase/auth-helpers-nextjs";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MovementType } from "../constants";
import TrendingDown from "@/app/icons/TrendingDown";
import TrendingUp from "@/app/icons/TrendingUp";
import LockContent from "./LockContent";
import dayjs from "dayjs";

export default function BoardExpenseTracker({ session }: { session: Session }) {
  const supabase = createClientComponentClient();
  const userId = session.user.id;
  const navigation = useRouter();

  const { data: budget, refetch: refetchBudget } = useQuery({
    queryKey: ["budget"],
    queryFn: () =>
      supabase
        .from("budget")
        .select()
        .eq("user_id", userId)
        .then((e) => e.data?.[0]),
    initialData: {
      amount: 0,
      expense: 0,
      income: 0,
    },
  });

  const {
    data: movements,
    isFetching: fetchingMovements,
    refetch: refetchMovement,
  } = useQuery({
    queryKey: ["movement"],
    enabled: budget.id !== undefined,
    queryFn: () =>
      supabase
        .from("movement")
        .select()
        .eq("budget_id", budget.id)
        .then((e) => e.data as any),
    initialData: [],
  });

  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [alterBudget, setAlterBudget] = useState(true);
  const [locked, setLocked] = useState(false);

  const payload = { amount, description };

  const reset = () => {
    setAmount(0);
    setDescription("");
  };

  const handleSpend = async () => {
    const body = {
      amount: budget.amount - payload.amount,
      expense: budget.expense + payload.amount,
    };
    reset();
    if (alterBudget) {
      await supabase.from("budget").update(body).eq("id", budget.id);
      refetchBudget();
    }
    await supabase.from("movement").insert({
      ...payload,
      type: "expense",
      budget_id: budget.id,
    });
    refetchMovement();
    reset();
  };

  const handleIncome = async () => {
    const body = {
      amount: budget.amount + payload.amount,
      income: budget.income + payload.amount,
    };
    reset();
    if (alterBudget) {
      await supabase.from("budget").update(body).eq("id", budget.id);
      refetchBudget();
    }
    await supabase.from("movement").insert({
      ...payload,
      type: "income",
      budget_id: budget.id,
    });
    refetchMovement();
  };

  const handleLogOut = async () => {
    await supabase.auth.signOut();
    navigation.push("/login");
  };

  return (
    <div className="p-3 container mx-auto">
      <div className="flex justify-between mb-5 md:mb-10 mt-2 md:mt-5">
        <h1 className="text-lg font-semibold">Board expense tracker</h1>
        <Button size="sm" color="primary" variant="flat" onClick={handleLogOut}>
          Log out
        </Button>
      </div>
      <div className="space-y-6">
        <Card>
          <CardBody className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Amount"
                  placeholder="S/00.00"
                  type="number"
                  value={String(amount)}
                  onValueChange={(e) => setAmount(Number(e))}
                />
                <Slider
                  minValue={0}
                  maxValue={budget.amount}
                  aria-label="range of amount typed"
                  size="sm"
                  value={amount}
                  onChange={(value) => setAmount(value as number)}
                  color={changeLimitColor(amount, budget.amount)}
                  className="mt-3"
                  marks={[
                    {
                      value: budget.amount * 0.1,
                      label: "10%",
                    },
                    {
                      value: budget.amount * 0.5,
                      label: "30%",
                    },
                    {
                      value: budget.amount * 0.8,
                      label: "60%",
                    },
                  ]}
                />
              </div>
              <Input
                label="Description"
                placeholder="What the money will be used for"
                value={description}
                onValueChange={(e) => setDescription(e)}
              />
            </div>
            <div>
              <Switch
                size="sm"
                isSelected={alterBudget}
                onValueChange={setAlterBudget}
              >
                Alter own budget
              </Switch>
            </div>
            <div className="grid grid-cols-2 md:flex gap-6">
              <Button
                color="danger"
                onClick={handleSpend}
                isDisabled={amount >= Math.floor(budget.amount)}
              >
                Spend
              </Button>
              <Button color="primary" onClick={handleIncome}>
                Income
              </Button>
            </div>
          </CardBody>
        </Card>
        <div className="grid grid-cols-3 gap-2 md:gap-6 font-medium">
          <Card>
            <CardBody>
              Budget:
              <span className="text-green-400">
                <LockContent locked={locked}>{budget.amount}</LockContent>
              </span>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              Expense:
              <span className="text-red-400">
                <LockContent locked={locked}>{budget.expense}</LockContent>
              </span>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              Income:
              <span className="text-blue-400">
                <LockContent locked={locked}>{budget.income}</LockContent>
              </span>
            </CardBody>
          </Card>
        </div>
        <div>
          <div>
            <Checkbox isSelected={locked} onValueChange={setLocked} size="sm">
              <span className="text-gray-400">
                {locked ? "Show money" : "Hide money"}
              </span>
            </Checkbox>
          </div>
        </div>
        <Card>
          <CardBody>
            <Table aria-label="movements">
              <TableHeader>
                <TableColumn>Amount</TableColumn>
                <TableColumn>Type</TableColumn>
                <TableColumn>Description</TableColumn>
                <TableColumn>Date</TableColumn>
              </TableHeader>
              <TableBody>
                {movements.map((movement: any) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      <LockContent locked={locked}>
                        {movement.amount}
                      </LockContent>
                    </TableCell>
                    <TableCell>
                      {movement.type === MovementType.EXPENSE ? (
                        <TrendingDown />
                      ) : (
                        <TrendingUp />
                      )}
                    </TableCell>
                    <TableCell>{movement.description}</TableCell>
                    <TableCell>
                      {dayjs(movement.created_at).format("DD/MM/YYYY hh:mm a")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function changeLimitColor(amount: number, maxAmount: number) {
  const percentage = (amount / maxAmount) * 100;
  if (percentage > 60) return "danger";
  if (percentage > 30) return "warning";
  if (percentage > 10) return "success";
  return "success";
}
