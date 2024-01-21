import Link from "next/link";
import ArrowLeft from "../icons/ArrowLeft";

export default function Back() {
  return (
    <Link href="/">
      <ArrowLeft />
    </Link>
  );
}
