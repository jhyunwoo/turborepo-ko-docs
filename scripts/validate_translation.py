#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
UPSTREAM_DOCS = ROOT / ".upstream-turborepo" / "apps" / "docs" / "content" / "docs"
OUTPUT_DOCS = ROOT / "content" / "docs"

FRONTMATTER_RE = re.compile(r"\A---\n(.*?)\n---\n?", re.DOTALL)


def split_frontmatter(content: str) -> tuple[str, str]:
    match = FRONTMATTER_RE.match(content)
    if not match:
        return "", content
    return match.group(1), content[match.end() :]


def metrics(text: str) -> dict[str, int]:
    _, body = split_frontmatter(text)
    return {
        "headings": len(re.findall(r"^#{1,6}\s", body, flags=re.MULTILINE)),
        "fences": len(re.findall(r"^```", body, flags=re.MULTILINE)),
        "images": len(re.findall(r"!\[", body)),
        "links": len(re.findall(r"\[[^\]]+\]\(([^)]+)\)", body)),
        "cards": len(re.findall(r"<Card\b", body)),
        "steps": len(re.findall(r"<Step\b", body)),
        "tables": len(re.findall(r"^\|", body, flags=re.MULTILINE)),
    }


def main() -> int:
    failures: list[str] = []
    upstream_files = sorted(path for path in UPSTREAM_DOCS.rglob("*") if path.is_file())
    output_files = sorted(path for path in OUTPUT_DOCS.rglob("*") if path.is_file())

    if len(upstream_files) != len(output_files):
        failures.append(f"file count mismatch: upstream={len(upstream_files)} output={len(output_files)}")

    for src in upstream_files:
        relative = src.relative_to(UPSTREAM_DOCS)
        dst = OUTPUT_DOCS / relative
        if not dst.exists():
            failures.append(f"missing file: {relative}")
            continue
        src_text = src.read_text(encoding="utf-8")
        dst_text = dst.read_text(encoding="utf-8")

        if src.name == "meta.json":
            try:
                json.loads(dst_text)
            except Exception as exc:  # noqa: BLE001
                failures.append(f"invalid json: {relative}: {exc}")
                continue

        src_fm, _ = split_frontmatter(src_text)
        dst_fm, _ = split_frontmatter(dst_text)
        if bool(src_fm) != bool(dst_fm):
            failures.append(f"frontmatter mismatch: {relative}")

        src_metrics = metrics(src_text)
        dst_metrics = metrics(dst_text)
        if src_metrics != dst_metrics:
            failures.append(f"structure mismatch: {relative}: {src_metrics} != {dst_metrics}")

        src_links = re.findall(r"\[[^\]]+\]\(([^)]+)\)", src_text)
        dst_links = re.findall(r"\[[^\]]+\]\(([^)]+)\)", dst_text)
        if src_links != dst_links:
            failures.append(f"link target mismatch: {relative}")

    manifest = ROOT / "translation-manifest.json"
    if not manifest.exists():
        failures.append("missing translation-manifest.json")
    else:
        data = json.loads(manifest.read_text(encoding="utf-8"))
        if data.get("counts", {}).get("files") != len(upstream_files):
            failures.append("manifest file count mismatch")

    if failures:
        print("\n".join(failures))
        return 1

    print(f"validated {len(upstream_files)} files")
    return 0


if __name__ == "__main__":
    sys.exit(main())
