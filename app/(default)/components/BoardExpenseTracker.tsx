"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import {
  Session,
  createClientComponentClient,
} from "@supabase/auth-helpers-nextjs";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { Budget, Movement } from "@/app/shared/types";
import Chart from "./Chart";
import History from "./History";
import OverviewBudget from "./OverviewBudget";
import Locker from "./Locker";
import ExpenseManegementForm, { Payload } from "./ExpenseManegementForm";
import EditMovement from "./EditMovement";
import { LucidePlus } from "lucide-react";
import { MovementType } from "@/app/constants";

export default function BoardExpenseTracker({ session }: { session: Session }) {
  const supabase = createClientComponentClient();
  const userId = session.user.id;

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

  const [showForm, setShowForm] = useState(false);
  const [locked, setLocked] = useState(true);
  const [currentMovement, setCurrentMovement] = useState<Movement | null>(null);
  const [crosshairMovements, setCrosshairMovements] = useState<{
    expense: Set<number>;
    income: Set<number>;
  } | null>(null);

  const handleSpend = useCallback(
    async ({ amount, description, currency, category }: Payload) => {
      const body = {
        amount: budget.amount - amount,
        expense: budget.expense + amount,
      };
      await supabase.from("budget").update(body).eq("id", budget.id);
      refetchBudget();
      await supabase.from("movement").insert({
        amount,
        description,
        type: MovementType.EXPENSE,
        budget_id: budget.id,
        category_id: category,
        currency,
      });
      refetchMovement();
    },
    [budget, supabase, refetchBudget, refetchMovement]
  );

  const handleIncome = useCallback(
    async ({ amount, description, currency, category }: Payload) => {
      const body = {
        amount: budget.amount + amount,
      };
      await supabase.from("budget").update(body).eq("id", budget.id);
      refetchBudget();
      await supabase.from("movement").insert({
        amount,
        description,
        type: MovementType.INCOME,
        budget_id: budget.id,
        category_id: category,
        currency,
      });
      refetchMovement();
    },
    [budget, supabase, refetchBudget, refetchMovement]
  );

  useEffect(() => {
    if (budget.id) {
      setLocked(budget.settings.locked.active);
    }
  }, [budget]);

  return (
    <div className="w-full flex-1">
      <section className="flex flex-col lg:flex-row gap-6 mt-2">
        <div className="flex-1">
          <Chart
            movements={movements}
            locked={locked}
            onCrosshairMoveData={setCrosshairMovements}
            headerComponent={
              <div className="ml-auto">
                <Locker locked={locked} onLocked={setLocked} budget={budget} />
              </div>
            }
          />
        </div>
        <div className="lg:w-unit-9xl space-y-6 mb-10">
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
      <Button
        isIconOnly
        className="rounded-full fixed right-5 md:right-10 bottom-10"
        color="primary"
        size="lg"
        onClick={() => setShowForm(true)}
      >
        <LucidePlus />
      </Button>
      <Modal isOpen={showForm} onOpenChange={setShowForm} size="xl">
        <ModalContent>
          <ModalHeader>
            <h2>Add new movement</h2>
          </ModalHeader>
          <ModalBody>
            {showForm && (
              <ExpenseManegementForm
                budget={budget}
                locked={locked}
                loading={fetchingBudget}
                onDeposit={handleIncome}
                onSpend={handleSpend}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
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
