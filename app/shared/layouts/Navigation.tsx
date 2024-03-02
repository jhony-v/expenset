"use client";
import Logo from "../components/Logo";
import Link from "next/link";
import { Button } from "@nextui-org/react";
import Back from "../components/Back";

export default function Navigation({
  children,
  back,
}: {
  children?: React.ReactNode;
  back?: boolean;
}) {
  return (
    <div className="flex overflow-hidden h-full">
      <nav className="w-full md:w-auto fixed bottom-0 md:static h-12 md:h-auto flex-shrink-0 p-4 md:basis-52 flex md:block items-center">
        <div className="flex gap-2 items-center md:mb-4">
          {back && <Back />}
          <div className="hidden md:block">
            <Logo />
          </div>
        </div>
        <div className="flex md:grid gap-5 flex-1">
          <Link href="/chat" className="w-full">
            <Button size="sm" fullWidth variant="flat">
              Go AI
            </Button>
          </Link>
          <Link href="/profile" className="w-full">
            <Button size="sm" fullWidth variant="flat">
              Profile
            </Button>
          </Link>
          <Link href="/analytics" className="w-full">
            <Button size="sm" fullWidth variant="flat">
              Analytics
            </Button>
          </Link>
        </div>
      </nav>
      <main className="mb-12 md:mb-0 overflow-y-auto flex-1 p-4">
        {children}
      </main>
    </div>
  );
}
