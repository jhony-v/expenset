import { Draft } from "@/app/shared/types";
import {
  Badge,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { LucideBell } from "lucide-react";
import { useState } from "react";
import dayjs from "dayjs";
import useCurrency from "@/app/shared/hooks/useCurrency";
import LockContent from "@/app/shared/components/LockContent";
import Icon from "@/app/shared/components/Icon";
import { CategoryOptions } from "@/app/shared/components/CategoryIcon";
import useGetCategories from "@/app/shared/hooks/useGetCategories";

export default function PendingDrafts({
  drafts,
  locked,
  onPressItem,
}: {
  drafts: Array<Draft>;
  locked: boolean;
  onPressItem(draft: Draft): void;
}) {
  const currency = useCurrency();
  const [open, setOpen] = useState(false);
  const { categories } = useGetCategories();
  const categoryOf = (draft: Draft) =>
    categories.find((c) => c.id === draft.category_id);

  return (
    <Popover placement="bottom-end" isOpen={open} onOpenChange={setOpen}>
      <Badge
        content={drafts.length}
        color="primary"
        size="sm"
        placement="top-left"
        isInvisible={drafts.length === 0}
      >
        <PopoverTrigger>
          <Button
            isIconOnly
            variant="flat"
            aria-label={`Pending movements (${drafts.length})`}
          >
            <LucideBell size={18} />
          </Button>
        </PopoverTrigger>
      </Badge>
      <PopoverContent className="w-80 p-0">
        <div className="w-full">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h3 className="text-zinc-200 text-sm font-medium">Pending</h3>
            <p className="text-zinc-400 text-xs">
              From your bank emails. Review to save them.
            </p>
          </div>
          {drafts.length === 0 ? (
            <p className="px-4 py-6 text-center text-zinc-400 text-sm">
              Nothing to review
            </p>
          ) : (
            <div className="max-h-96 overflow-y-auto p-1">
              {drafts.map((draft) => (
                <button
                  key={draft.id}
                  className="w-full flex gap-4 items-center text-left rounded-lg px-3 py-2 hover:bg-zinc-800"
                  onClick={() => {
                    setOpen(false);
                    onPressItem(draft);
                  }}
                >
                  <div className="w-8 h-8 shrink-0 rounded-full bg-zinc-800 grid place-items-center">
                    <Icon
                      name={CategoryOptions[categoryOf(draft)?.name ?? ""] ?? "receipt"}
                      size={15}
                    />
                  </div>
                  <div className="whitespace-normal min-w-0">
                    <p className="text-zinc-200 text-sm truncate">
                      <LockContent locked={locked} lockedContent="**************">
                        {draft.description || draft.subject || "No description"}
                      </LockContent>
                    </p>
                    <p className="text-zinc-400 text-xs">
                      {dayjs(draft.date ?? draft.created_at).format(
                        "DD/MM hh:mm a"
                      )}
                      {draft.bank && ` · ${draft.bank.toUpperCase()}`}
                      {` · ${categoryOf(draft)?.name ?? "No category"}`}
                    </p>
                  </div>
                  <div className="ml-auto text-sm text-slate-400 whitespace-nowrap">
                    <LockContent locked={locked}>
                      {currency(Number(draft.amount), draft.currency)}
                    </LockContent>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
