import {
  File as FumadocsFile,
  Files,
  Folder as FumadocsFolder
} from "fumadocs-ui/components/files";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export { Files };

type FileProps = ComponentProps<typeof FumadocsFile> & {
  green?: boolean;
};

export function File({ green, className, ...props }: FileProps) {
  return (
    <FumadocsFile
      className={cn(green ? "text-emerald-600 dark:text-emerald-400" : "", className)}
      {...props}
    />
  );
}

type FolderProps = ComponentProps<typeof FumadocsFolder> & {
  green?: boolean;
};

export function Folder({ green, className, ...props }: FolderProps) {
  return (
    <FumadocsFolder
      className={cn(green ? "text-emerald-600 dark:text-emerald-400" : "", className)}
      {...props}
    />
  );
}
