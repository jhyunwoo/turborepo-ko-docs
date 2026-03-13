"use client";

import { RootProvider } from "fumadocs-ui/provider/next";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
    >
      <RootProvider>{children}</RootProvider>
    </ThemeProvider>
  );
}
