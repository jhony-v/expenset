"use client";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NavigationMobile() {
  const router = useRouter();
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="bordered">
          <Menu className="text-white" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        onAction={(key) => router.push(key.toString())}
        aria-label="Static Actions"
      >
        <DropdownItem key="/chat">Go AI</DropdownItem>
        <DropdownItem key="/analytics">Analytics</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
