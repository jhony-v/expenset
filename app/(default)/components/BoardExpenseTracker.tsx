"use client";

import {
  Button,
  Card,
  CardBody,
  CircularProgress,
  Input,
  Spinner,
  Switch,
} from "@nextui-org/react";
import {
  Session,
  createClientComponentClient,
} from "@supabase/auth-helpers-nextjs";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Budget, Movement } from "@/app/types";
import Chart from "./Chart";
import History from "./History";
import OverviewBudget from "./OverviewBudget";
import Locker from "./Locker";

export default function BoardExpenseTracker({ session }: { session: Session }) {
  const supabase = createClientComponentClient();
  const userId = session.user.id;
  const navigation = useRouter();

  const {
    data: budget,
    refetch: refetchBudget,
    isFetching: fetchingBudget,
  } = useQuery({
    queryKey: ["budget"],
    queryFn: () =>
      supabase
        .from("budget")
        .select()
        .eq("user_id", userId)
        .then((e) => e.data?.[0]) as Promise<Budget>,
    initialData: {
      amount: 0,
      expense: 0,
      income: 0,
      settings: {
        locked: {
          active: false,
          password: "",
        },
      },
    },
  });

  const {
    data: movements,
    refetch: refetchMovement,
    isFetching: loadingMovements,
  } = useQuery({
    queryKey: ["movement"],
    enabled: budget.id !== undefined,
    queryFn: () =>
      supabase
        .from("movement")
        .select()
        .eq("budget_id", budget.id)
        .order("created_at", { ascending: false })
        .then((e) => e.data) as Promise<Array<Movement>>,
    initialData: [],
  });

  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [alterBudget, setAlterBudget] = useState(true);
  const [locked, setLocked] = useState(true);

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

  useEffect(() => {
    if (budget.id) {
      setLocked(budget.settings.locked.active);
    }
  }, [budget]);

  return (
    <div className="p-3 container mx-auto">
      <div className="flex justify-between mb-5 md:mb-10 mt-2 md:mt-5 items-center">
        <h1 className="text-lg font-semibold">My account</h1>
        <div className="ml-auto mr-6">
          <Locker locked={locked} onLocked={setLocked} budget={budget} />
        </div>
        <Button size="sm" color="primary" variant="flat" onClick={handleLogOut}>
          Log out
        </Button>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-grow">
          <div className="flex flex-col-reverse gap-6">
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
                      fetchingBudget ? (
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
                    onClick={handleSpend}
                    isDisabled={amount >= Math.floor(budget.amount) || locked}
                  >
                    Spend
                  </Button>
                  <Button
                    color="primary"
                    variant="shadow"
                    onClick={handleIncome}
                    isDisabled={locked}
                  >
                    Income
                  </Button>
                </div>
              </CardBody>
            </Card>
            <Chart movements={movements} locked={locked} />
          </div>
        </div>
        <div className=" md:w-unit-8xl space-y-6">
          <OverviewBudget budget={budget} locked={locked} />
          <History
            loading={loadingMovements}
            locked={locked}
            movements={movements}
          />
        </div>
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
