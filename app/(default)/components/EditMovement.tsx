import { MovementType } from "@/app/constants";
import useCurrency from "@/app/shared/hooks/useCurrency";
import TrendingDown from "@/app/shared/icons/TrendingDown";
import TrendingUp from "@/app/shared/icons/TrendingUp";
import { Movement } from "@/app/shared/types";
import {
  Avatar,
  Button,
  Modal,
  ModalContent,
  Textarea,
} from "@nextui-org/react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function EditMovement({
  movement,
  onCancel,
  onSuccess,
}: {
  movement: Movement;
  onCancel: VoidFunction;
  onSuccess: VoidFunction;
}) {
  const currency = useCurrency();
  const supabase = createClientComponentClient();

  return (
    <Modal
      isOpen
      size="sm"
      onClose={() => {
        onCancel();
      }}
    >
      <ModalContent>
        <div className="flex flex-col gap-6 px-2 py-5 items-center">
          <Avatar
            icon={
              movement.type === MovementType.EXPENSE ? (
                <TrendingDown />
              ) : (
                <TrendingUp />
              )
            }
          />
          <h2 className="text-2xl text-center">{currency(movement.amount)}</h2>
          <form
            className="w-full space-y-2"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              await supabase
                .from("movement")
                .update({ description: form.get("description") })
                .eq("id", movement.id);
              onSuccess();
            }}
          >
            <Textarea
              name="description"
              defaultValue={movement.description}
              label="Edit description"
              placeholder="type new description..."
            />
            <Button color="primary" fullWidth type="submit">
              Update
            </Button>
          </form>
        </div>
      </ModalContent>
    </Modal>
  );
}
