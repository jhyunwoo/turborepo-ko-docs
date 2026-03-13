import {
  DocsBody as FumadocsDocsBody,
  DocsDescription as FumadocsDocsDescription,
  DocsPage as FumadocsDocsPage,
  DocsTitle as FumadocsDocsTitle
} from "fumadocs-ui/layouts/docs/page";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function DocsPage(props: ComponentProps<typeof FumadocsDocsPage>) {
  return <FumadocsDocsPage {...props} />;
}

export function DocsTitle({
  className,
  ...props
}: ComponentProps<typeof FumadocsDocsTitle>) {
  return (
    <FumadocsDocsTitle
      className={cn("text-balance text-4xl tracking-[-0.05em]", className)}
      {...props}
    />
  );
}

export function DocsDescription(
  props: ComponentProps<typeof FumadocsDocsDescription>
) {
  return <FumadocsDocsDescription {...props} />;
}

export function DocsBody({
  className,
  ...props
}: ComponentProps<typeof FumadocsDocsBody>) {
  return (
    <FumadocsDocsBody className={cn("mx-auto w-full", className)} {...props} />
  );
}
