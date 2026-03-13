import {
  Callout as FumadocsCallout,
  CalloutContainer as FumadocsCalloutContainer,
  CalloutDescription as FumadocsCalloutDescription,
  CalloutTitle as FumadocsCalloutTitle
} from "fumadocs-ui/components/callout";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Callout({
  className,
  ...props
}: ComponentProps<typeof FumadocsCallout>) {
  return (
    <FumadocsCallout
      className={cn(
        "rounded-2xl border border-border/70 bg-card/75 shadow-none backdrop-blur-md",
        className
      )}
      {...props}
    />
  );
}

export function CalloutContainer(
  props: ComponentProps<typeof FumadocsCalloutContainer>
) {
  return <FumadocsCalloutContainer {...props} />;
}

export function CalloutTitle(
  props: ComponentProps<typeof FumadocsCalloutTitle>
) {
  return <FumadocsCalloutTitle {...props} />;
}

export function CalloutDescription(
  props: ComponentProps<typeof FumadocsCalloutDescription>
) {
  return <FumadocsCalloutDescription {...props} />;
}
