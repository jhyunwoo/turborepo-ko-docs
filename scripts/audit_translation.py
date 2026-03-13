#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
UPSTREAM_DOCS = ROOT / ".upstream-turborepo" / "apps" / "docs" / "content" / "docs"
OUTPUT_DOCS = ROOT / "content" / "docs"
REPORT_PATH = ROOT / "translation-validation-report.json"

FRONTMATTER_RE = re.compile(r"\A---\n(.*?)\n---\n?", re.DOTALL)
LINK_RE = re.compile(r"\[[^\]]+\]\(([^)]+)\)")
ENGLISH_TEXT_RE = re.compile(r"[A-Za-z]{4,}")
ENGLISH_PHRASE_RE = re.compile(r"\b(?:[A-Za-z][A-Za-z0-9.+/-]*\s+){2,}[A-Za-z][A-Za-z0-9.+/-]*\b")
CODE_FENCE_RE = re.compile(r"^\s*```", re.MULTILINE)

ALLOWED_ENGLISH = {
    "Turborepo",
    "turbo",
    "npm",
    "pnpm",
    "yarn",
    "bun",
    "Docker",
    "Node",
    "JavaScript",
    "TypeScript",
    "Next",
    "GitHub",
    "Vercel",
    "CI",
    "API",
    "JSON",
    "GraphQL",
    "LTS",
    "Bazel",
    "Buck",
    "Please",
    "Pants",
    "Scoot",
    "TSDX",
    "Lerna",
    "Lage",
    "Backfill",
    "Bolt",
    "Rush",
    "Preconstruct",
    "Nx",
    "Yarn",
    "React",
    "Golang",
    "Playwright",
    "Prisma",
    "Storybook",
    "Tailwind",
    "Vitest",
    "Biome",
    "ESLint",
    "Jest",
    "OXC",
    "Nuxt",
    "SvelteKit",
    "Vite",
    "Dockerfile",
    "Terminal",
    "Callout",
    "Card",
    "Cards",
    "Step",
    "Steps",
    "Files",
    "Folder",
    "File",
    "Tabs",
    "Tab",
    "PackageManagerTabs",
    "ExperimentalBadge",
}

ALLOWED_ENGLISH_PHRASES = {
    "Remote Cache",
    "Vercel Remote Cache",
    "Next.js",
    "Node.js",
    "Run Summary",
    "Framework Inference",
}


def split_frontmatter(text: str) -> tuple[str, str]:
    match = FRONTMATTER_RE.match(text)
    if not match:
        return "", text
    return match.group(1), text[match.end() :]


def metrics(text: str) -> dict[str, int]:
    _, body = split_frontmatter(text)
    return {
        "headings": len(re.findall(r"^#{1,6}\s", body, flags=re.MULTILINE)),
        "fences": len(CODE_FENCE_RE.findall(body)),
        "images": len(re.findall(r"!\[", body)),
        "links": len(LINK_RE.findall(body)),
        "cards": len(re.findall(r"<Card\b", body)),
        "steps": len(re.findall(r"<Step\b", body)),
        "tables": len(re.findall(r"^\|", body, flags=re.MULTILINE)),
    }


def strip_code_and_urls(text: str) -> str:
    _, body = split_frontmatter(text)
    cleaned = re.sub(r"```[\s\S]*?```", "", body)
    cleaned = re.sub(r"`[^`]+`", "", cleaned)
    cleaned = re.sub(r"https?://\S+", "", cleaned)
    cleaned = re.sub(r"<[^>\n]+>", " ", cleaned)
    cleaned = re.sub(r"\{[^}\n]+\}", " ", cleaned)
    cleaned = re.sub(r"\[[^\]]+\]\([^)]+\)", " ", cleaned)
    cleaned = re.sub(r'".*?"', " ", cleaned)
    cleaned = re.sub(r"'.*?'", " ", cleaned)
    cleaned = re.sub(r"^[A-Za-z0-9_-]+:\s.*$", " ", cleaned, flags=re.MULTILINE)
    return cleaned


def suspicious_english_tokens(text: str) -> list[str]:
    cleaned = strip_code_and_urls(text)
    tokens = ENGLISH_TEXT_RE.findall(cleaned)
    suspects: list[str] = []
    for token in tokens:
        if token in ALLOWED_ENGLISH:
            continue
        if token.isupper():
            continue
        if token.lower() in {"href", "title", "description", "summary", "defaultopen", "type", "related", "prerequisites"}:
            continue
        suspects.append(token)
    return sorted(set(suspects))[:50]


def english_prose_hits(text: str) -> list[dict[str, str | int]]:
    _, body = split_frontmatter(text)
    hits: list[dict[str, str | int]] = []
    in_fence = False
    for lineno, raw_line in enumerate(body.splitlines(), start=1):
        line = raw_line
        if CODE_FENCE_RE.match(line):
            in_fence = not in_fence
            continue
        if in_fence:
            continue

        stripped_line = line.strip()
        if stripped_line.startswith("import ") or stripped_line.startswith("export "):
            continue

        cleaned = re.sub(r"`[^`]+`", " ", line)
        cleaned = re.sub(r"!\[([^\]]+)\]\(([^)]+)\)", r"\1", cleaned)
        cleaned = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"\1", cleaned)
        cleaned = re.sub(r"<[^>]+>", " ", cleaned)
        cleaned = re.sub(r"\{[^}]+\}", " ", cleaned)
        cleaned = re.sub(r"https?://\S+", " ", cleaned)
        cleaned = re.sub(r"^\s*[\-|*+>#\d.]+\s*", " ", cleaned)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        if not cleaned:
            continue

        for phrase in ENGLISH_PHRASE_RE.findall(cleaned):
            normalized = " ".join(phrase.split())
            if normalized in ALLOWED_ENGLISH_PHRASES:
                continue
            words = normalized.split()
            filtered = [word for word in words if word not in ALLOWED_ENGLISH and not word.isupper()]
            if len(filtered) < 3:
                continue
            hits.append({"line": lineno, "text": normalized})
            break

    return hits[:20]


def read_utf8(path: Path) -> tuple[str | None, str | None]:
    try:
        return path.read_text(encoding="utf-8"), None
    except Exception as exc:  # noqa: BLE001
        return None, f"{type(exc).__name__}: {exc}"


def audit_file(relative: str) -> dict:
    src = UPSTREAM_DOCS / relative
    dst = OUTPUT_DOCS / relative
    result = {
        "file": relative,
        "exists": dst.exists(),
        "utf8_ok": False,
        "json_ok": None,
        "structure_ok": None,
        "link_targets_ok": None,
        "suspicious_english_count": None,
        "suspicious_english_examples": [],
        "english_prose_hits": [],
        "issues": [],
    }

    if not dst.exists():
        result["issues"].append("missing_output")
        return result

    src_text, src_err = read_utf8(src)
    dst_text, dst_err = read_utf8(dst)
    if src_err:
        result["issues"].append(f"source_decode_error:{src_err}")
        return result
    if dst_err:
        result["issues"].append(f"output_decode_error:{dst_err}")
        return result

    result["utf8_ok"] = True

    if dst.name == "meta.json":
        try:
            json.loads(dst_text)
            result["json_ok"] = True
        except Exception as exc:  # noqa: BLE001
            result["json_ok"] = False
            result["issues"].append(f"invalid_json:{type(exc).__name__}")
    else:
        result["json_ok"] = None

    src_metrics = metrics(src_text)
    dst_metrics = metrics(dst_text)
    result["structure_ok"] = src_metrics == dst_metrics
    if not result["structure_ok"]:
        result["issues"].append(
            "structure_mismatch"
        )
        result["source_metrics"] = src_metrics
        result["output_metrics"] = dst_metrics

    src_links = LINK_RE.findall(src_text)
    dst_links = LINK_RE.findall(dst_text)
    result["link_targets_ok"] = src_links == dst_links
    if not result["link_targets_ok"]:
        result["issues"].append("link_target_mismatch")

    suspects = suspicious_english_tokens(dst_text)
    result["suspicious_english_count"] = len(suspects)
    result["suspicious_english_examples"] = suspects[:20]
    if suspects:
        result["issues"].append("suspicious_english_residue")

    prose_hits = english_prose_hits(dst_text)
    result["english_prose_hits"] = prose_hits
    if prose_hits:
        result["issues"].append("english_prose_residue")

    return result


def main() -> int:
    upstream_files = sorted(
        str(path.relative_to(UPSTREAM_DOCS)).replace("\\", "/")
        for path in UPSTREAM_DOCS.rglob("*")
        if path.is_file()
    )
    results = [audit_file(relative) for relative in upstream_files]

    summary = {
        "total_files": len(results),
        "existing_files": sum(1 for r in results if r["exists"]),
        "utf8_ok": sum(1 for r in results if r["utf8_ok"]),
        "json_ok": sum(1 for r in results if r["json_ok"] is True),
        "structure_ok": sum(1 for r in results if r["structure_ok"] is True),
        "link_targets_ok": sum(1 for r in results if r["link_targets_ok"] is True),
        "clean_english_residue": sum(1 for r in results if not r["suspicious_english_examples"]),
        "files_with_issues": sum(
            1
            for r in results
            if any(issue != "suspicious_english_residue" for issue in r["issues"])
        ),
        "files_with_suspicious_english": sum(
            1 for r in results if "suspicious_english_residue" in r["issues"]
        ),
        "files_with_english_prose_residue": sum(
            1 for r in results if "english_prose_residue" in r["issues"]
        ),
    }

    report = {"summary": summary, "results": results}
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
