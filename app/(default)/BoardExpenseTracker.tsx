"use client";

import {
  Button,
  Card,
  CardBody,
  Input,
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
import { useState } from "react";

export default function BoardExpenseTracker({ session }: { session: Session }) {
  const supabase = createClientComponentClient();
  const userId = session.user.id;

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

  const { data: movements, refetch: refetchMovement } = useQuery({
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
    await supabase.from("budget").update(body).eq("id", budget.id);
    refetchBudget();
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
    await supabase.from("budget").update(body).eq("id", budget.id);
    refetchBudget();
    await supabase.from("movement").insert({
      ...payload,
      type: "income",
      budget_id: budget.id,
    });
    refetchMovement();
  };

  return (
    <div className="p-3 container mx-auto">
      <h1 className="text-xl mb-5">Board expense tracker</h1>
      <div className="space-y-6">
        <Card>
          <CardBody className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Input
                label="Amount"
                placeholder="S/"
                type="number"
                value={String(amount)}
                onValueChange={(e) => setAmount(Number(e))}
              />
              <Input
                label="Description"
                placeholder="usage"
                value={description}
                onValueChange={(e) => setDescription(e)}
              />
            </div>
            <div className="flex gap-6 ">
              <Button color="danger" onClick={handleSpend}>
                Spend
              </Button>
              <Button color="primary" onClick={handleIncome}>
                Income
              </Button>
            </div>
          </CardBody>
        </Card>
        <div className="grid grid-cols-3 gap-6">
          <Card>
            <CardBody>Budget: {budget.amount}</CardBody>
          </Card>
          <Card>
            <CardBody>Expense: {budget.expense}</CardBody>
          </Card>
          <Card>
            <CardBody>Income: {budget.income}</CardBody>
          </Card>
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
                    <TableCell>{movement.amount}</TableCell>
                    <TableCell>{movement.type}</TableCell>
                    <TableCell>{movement.description}</TableCell>
                    <TableCell>{movement.created_at}</TableCell>
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
