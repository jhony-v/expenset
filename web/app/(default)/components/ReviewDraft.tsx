import { Currency, CurrencyCode, MovementType } from "@/app/constants";
import { CategoryOptions } from "@/app/shared/components/CategoryIcon";
import Icon from "@/app/shared/components/Icon";
import useGetCategories from "@/app/shared/hooks/useGetCategories";
import { Draft } from "@/app/shared/types";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useState } from "react";
import dayjs from "dayjs";
import useCurrency from "@/app/shared/hooks/useCurrency";
import LockContent from "@/app/shared/components/LockContent";
import { Payload } from "./ExpenseManegementForm";

export default function ReviewDraft({
  draft,
  locked,
  onSave,
  onDiscard,
  onCancel,
}: {
  draft: Draft;
  locked: boolean;
  onSave(type: MovementType, payload: Payload): Promise<void>;
  onDiscard(): Promise<void>;
  onCancel: VoidFunction;
}) {
  const [amount, setAmount] = useState(Number(draft.amount));
  const [description, setDescription] = useState(draft.description ?? "");
  const [currency, setCurrency] = useState<Set<any>>(
    new Set([draft.currency ?? CurrencyCode.PEN])
  );
  const [type, setType] = useState<Set<any>>(
    new Set([draft.type ?? MovementType.EXPENSE])
  );
  const [category, setCategory] = useState<Set<any>>(
    new Set(draft.category_id ? [String(draft.category_id)] : [])
  );
  const [saving, setSaving] = useState<"save" | "discard" | null>(null);

  const { categories } = useGetCategories();
  const formatCurrency = useCurrency();
  const suggested = categories.find((c) => c.id === draft.category_id);

  return (
    <Modal isOpen size="xl" onClose={onCancel}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2>Review movement</h2>
          <p className="text-xs text-zinc-400 font-normal">
            Check the details from the email, adjust anything and save.
          </p>
        </ModalHeader>
        <ModalBody className="grid gap-6">
          <div className="rounded-xl bg-zinc-800/50 p-4 grid gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-zinc-800 grid place-items-center">
                <Icon
                  name={CategoryOptions[suggested?.name ?? ""] ?? "receipt"}
                  size={18}
                />
              </div>
              <div className="min-w-0">
                <p className="text-zinc-200 font-medium truncate">
                  {draft.description || "No description"}
                </p>
                <p className="text-zinc-400 text-xs">
                  {draft.type === MovementType.INCOME ? "Income" : "Expense"}
                </p>
              </div>
              <p
                className={`ml-auto text-lg font-medium whitespace-nowrap ${
                  draft.type === MovementType.INCOME
                    ? "text-green-300"
                    : "text-red-300"
                }`}
              >
                <LockContent locked={locked}>
                  {formatCurrency(Number(draft.amount), draft.currency)}
                </LockContent>
              </p>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm border-t border-zinc-700/60 pt-3">
              <dt className="text-zinc-400">Bank</dt>
              <dd className="text-zinc-200 text-right">
                {draft.bank?.toUpperCase() ?? "—"}
              </dd>
              <dt className="text-zinc-400">Date</dt>
              <dd className="text-zinc-200 text-right">
                {dayjs(draft.date ?? draft.created_at).format(
                  "DD/MM/YYYY hh:mm a"
                )}
              </dd>
              <dt className="text-zinc-400">Currency</dt>
              <dd className="text-zinc-200 text-right">{draft.currency}</dd>
              <dt className="text-zinc-400">Suggested category</dt>
              <dd className="text-zinc-200 text-right">
                {suggested ? (
                  <span title={suggested.description}>{suggested.name}</span>
                ) : (
                  "None, pick one below"
                )}
              </dd>
              {draft.subject && (
                <>
                  <dt className="text-zinc-400">Email</dt>
                  <dd className="text-zinc-200 text-right truncate">
                    {draft.subject}
                  </dd>
                </>
              )}
            </dl>
          </div>
          <p className="text-zinc-400 text-xs -mb-3">Edit before saving</p>
          <Input
            label="Amount"
            type="number"
            value={String(amount)}
            onValueChange={(e) => setAmount(Number(e))}
          />
          <Input
            label="Description"
            value={description}
            onValueChange={setDescription}
          />
          <div className="grid grid-cols-2 gap-6">
            <Select
              label="Currency"
              selectedKeys={currency}
              onSelectionChange={(e) => setCurrency(new Set(e))}
            >
              <SelectItem key={Currency.PEN.code} value={Currency.PEN.code}>
                PEN
              </SelectItem>
              <SelectItem key={Currency.USD.code} value={Currency.USD.code}>
                USD
              </SelectItem>
            </Select>
            <Select
              label="Type"
              selectedKeys={type}
              onSelectionChange={(e) => setType(new Set(e))}
            >
              <SelectItem key={MovementType.EXPENSE} value={MovementType.EXPENSE}>
                Expense
              </SelectItem>
              <SelectItem key={MovementType.INCOME} value={MovementType.INCOME}>
                Income
              </SelectItem>
            </Select>
          </div>
          <Select
            label="Category"
            selectedKeys={category}
            items={categories}
            onSelectionChange={(e) => setCategory(new Set(e))}
            renderValue={(items) => {
              return items.map((item) => (
                <div key={item.data?.id} className="flex items-center gap-4">
                  {item.data && (
                    <Icon name={CategoryOptions[item.data.name]} size={15} />
                  )}
                  {item.data?.name}
                </div>
              ));
            }}
          >
            {(item) => (
              <SelectItem
                key={item.id}
                value={item.id}
                textValue={item.name}
                description={item.description}
              >
                <div className="flex items-center gap-4">
                  <Icon name={CategoryOptions[item.name]} size={15} />
                  {item.name}
                </div>
              </SelectItem>
            )}
          </Select>
        </ModalBody>
        <ModalFooter className="grid grid-cols-2 gap-6">
          <Button
            variant="flat"
            color="danger"
            isLoading={saving === "discard"}
            isDisabled={saving !== null}
            onClick={async () => {
              setSaving("discard");
              await onDiscard().finally(() => setSaving(null));
            }}
          >
            Discard
          </Button>
          <Button
            color="primary"
            isLoading={saving === "save"}
            isDisabled={
              saving !== null || locked || amount <= 0 || category.size === 0
            }
            onClick={async () => {
              setSaving("save");
              await onSave([...type][0] ?? MovementType.EXPENSE, {
                amount,
                description,
                currency: [...currency][0] ?? CurrencyCode.PEN,
                category: Number([...category][0]),
                created_at: draft.date ?? undefined,
              }).finally(() => setSaving(null));
            }}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
