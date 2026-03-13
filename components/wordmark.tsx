import Link from "next/link";
import { Boxes } from "lucide-react";
import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-3 text-sm font-semibold tracking-tight text-foreground",
        className
      )}
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-sm">
        <Boxes className="h-5 w-5" />
      </span>
      <span className="flex flex-col leading-none">
        <span>Turborepo 한국어 문서</span>
        <span className="text-xs font-medium text-muted-foreground">
          Static docs with Next.js + MDX
        </span>
      </span>
    </Link>
  );
}
