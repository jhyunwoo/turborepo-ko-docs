import Link from "next/link";
import { Callout } from "@/components/geistdocs/callout";

export const CreateTurboCallout = () => (
  <Callout type="info">
    이 가이드는{" "}
    <Link href="/docs/getting-started/installation">create-turbo</Link> 또는
    이와 비슷한 구조의 저장소를 사용한다고 가정합니다.
  </Callout>
);
