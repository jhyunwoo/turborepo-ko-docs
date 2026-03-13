"use client";

import type { ReactElement, ReactNode } from "react";
import { Children, cloneElement, isValidElement } from "react";
import { Tab, Tabs as FumadocsTabs } from "fumadocs-ui/components/tabs";

export { Tab };

export function Tabs({
  storageKey,
  items,
  children,
  ...props
}: {
  storageKey?: string;
  items: string[];
  children: ReactNode;
}) {
  return (
    <FumadocsTabs id={storageKey} items={items} {...props}>
      {children}
    </FumadocsTabs>
  );
}

const packageManagers = ["pnpm", "yarn", "npm", "bun"];

type TabElement = ReactElement<{
  value: string;
}>;

function onlyTabs(children: ReactNode) {
  return Children.toArray(children).filter(
    (child): child is TabElement => isValidElement(child)
  );
}

export function PackageManagerTabs({ children }: { children: ReactNode }) {
  const childElements = onlyTabs(children);

  return (
    <FumadocsTabs groupId="package-manager" items={packageManagers} persist>
      {childElements.map((child, index) =>
        cloneElement(child, {
          ...child.props,
          value: packageManagers[index]
        })
      )}
    </FumadocsTabs>
  );
}

export function PlatformTabs({ children }: { children: ReactNode }) {
  const items = ["UNIX", "Windows"];
  const childElements = onlyTabs(children);

  return (
    <FumadocsTabs groupId="platform-tabs" items={items} persist>
      {childElements.map((child, index) =>
        cloneElement(child, {
          ...child.props,
          value: items[index]
        })
      )}
    </FumadocsTabs>
  );
}
