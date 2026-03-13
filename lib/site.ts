export const siteConfig = {
  name: "Turborepo 한국어 문서",
  description:
    "Turborepo 공식 문서를 한국어로 읽을 수 있도록 정리한 정적 MDX 문서 사이트입니다.",
  shortDescription:
    "Turborepo 공식 문서의 완전한 한국어 번역본을 빠르게 탐색할 수 있는 정적 문서 사이트입니다.",
  repository: "https://github.com/vercel/turborepo",
  locale: "ko_KR",
  keywords: [
    "Turborepo",
    "Turborepo 문서",
    "Turborepo 한국어",
    "모노레포",
    "monorepo",
    "Next.js",
    "MDX",
    "정적 사이트"
  ]
};

export const featuredHighlights = [
  {
    eyebrow: "정적 배포",
    title: "가볍고 빠른 문서 호스팅",
    description:
      "Next.js App Router와 `output: \"export\"` 설정으로 어떤 정적 호스팅에도 올릴 수 있게 구성합니다."
  },
  {
    eyebrow: "검색",
    title: "빌드 시 생성되는 검색 인덱스",
    description:
      "제목, 설명, 본문과 헤딩을 추출한 정적 JSON 인덱스를 클라이언트에서 바로 검색합니다."
  },
  {
    eyebrow: "MDX 호환",
    title: "기존 문서 구조 그대로 렌더링",
    description:
      "Tabs, Callout, Files, ThemeAwareImage 같은 문서용 컴포넌트를 그대로 지원합니다."
  },
  {
    eyebrow: "테마",
    title: "라이트와 다크를 모두 지원",
    description:
      "CSS 변수 기반 디자인 토큰으로 밝은 화면과 어두운 화면 모두에서 가독성을 유지합니다."
  }
];

export const featuredSections = [
  {
    kicker: "빠르게 시작",
    title: "시작하기",
    href: "/docs/getting-started",
    description:
      "설치, 기존 저장소에 추가하는 방법, 예제, 에디터 연동까지 Turborepo 시작에 필요한 흐름을 한 번에 볼 수 있습니다."
  },
  {
    kicker: "핵심 개념",
    title: "Core Concepts",
    href: "/docs/core-concepts",
    description:
      "내부 패키지, 패키지와 작업 그래프, 원격 캐시 등 Turborepo의 핵심 동작 원리를 이해할 수 있습니다."
  },
  {
    kicker: "실전 구성",
    title: "저장소 구성하기",
    href: "/docs/crafting-your-repository",
    description:
      "작업 구성, 캐시, CI, 의존성 관리, 환경 변수 전략처럼 실제 모노레포 운영에 필요한 내용을 다룹니다."
  },
  {
    kicker: "레퍼런스",
    title: "CLI와 설정 참조",
    href: "/docs/reference",
    description:
      "명령어, 옵션, 구성 파일, 메시지와 시스템 환경 변수까지 찾아보기 좋은 형태로 정리했습니다."
  }
];
