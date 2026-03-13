# Security Best Practices Report

## Executive Summary

직접 악용 가능한 High/Critical 보안 이슈는 확인되지 않았습니다. 이번 점검에서는 정적 문서 사이트의 배포 기본선에 집중했고, 배포 헤더 부재와 `.env*` 커밋 방지 미설정을 보완했습니다. 현재 코드는 정적 문서 사이트 용도에 비해 비교적 안전한 편이며, 남은 검증 포인트는 배포 후 실제 응답 헤더와 CDN 설정을 확인하는 것입니다.

## Findings

### Medium

#### SEC-001 배포 보안 헤더가 저장소에 명시되어 있지 않았음

- Location: [next.config.ts](/Users/jhyunwoo/projects/turborepo-docs-ko/next.config.ts), [vercel.json](/Users/jhyunwoo/projects/turborepo-docs-ko/vercel.json), [public/_headers](/Users/jhyunwoo/projects/turborepo-docs-ko/public/_headers)
- Evidence: 점검 시점에는 `output`, `pageExtensions`, `reactStrictMode`, `images.unoptimized`만 있었고, 정적 호스팅용 보안 헤더 설정 파일이 없었습니다.
- Impact: 정적 export 사이트는 브라우저 방어선이 호스팅 기본값에 의존하게 되어 클릭재킹, MIME 스니핑, 과도한 referrer 전송 같은 보호 수준이 불명확해집니다.
- Fix: `vercel.json`과 `public/_headers`를 추가해 `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, 제한적 CSP, 캐시 정책을 명시했습니다.
- Mitigation: 배포 후 실제 응답 헤더를 확인하고, 향후 더 엄격한 CSP가 필요하면 해시/nonce 기반으로 확장합니다.

### Low

#### SEC-002 `.env*` 파일의 실수 커밋 방지 설정이 없었음

- Location: [.gitignore](/Users/jhyunwoo/projects/turborepo-docs-ko/.gitignore)
- Evidence: 초기 ignore 목록에 `.env`, `.env.local`, `.env.production` 패턴이 없었습니다.
- Impact: 이후 배포 토큰이나 분석 키를 환경 파일로 다루기 시작하면 실수로 커밋될 가능성이 있습니다.
- Fix: `.env`, `.env.*`를 ignore에 추가하고 `!.env.example` 예외를 두었습니다.
- Mitigation: 실제 비밀은 배포 플랫폼의 secret store를 사용하고, 예시는 `.env.example`만 유지합니다.

## Positive Signals

- [components/site/search-dialog.tsx](/Users/jhyunwoo/projects/turborepo-docs-ko/components/site/search-dialog.tsx), [components/geistdocs/examples-table.tsx](/Users/jhyunwoo/projects/turborepo-docs-ko/components/geistdocs/examples-table.tsx) 등에서 `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `postMessage` 같은 고위험 브라우저 패턴은 확인되지 않았습니다.
- 새 창 링크는 [components/site-footer.tsx](/Users/jhyunwoo/projects/turborepo-docs-ko/components/site-footer.tsx), [components/geistdocs/examples-table.tsx](/Users/jhyunwoo/projects/turborepo-docs-ko/components/geistdocs/examples-table.tsx)에서 `rel="noreferrer"`를 함께 사용하고 있습니다.
- 현재 앱에는 `NEXT_PUBLIC_*` 비밀값 노출이나 클라이언트 번들에서의 `process.env` 오용이 보이지 않았습니다.

## Residual Verification

- 배포 후 실제 응답 헤더에 `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, 클릭재킹 방어가 반영되는지 확인해야 합니다.
- `search-index.json`은 공개 정적 자산이므로, 향후 생성 대상에 비공개 문서가 섞이지 않도록 유지해야 합니다.
- Next.js 정적 export는 인라인 스크립트를 포함하므로, 더 엄격한 CSP를 적용하려면 런타임 HTML 구조를 기준으로 추가 설계가 필요합니다.
