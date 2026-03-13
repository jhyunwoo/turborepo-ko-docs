import type { MDXComponents } from "mdx/types";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { Accordion, Accordions } from "@/components/geistdocs/accordion";
import { Callout, CalloutContainer, CalloutDescription, CalloutTitle } from "@/components/geistdocs/callout";
import { Card, Cards } from "@/components/geistdocs/card";
import { ExamplesTable } from "@/components/geistdocs/examples-table";
import { ExperimentalBadge } from "@/components/geistdocs/experimental-badge";
import { File, Files, Folder } from "@/components/geistdocs/files";
import { InVersion } from "@/components/geistdocs/in-version";
import { LinkToDocumentation } from "@/components/geistdocs/link-to-documentation";
import { Step, Steps } from "@/components/geistdocs/steps";
import { PackageManagerTabs, PlatformTabs, Tab, Tabs } from "@/components/geistdocs/tabs";
import { ThemeAwareImage } from "@/components/geistdocs/theme-aware-image";

export function getMDXComponents({
  components
}: {
  components?: MDXComponents;
} = {}): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...components,
    Accordion,
    Accordions,
    Callout,
    CalloutContainer,
    CalloutDescription,
    CalloutTitle,
    Card,
    Cards,
    ExamplesTable,
    ExperimentalBadge,
    File,
    Files,
    Folder,
    InVersion,
    LinkToDocumentation,
    PackageManagerTabs,
    PlatformTabs,
    Step,
    Steps,
    Tab,
    Tabs,
    ThemeAwareImage
  };
}
