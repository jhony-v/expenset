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

  return (
    <Modal isOpen size="xl" onClose={onCancel}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2>Review movement</h2>
          {draft.subject && (
            <p className="text-xs text-zinc-400 font-normal">
              {draft.bank?.toUpperCase()} · {draft.subject}
            </p>
          )}
        </ModalHeader>
        <ModalBody className="grid gap-6">
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
