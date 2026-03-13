import { DocsLayout as FumadocsDocsLayout } from "fumadocs-ui/layouts/docs";
import type { ComponentProps, CSSProperties, ReactNode } from "react";

export function DocsLayout({
  tree,
  children
}: {
  tree: ComponentProps<typeof FumadocsDocsLayout>["tree"];
  children: ReactNode;
}) {
  return (
    <FumadocsDocsLayout
      tree={tree}
      nav={{
        enabled: false
      }}
      searchToggle={{
        enabled: false
      }}
      themeSwitch={{
        enabled: false
      }}
      sidebar={{
        collapsible: false
      }}
      tabMode="auto"
      containerProps={{
        style: {
          "--fd-docs-row-1": "4.5rem"
        } as CSSProperties
      }}
    >
      {children}
    </FumadocsDocsLayout>
  );
}
