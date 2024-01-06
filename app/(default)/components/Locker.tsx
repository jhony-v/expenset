import { Switch } from "@nextui-org/react";
import UnlockModal from "./UnlockModal";
import { Budget } from "@/app/types";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function Locker({
  locked,
  onLocked,
  budget,
}: {
  locked: boolean;
  onLocked: (val: boolean) => void;
  budget: Budget;
}) {
  const supabase = createClientComponentClient();
  const [isLockModalOpen, setLockModalOpen] = useState(false);

  const handleUnlockView = async (lockPassword: string) => {
    if (lockPassword === budget.settings.locked.password) {
      onLocked(false);
      setLockModalOpen(false);
      await supabase
        .from("budget")
        .update({
          settings: {
            ...budget.settings,
            locked: {
              ...budget.settings.locked,
              active: false,
            },
          },
        })
        .eq("id", budget.id);
    } else {
      alert("invalid password");
    }
  };
  return (
    <div>
      {locked ? (
        <Switch
          isSelected={isLockModalOpen}
          onValueChange={(lockedValue) => {
            setLockModalOpen(lockedValue);
          }}
          aria-label="show money"
          name="show-money"
          size="sm"
        >
          <span className="text-gray-400">Show money</span>
        </Switch>
      ) : (
        <div>
          <Switch
            size="sm"
            color="primary"
            aria-label="hide money"
            isSelected
            name="hide-money"
            onClick={async () => {
              onLocked(true);
              await supabase
                .from("budget")
                .update({
                  settings: {
                    ...budget.settings,
                    locked: {
                      ...budget.settings.locked,
                      active: true,
                    },
                  },
                })
                .eq("id", budget.id);
            }}
          >
            <span className="text-gray-400">Hide money</span>
          </Switch>
        </div>
      )}
      <UnlockModal
        onUnlock={handleUnlockView}
        onOpenChange={setLockModalOpen}
        open={isLockModalOpen}
      />
    </div>
  );
}
