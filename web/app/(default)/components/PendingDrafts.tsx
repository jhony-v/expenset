import { Draft } from "@/app/shared/types";
import { Card, CardBody, CardHeader, Chip } from "@nextui-org/react";
import dayjs from "dayjs";
import useCurrency from "@/app/shared/hooks/useCurrency";
import LockContent from "@/app/shared/components/LockContent";

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

  return (
    <Card aria-label="pending movements">
      <CardHeader className="flex gap-2 pb-0">
        <h3 className="text-zinc-200">Pending</h3>
        <Chip size="sm" color="warning" variant="flat">
          {drafts.length}
        </Chip>
      </CardHeader>
      <CardBody className="gap-1">
        {drafts.map((draft) => (
          <button
            key={draft.id}
            className="flex gap-4 items-center text-left rounded-lg px-2 py-2 hover:bg-zinc-800"
            onClick={() => onPressItem(draft)}
          >
            <div className="whitespace-normal min-w-0">
              <p className="text-zinc-200 text-sm truncate">
                <LockContent locked={locked} lockedContent="**************">
                  {draft.description || draft.subject || "No description"}
                </LockContent>
              </p>
              <p className="text-zinc-400 text-xs">
                {dayjs(draft.date ?? draft.created_at).format(
                  "DD/MM/YYYY hh:mm a"
                )}
                {draft.bank && ` · ${draft.bank.toUpperCase()}`}
              </p>
            </div>
            <div className="ml-auto text-sm text-slate-400 whitespace-nowrap">
              <LockContent locked={locked}>
                {currency(draft.amount, draft.currency)}
              </LockContent>
            </div>
          </button>
        ))}
      </CardBody>
    </Card>
  );
}
