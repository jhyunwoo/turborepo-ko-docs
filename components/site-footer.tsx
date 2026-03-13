import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/80">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>{siteConfig.name}는 번역된 Turborepo 문서를 정적 사이트로 제공합니다.</p>
        <div className="flex items-center gap-4">
          <Link
            href="/docs"
            className="transition hover:text-foreground"
          >
            문서 둘러보기
          </Link>
          <Link
            href={siteConfig.repository}
            className="transition hover:text-foreground"
            rel="noreferrer"
            target="_blank"
          >
            원본 저장소
          </Link>
        </div>
      </div>
    </footer>
  );
}
