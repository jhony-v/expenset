import React from "react";
import Logo from "./Logo";
import Link from "next/link";
import { Button } from "@nextui-org/react";
import Back from "./Back";
import NavigationMobile from "./NavigationMobile";

export default function Navigation({
  children,
  back,
}: {
  children?: React.ReactNode;
  back?: boolean;
}) {
  return (
    <header className="flex justify-between mb-5 md:mb-10 mt-2 md:mt-5 items-center">
      <div className="flex gap-2 items-center">
        {back && <Back />}
        <Logo />
      </div>
      <div className="ml-auto flex gap-2 items-center md:hidden">
        <NavigationMobile />
        {children}
      </div>
      <div className="gap-2 ml-auto items-center hidden md:flex">
        <Link href="/chat">
          <Button size="sm" variant="flat">
            Go AI
          </Button>
        </Link>
        <Link href="/analytics">
          <Button size="sm" variant="flat">
            Analytics
          </Button>
        </Link>
        {children}
      </div>
    </header>
  );
}
