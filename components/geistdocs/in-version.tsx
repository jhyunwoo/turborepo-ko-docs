import type { ReactNode } from "react";

export function InVersion({
  children
}: {
  version: string;
  children: ReactNode;
}) {
  return <>{children}</>;
}
