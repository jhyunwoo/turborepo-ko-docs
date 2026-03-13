"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, House, Search } from "lucide-react";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { cn } from "@/lib/utils";

const SearchDialog = dynamic(
  () => import("@/components/site/search-dialog").then((mod) => mod.SearchDialog),
  {
    loading: () => (
      <button
        type="button"
        className="inline-flex h-11 min-w-44 items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 text-sm text-muted-foreground"
        aria-label="문서 검색"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">문서 검색</span>
        <span className="ml-auto hidden rounded-full border border-border/70 px-2 py-0.5 text-[11px] sm:inline">
          ⌘K
        </span>
      </button>
    )
  }
);

const navigation = [
  {
    href: "/",
    label: "홈",
    icon: House
  },
  {
    href: "/docs",
    label: "문서",
    icon: BookOpenText
  }
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/75 backdrop-blur-2xl">
      <div className="mx-auto flex h-[4.5rem] w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-10">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20">
            T
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-[-0.02em]">
              Turborepo 한국어 문서
            </p>
            <p className="truncate text-xs text-muted-foreground">
              정적 MDX 문서 사이트
            </p>
          </div>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-4">
          <SearchDialog />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
