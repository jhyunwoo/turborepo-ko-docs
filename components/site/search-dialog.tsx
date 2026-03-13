"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type SearchEntry = {
  title: string;
  description: string;
  url: string;
  section: string;
  headings: string[];
  body: string;
};

const MAX_RESULTS = 8;

function normalize(value: string) {
  return value.toLocaleLowerCase("ko-KR").trim();
}

function scoreEntry(entry: SearchEntry, query: string) {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return 0;
  }

  let score = 0;

  if (normalize(entry.title).includes(normalizedQuery)) {
    score += 8;
  }

  if (normalize(entry.description).includes(normalizedQuery)) {
    score += 5;
  }

  if (entry.headings.some((heading) => normalize(heading).includes(normalizedQuery))) {
    score += 4;
  }

  if (normalize(entry.body).includes(normalizedQuery)) {
    score += 2;
  }

  return score;
}

function extractSnippet(entry: SearchEntry, query: string) {
  if (!query) {
    return entry.description || entry.body.slice(0, 120);
  }

  const normalizedBody = normalize(entry.body);
  const normalizedQuery = normalize(query);
  const matchIndex = normalizedBody.indexOf(normalizedQuery);

  if (matchIndex === -1) {
    return entry.description || entry.body.slice(0, 140);
  }

  const start = Math.max(0, matchIndex - 52);
  const end = Math.min(entry.body.length, matchIndex + query.length + 88);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < entry.body.length ? "..." : "";
  return `${prefix}${entry.body.slice(start, end).trim()}${suffix}`;
}

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SearchEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open || items.length > 0 || loading) {
      return;
    }

    setLoading(true);
    fetch("/search-index.json")
      .then((response) => response.json() as Promise<SearchEntry[]>)
      .then((data) => setItems(data))
      .finally(() => setLoading(false));
  }, [items.length, loading, open]);

  const results = useMemo(() => {
    if (!query) {
      return items.slice(0, MAX_RESULTS);
    }

    return [...items]
      .map((entry) => ({
        entry,
        score: scoreEntry(entry, query)
      }))
      .filter((item) => item.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, MAX_RESULTS)
      .map((item) => item.entry);
  }, [items, query]);

  return (
    <>
      <button
        type="button"
        className="inline-flex h-11 min-w-44 items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 text-sm text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">문서 검색</span>
        <span className="ml-auto hidden rounded-full border border-border/70 px-2 py-0.5 text-[11px] text-muted-foreground sm:inline">
          ⌘K
        </span>
      </button>

      <div
        className={cn(
          "fixed inset-0 z-[80] flex items-start justify-center bg-background/60 p-4 pt-24 backdrop-blur-md transition",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
      >
        <div
          className="glass-panel w-full max-w-2xl overflow-hidden rounded-[1.75rem]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center gap-3 border-b border-border/70 px-5 py-4">
            <Search className="size-4 text-muted-foreground" />
            <input
              autoFocus={open}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="제목, 설명, 본문에서 검색"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground"
              aria-label="검색 닫기"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto px-3 py-3">
            {loading ? (
              <div className="px-3 py-10 text-center text-sm text-muted-foreground">
                검색 인덱스를 불러오는 중입니다...
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-2">
                {results.map((entry) => (
                  <Link
                    key={entry.url}
                    href={entry.url}
                    className="block rounded-2xl border border-transparent px-4 py-3 transition hover:border-primary/20 hover:bg-accent/60"
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <div className="flex items-center gap-2 text-xs font-medium text-primary">
                      <span>{entry.section}</span>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold tracking-[-0.02em]">
                      {entry.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {extractSnippet(entry, query)}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-3 py-10 text-center text-sm text-muted-foreground">
                검색 결과가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
