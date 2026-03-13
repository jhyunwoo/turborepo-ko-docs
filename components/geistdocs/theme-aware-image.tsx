import type { ImageProps } from "next/image";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageAttrs {
  src: ImageProps["src"];
  alt: string;
  className?: string;
  props?: Omit<ImageProps, "src" | "alt">;
}

export function ThemeAwareImage({
  className,
  light,
  dark
}: {
  className?: string;
  light: ImageAttrs;
  dark: ImageAttrs;
}) {
  const images = (
    <>
      <Image
        alt={dark.alt}
        className={cn("hidden dark:block", dark.className)}
        src={dark.src}
        {...dark.props}
      />
      <Image
        alt={light.alt}
        className={cn("block dark:hidden", light.className)}
        src={light.src}
        {...light.props}
      />
    </>
  );

  return className ? <div className={className}>{images}</div> : images;
}
