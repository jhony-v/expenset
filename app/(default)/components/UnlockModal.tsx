import { Button, Input, Modal, ModalContent } from "@nextui-org/react";
import React, { useState } from "react";

export default function UnlockModal({
  open,
  onOpenChange,
  onUnlock,
}: {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  onUnlock: (val: string) => void;
}) {
  const [lockPassword, setLockPassword] = useState("");

  return (
    <Modal isOpen={open} size="sm" onOpenChange={onOpenChange}>
      <ModalContent>
        <div className="space-y-6 p-2">
          <Input
            label="Password to view money"
            placeholder="type your own password"
            type="password"
            value={lockPassword}
            onValueChange={setLockPassword}
          />
          <Button
            fullWidth
            color="success"
            onClick={() => {
              onUnlock(lockPassword);
              setLockPassword("");
            }}
          >
            Unlock
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
