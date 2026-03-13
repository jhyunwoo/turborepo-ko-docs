import Link from "next/link";

export function LinkToDocumentation({
  href,
  text
}: {
  href: string;
  text: string;
}) {
  return (
    <small className="not-prose inline-flex">
      <Link
        href={href}
        className="inline-flex items-center gap-2 font-medium decoration-foreground underline"
      >
        <span aria-hidden>→</span>
        {text}
      </Link>
    </small>
  );
}
