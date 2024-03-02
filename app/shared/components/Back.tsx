import Link from "next/link";
import { LucideArrowLeft } from "lucide-react";

export default function Back() {
  return (
    <Link href="/">
      <LucideArrowLeft />
    </Link>
  );
}
