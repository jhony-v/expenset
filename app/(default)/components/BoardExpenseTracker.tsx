"use client";

import { Button } from "@nextui-org/react";
import {
  Session,
  createClientComponentClient,
} from "@supabase/auth-helpers-nextjs";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Budget, Movement } from "@/app/shared/types";
import Chart from "./Chart";
import History from "./History";
import OverviewBudget from "./OverviewBudget";
import Locker from "./Locker";
import ExpenseManegementForm, { Payload } from "./ExpenseManegementForm";
import EditMovement from "./EditMovement";
import Navigation from "@/app/shared/components/Navigation";

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
    isLoading: loadingMovements,
  } = useQuery({
    queryKey: ["movement"],
    enabled: budget.id !== undefined,
    queryFn: () =>
      supabase
        .from("movement")
        .select(
          `
          id,
          amount,
          created_at,
          description,
          type,
          category (
            id,
            name
          )
        `
        )
        .eq("budget_id", budget.id)
        .order("created_at", { ascending: false })
        .then((e) => e.data) as Promise<Array<Movement>>,
    initialData: [],
  });

  const [locked, setLocked] = useState(true);
  const [currentMovement, setCurrentMovement] = useState<Movement | null>(null);
  const [crosshairMovements, setCrosshairMovements] = useState<{
    expense: Set<number>;
    income: Set<number>;
  } | null>(null);

  const handleSpend = useCallback(
    async ({ amount, description }: Payload) => {
      const body = {
        amount: budget.amount - amount,
        expense: budget.expense + amount,
      };
      await supabase.from("budget").update(body).eq("id", budget.id);
      refetchBudget();
      await supabase.from("movement").insert({
        amount,
        description,
        type: "expense",
        budget_id: budget.id,
      });
      refetchMovement();
    },
    [budget, supabase, refetchBudget, refetchMovement]
  );

  const handleIncome = useCallback(
    async ({ amount, description }: Payload) => {
      const body = {
        amount: budget.amount + amount,
        income: budget.income + amount,
      };
      await supabase.from("budget").update(body).eq("id", budget.id);
      refetchBudget();
      await supabase.from("movement").insert({
        amount,
        description,
        type: "income",
        budget_id: budget.id,
      });
      refetchMovement();
    },
    [budget, supabase, refetchBudget, refetchMovement]
  );

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
      <Navigation>
        <Locker locked={locked} onLocked={setLocked} budget={budget} />
        <Button size="sm" color="primary" variant="flat" onClick={handleLogOut}>
          Log out
        </Button>
      </Navigation>
      <section className="flex flex-col md:flex-row gap-6">
        <div className="flex-grow">
          <div className="flex flex-col-reverse gap-6">
            <ExpenseManegementForm
              budget={budget}
              locked={locked}
              loading={fetchingBudget}
              onDeposit={handleIncome}
              onSpend={handleSpend}
            />
            <Chart
              movements={movements}
              locked={locked}
              onCrosshairMoveData={setCrosshairMovements}
            />
          </div>
        </div>
        <div className=" md:w-unit-9xl space-y-6">
          <OverviewBudget budget={budget} locked={locked} />
          <History
            loading={loadingMovements}
            locked={locked}
            movements={movements}
            onPressItem={setCurrentMovement}
            renderIsChecked={(movement) => {
              if (crosshairMovements === null) return false;
              return new Set([
                ...crosshairMovements.expense,
                ...crosshairMovements.income,
              ]).has(movement.id);
            }}
          />
        </div>
      </section>
      {currentMovement && (
        <EditMovement
          movement={currentMovement}
          onSuccess={() => {
            refetchMovement();
            setCurrentMovement(null);
          }}
          onCancel={() => setCurrentMovement(null)}
        />
      )}
    </div>
  );
}
