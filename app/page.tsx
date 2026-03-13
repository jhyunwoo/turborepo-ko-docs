import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { toAbsoluteUrl } from "@/lib/seo";
import manifest from "@/translation-manifest.json";
import { featuredHighlights, featuredSections, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  alternates: {
    canonical: "/"
  },
  openGraph: {
    url: toAbsoluteUrl("/"),
    title: siteConfig.name,
    description: siteConfig.shortDescription
  },
  twitter: {
    title: siteConfig.name,
    description: siteConfig.shortDescription
  }
};

export default function HomePage() {
  const homeJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: siteConfig.name,
    url: toAbsoluteUrl("/"),
    description: siteConfig.shortDescription,
    inLanguage: "ko-KR"
  };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 pb-16 pt-10 sm:px-8 lg:px-10">
      <JsonLd data={homeJsonLd} />
      <section className="glass-panel mesh-border overflow-hidden rounded-[2rem]">
        <div className="grid gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1.35fr_0.9fr] lg:px-14 lg:py-16">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-sm font-medium text-primary">
              정적 export 기반 한국어 문서 사이트
            </span>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
                {siteConfig.name}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                {siteConfig.description} 번역본 `content/docs/**`를 단일 소스로
                사용하고, MDX와 정적 생성으로 빠르게 배포할 수 있도록
                구성했습니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/docs"
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:translate-y-[-1px] hover:shadow-lg"
              >
                문서 읽기 시작
              </Link>
              <Link
                href="/docs/getting-started"
                className="inline-flex items-center justify-center rounded-full border border-border bg-background/70 px-5 py-3 text-sm font-semibold transition hover:bg-accent"
              >
                시작 가이드로 이동
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="glass-panel rounded-[1.5rem] p-6">
              <p className="text-sm text-muted-foreground">번역 문서 수</p>
              <p className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
                {manifest.counts.files}
              </p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Turborepo 공식 `apps/docs/content/docs` 스냅샷을 기준으로 구성된
                전체 문서 번역본입니다.
              </p>
            </div>
            <div className="glass-panel rounded-[1.5rem] p-6">
              <p className="text-sm text-muted-foreground">서비스 특성</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground/90">
                <li>정적 export 대응</li>
                <li>라이트/다크 모드 지원</li>
                <li>클라이언트 검색 인덱스 제공</li>
                <li>MDX 컴포넌트 렌더링 유지</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {featuredHighlights.map((item) => (
          <div
            key={item.title}
            className="glass-panel rounded-[1.5rem] p-6 transition hover:-translate-y-1"
          >
            <p className="text-sm font-medium text-primary">{item.eyebrow}</p>
            <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em]">
              {item.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {item.description}
            </p>
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">탐색하기</p>
          <h2 className="text-3xl font-semibold tracking-[-0.04em]">
            문서를 섹션별로 바로 이동하세요
          </h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {featuredSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="glass-panel group rounded-[1.5rem] p-6 transition hover:-translate-y-1 hover:border-primary/25"
            >
              <p className="text-sm font-medium text-primary">{section.kicker}</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                {section.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {section.description}
              </p>
              <div className="mt-6 inline-flex items-center text-sm font-medium text-foreground/85 transition group-hover:text-primary">
                바로 보기
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
