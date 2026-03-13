import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
      <div className="glass-panel rounded-[2rem] px-8 py-12">
        <p className="text-sm font-medium text-primary">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
          문서를 찾을 수 없습니다
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          링크가 변경되었거나 정적 내보내기 대상에 포함되지 않은 경로일 수
          있습니다.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            홈으로 이동
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-semibold"
          >
            문서 홈 보기
          </Link>
        </div>
      </div>
    </main>
  );
}
