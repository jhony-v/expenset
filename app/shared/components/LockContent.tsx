import { ReactNode, memo } from "react";

export default memo(function LockContent({
  locked,
  children,
  lockedContent = "****",
}: {
  locked: boolean;
  lockedContent?: string | ReactNode;
  children: ReactNode;
}) {
  return locked ? lockedContent : children;
});
