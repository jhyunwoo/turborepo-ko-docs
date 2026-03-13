import type { ReactNode } from "react";
import { DocsLayout } from "@/components/geistdocs/docs-layout";
import { source } from "@/lib/source";

export default function DocsSectionLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return <DocsLayout tree={source.pageTree}>{children}</DocsLayout>;
}
