"use client";
import ProfileSection from "./ProfileSection";
import {
  LucideDollarSign,
  LucideLockKeyhole,
  LucidePiggyBank,
} from "lucide-react";
import { Button, Input, Switch } from "@nextui-org/react";
import { Budget } from "@/app/shared/types";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";

export default function ProfileForm({
  initialBudget: budget = {
    amount: 0,
    expense: 0,
    settings: {
      locked: { active: false },
      exchanges: {},
    },
  },
}: {
  initialBudget: Budget;
}) {
  const supabase = createClientComponentClient();
  const exchangesList = Object.keys(budget.settings.exchanges);
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-4 w-full mx-auto md:max-w-96"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          setLoading(true);
          const form = new FormData(e.target as HTMLFormElement);
          const payload: Budget = {
            amount: Number(form.get("amount") ?? budget.amount),
            expense: Number(form.get("expense") ?? budget.expense),
            settings: {
              ...budget.settings,
              locked: {
                active: form.get("active") === "" ? true : false,
              },
              exchanges: Object.fromEntries(
                exchangesList.map((exchange) => {
                  return [exchange, Number(form.get(`exchanges:${exchange}`))];
                })
              ),
            },
          };
          await supabase.from("budget").update(payload).eq("id", budget.id);
        } finally {
          setLoading(false);
        }
      }}
    >
      <ProfileSection title="My current budget" icon={<LucidePiggyBank />}>
        <Input
          label="Budget"
          placeholder="budget"
          name="amount"
          defaultValue={String(budget.amount)}
        />
        <Input
          name="expense"
          label="Expense"
          placeholder="expense"
          defaultValue={String(budget.expense)}
        />
      </ProfileSection>
      <ProfileSection title="My exchange rates" icon={<LucideDollarSign />}>
        {exchangesList.map((exchange) => {
          return (
            <Input
              type="number"
              key={exchange}
              label={exchange}
              name={`exchanges:${exchange}`}
              defaultValue={String(budget.settings.exchanges[exchange])}
            />
          );
        })}
      </ProfileSection>
      <ProfileSection title="My lock security" icon={<LucideLockKeyhole />}>
        <Switch name="active" defaultChecked={budget.settings.locked.active} />
      </ProfileSection>
      <Button isLoading={loading} color="primary" fullWidth type="submit">
        Save changes
      </Button>
      <Button
        fullWidth
        color="default"
        onClick={() => {
          supabase.auth.signOut();
          location.replace("/login");
        }}
      >
        Log out
      </Button>
    </form>
  );
}
