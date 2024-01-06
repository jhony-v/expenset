import { ReactNode } from "react";

export default function LockContent({
  locked,
  children,
  lockedContent = "****",
}: {
  locked: boolean;
  lockedContent?: string | ReactNode;
  children: ReactNode;
}) {
  return locked ? lockedContent : children;
}
