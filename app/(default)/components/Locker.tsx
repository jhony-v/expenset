import { Button } from "@nextui-org/react";
import UnlockModal from "./UnlockModal";
import { Budget } from "@/app/shared/types";
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
        <Button
          size="sm"
          variant="light"
          onClick={() => {
            setLockModalOpen(true);
          }}
          aria-label="show money"
        >
          Show money
        </Button>
      ) : (
        <div>
          <Button
            size="sm"
            variant="light"
            aria-label="hide money"
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
            Hide money
          </Button>
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
