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
import { useRouter } from "next/navigation";
import { useState } from "react";

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

  const handleLogOut = async () => {
    await supabase.auth.signOut();
    navigation.push("/login");
  };

  return (
    <div className="p-3 container mx-auto">
      <div className="flex justify-between mb-10 mt-5">
        <h1 className="text-xl ">Board expense tracker</h1>
        <Button size="sm" color="primary" variant="flat" onClick={handleLogOut}>
          Log out
        </Button>
      </div>
      <div className="space-y-6">
        <Card>
          <CardBody className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
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
            <div className="grid grid-cols-2 md:flex gap-6">
              <Button color="danger" onClick={handleSpend}>
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
              <span className="text-green-400">{budget.amount}</span>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              Expense:
              <span className="text-red-400">{budget.expense}</span>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              Income:
              <span className="text-blue-400">{budget.income}</span>
            </CardBody>
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
