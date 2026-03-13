#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from pathlib import Path

from deep_translator import GoogleTranslator
import yaml


ROOT = Path(__file__).resolve().parents[1]
UPSTREAM_DOCS = ROOT / ".upstream-turborepo" / "apps" / "docs" / "content" / "docs"
OUTPUT_DOCS = ROOT / "content" / "docs"
UPSTREAM_SHA = "5d5c94e8a5cc758475178d17b6bf95767267fd61"

FRONTMATTER_RE = re.compile(r"\A---\n(.*?)\n---\n?", re.DOTALL)
INLINE_LINK_RE = re.compile(r"(!?)\[([^\]]+)\]\(([^)]+)\)", re.DOTALL)
ATTR_RE = re.compile(r'(\b(?:title|description|label|text|summary|caption|alt|placeholder))="([^"]+)"')
CODE_SPAN_RE = re.compile(r"`[^`]+`")
FENCE_RE = re.compile(r"^\s*```")
PAIR_TAG_RE = re.compile(r"<([A-Za-z][\w:-]*)([^>]*)>([^<]+)</\1>")
PURE_TAG_LINE_RE = re.compile(r"^\s*</?[A-Za-z][^>]*?/?>\s*$")
HEADING_RE = re.compile(r"^(\s*#{1,6}\s+)(.+?)(\n?)$")
LIST_RE = re.compile(r"^(\s*(?:[-*+]\s+|\d+\.\s+|>\s+))(.+?)(\n?)$")
MDX_EXPR_RE = re.compile(r"\{[^{}\n]*\}")
URL_RE = re.compile(r"https?://\S+")

TERM_NORMALIZATION = {
    "터보레포": "Turborepo",
    "베르셀": "Vercel",
    "리모트 캐시": "원격 캐시",
    "원격 캐시": "원격 캐시",
    "깃허브": "GitHub",
    "노드.js": "Node.js",
    "자바스크립트": "JavaScript",
    "타입스크립트": "TypeScript",
    "그래프QL": "GraphQL",
    "리액트": "React",
    "넥스트.js": "Next.js",
    "도커파일": "Dockerfile",
    "바이옴": "Biome",
    "테일윈드": "Tailwind",
    "플레이라이트": "Playwright",
    "스토리북": "Storybook",
    "비테스트": "Vitest",
}


def make_translator() -> GoogleTranslator:
    return GoogleTranslator(source="en", target="ko")


class Translator:
    def __init__(self) -> None:
        self.engine = make_translator()
        self.cache: dict[str, str] = {}

    def translate(self, text: str) -> str:
        if text in self.cache:
            return self.cache[text]
        if not has_english(text):
            self.cache[text] = text
            return text

        leading = re.match(r"^\s*", text).group(0)
        trailing = re.search(r"\s*$", text).group(0)
        core = text[len(leading) : len(text) - len(trailing)] if len(text) - len(trailing) >= len(leading) else text.strip()
        if not core:
            self.cache[text] = text
            return text

        prepared, placeholders = protect_text(core)
        translated = self._translate_chunks(prepared)
        restored = restore_text(translated, placeholders)
        normalized = leading + normalize_output(restored) + trailing
        self.cache[text] = normalized
        return normalized

    def _translate_chunks(self, text: str) -> str:
        chunks = split_for_translation(text)
        translated_chunks: list[str] = []
        for chunk in chunks:
            attempt = 0
            while True:
                attempt += 1
                try:
                    translated = self.engine.translate(chunk)
                    translated_chunks.append(translated or chunk)
                    break
                except Exception:  # noqa: BLE001
                    if attempt >= 5:
                        translated_chunks.append(chunk)
                        break
                    time.sleep(1.2 * attempt)
                    self.engine = make_translator()
        return "".join(translated_chunks)


def has_english(text: str) -> bool:
    return bool(re.search(r"[A-Za-z]", text))


def split_for_translation(text: str, limit: int = 2600) -> list[str]:
    if len(text) <= limit:
        return [text]
    parts = re.split(r"(\n\s*\n)", text)
    chunks: list[str] = []
    current = ""
    for part in parts:
        candidate = f"{current}{part}"
        if current and len(candidate) > limit:
            chunks.append(current)
            current = part
        else:
            current = candidate
    if current:
        chunks.append(current)
    return chunks


def protect_text(text: str) -> tuple[str, dict[str, str]]:
    placeholders: dict[str, str] = {}
    idx = 0
    protected = text

    def register(token: str) -> str:
        nonlocal idx
        key = f"@@P{idx}@@"
        placeholders[key] = token
        idx += 1
        return key

    protected = CODE_SPAN_RE.sub(lambda m: register(m.group(0)), protected)
    return protected, placeholders


def restore_text(text: str, placeholders: dict[str, str]) -> str:
    restored = text
    for key, value in placeholders.items():
        restored = restored.replace(key, value)
    return restored


def normalize_output(text: str) -> str:
    normalized = text
    for src, dst in TERM_NORMALIZATION.items():
        normalized = normalized.replace(src, dst)
    normalized = normalized.replace("오픈소스", "오픈 소스")
    normalized = normalized.replace("  ", " ")
    return normalized


def translate_rich_text(text: str, tr: Translator) -> str:
    if not text or not has_english(text):
        return text

    placeholders: dict[str, str] = {}
    idx = 0
    protected = text

    def register(token: str) -> str:
        nonlocal idx
        key = f"@@PH{idx}@@"
        placeholders[key] = token
        idx += 1
        return key

    protected = protected.replace("\r\n", "\n")
    protected = protected.replace("\n", register("\n"))
    protected = CODE_SPAN_RE.sub(lambda m: register(m.group(0)), protected)
    protected = URL_RE.sub(lambda m: register(m.group(0)), protected)
    protected = MDX_EXPR_RE.sub(lambda m: register(m.group(0)), protected)

    def replace_link(match: re.Match[str]) -> str:
        bang, label, target = match.groups()
        translated_label = translate_rich_text(label, tr)
        return register(f"{bang}[{translated_label}]({target})")

    protected = INLINE_LINK_RE.sub(replace_link, protected)

    def replace_pair_tag(match: re.Match[str]) -> str:
        tag, attrs, inner = match.groups()
        if tag.lower() in {"code"}:
            inner_text = inner
        else:
            inner_text = translate_rich_text(inner, tr)
        return register(f"<{tag}{attrs}>{inner_text}</{tag}>")

    protected = PAIR_TAG_RE.sub(replace_pair_tag, protected)
    protected = re.sub(r"<[^>\n]+>", lambda m: register(m.group(0)), protected)

    translated = tr._translate_chunks(protected)
    return normalize_output(restore_text(translated, placeholders))


def split_frontmatter(content: str) -> tuple[dict, str]:
    match = FRONTMATTER_RE.match(content)
    if not match:
        return {}, content
    return yaml.safe_load(match.group(1)) or {}, content[match.end() :]


def dump_frontmatter(data: dict) -> str:
    dumped = yaml.safe_dump(data, sort_keys=False, allow_unicode=True).strip()
    return f"---\n{dumped}\n---\n"


def translate_frontmatter(data: dict, tr: Translator) -> dict:
    translated = dict(data)
    for key in ("title", "description", "summary"):
        value = translated.get(key)
        if isinstance(value, str):
            translated[key] = tr.translate(value)
    return translated


def translate_inline(text: str, tr: Translator) -> str:
    return translate_rich_text(text, tr)


def translate_attrs(line: str, tr: Translator) -> str:
    return ATTR_RE.sub(lambda m: f'{m.group(1)}="{tr.translate(m.group(2))}"', line)


def translate_comment_line(line: str, tr: Translator) -> str:
    newline = "\n" if line.endswith("\n") else ""
    core = line[:-1] if newline else line
    patterns = [
        r"^(\s*#\s+)(.+)$",
        r"^(\s*//\s+)(.+)$",
        r"^(\s*/\*\s+)(.+?)(\s*\*/\s*)$",
        r"^(\s*\*\s+)(.+)$",
        r"^(\s*<!--\s+)(.+?)(\s*-->\s*)$",
    ]
    for pattern in patterns:
        match = re.match(pattern, core)
        if match:
            groups = list(match.groups())
            target_index = 1
            if len(groups) == 3:
                target_index = 1
            groups[target_index] = translate_rich_text(groups[target_index], tr)
            return "".join(groups) + newline
    return line


def flush_chunk(buffer: list[str], out: list[str], tr: Translator) -> None:
    if not buffer:
        return
    out.append(translate_rich_text("".join(buffer), tr))
    buffer.clear()


def is_table_separator(line: str) -> bool:
    stripped = line.strip()
    if not stripped.startswith("|"):
        return False
    cells = [cell.strip() for cell in stripped.strip("|").split("|")]
    return bool(cells) and all(re.fullmatch(r":?-{3,}:?", cell) for cell in cells if cell)


def translate_table_line(line: str, tr: Translator) -> str:
    if not line.lstrip().startswith("|") or is_table_separator(line):
        return line
    has_newline = line.endswith("\n")
    body = line[:-1] if has_newline else line
    indent = re.match(r"^\s*", body).group(0)
    stripped = body[len(indent) :]
    leading_pipe = stripped.startswith("|")
    trailing_pipe = stripped.endswith("|")
    core = stripped.strip("|")
    cells = core.split("|")
    translated_cells = [f" {translate_rich_text(cell.strip(), tr)} " if cell.strip() else " " for cell in cells]
    rebuilt = indent
    if leading_pipe:
        rebuilt += "|"
    rebuilt += "|".join(translated_cells)
    if trailing_pipe:
        rebuilt += "|"
    if has_newline:
        rebuilt += "\n"
    return rebuilt


def translate_prefixed_line(line: str, pattern: re.Pattern[str], tr: Translator) -> str:
    match = pattern.match(line)
    if not match:
        return translate_rich_text(line, tr)
    prefix, content, newline = match.groups()
    return f"{prefix}{translate_rich_text(content, tr)}{newline}"


def translate_mdx(content: str, tr: Translator) -> str:
    fm, body = split_frontmatter(content)
    translated_fm = translate_frontmatter(fm, tr) if fm else {}
    out: list[str] = []
    chunk: list[str] = []
    in_fence = False

    for raw_line in body.splitlines(keepends=True):
        line = raw_line
        if FENCE_RE.match(line):
            flush_chunk(chunk, out, tr)
            in_fence = not in_fence
            out.append(line)
            continue

        if in_fence:
            out.append(translate_comment_line(line, tr))
            continue

        stripped = line.strip()

        if stripped.startswith("import ") or stripped.startswith("export "):
            flush_chunk(chunk, out, tr)
            out.append(line)
            continue

        if PURE_TAG_LINE_RE.fullmatch(stripped):
            flush_chunk(chunk, out, tr)
            out.append(translate_attrs(line, tr))
            continue

        if re.fullmatch(r"\s*---+\s*\n?", line):
            flush_chunk(chunk, out, tr)
            out.append(line)
            continue

        if stripped.startswith("|"):
            flush_chunk(chunk, out, tr)
            out.append(translate_table_line(line, tr))
            continue

        if HEADING_RE.match(line):
            flush_chunk(chunk, out, tr)
            out.append(translate_prefixed_line(translate_attrs(line, tr), HEADING_RE, tr))
            continue

        if LIST_RE.match(line):
            flush_chunk(chunk, out, tr)
            out.append(translate_prefixed_line(translate_attrs(line, tr), LIST_RE, tr))
            continue

        if not stripped:
            chunk.append(line)
            continue

        chunk.append(translate_attrs(line, tr))

    flush_chunk(chunk, out, tr)
    translated_body = "".join(out)
    if translated_fm:
        translated = dump_frontmatter(translated_fm) + translated_body
    else:
        translated = translated_body
    return restore_link_targets(content, translated)


def translate_json_value(value, tr: Translator):
    if isinstance(value, dict):
        return {k: translate_json_value(v, tr) for k, v in value.items()}
    if isinstance(value, list):
        return [translate_json_value(item, tr) for item in value]
    if isinstance(value, str):
        if value.startswith("/") or value == "...":
            return value
        if value.startswith("[") and "](" in value and value.endswith(")"):
            return INLINE_LINK_RE.sub(lambda m: f'{m.group(1)}[{tr.translate(m.group(2))}]({m.group(3)})', value)
        return tr.translate(value)
    return value


def restore_link_targets(source_text: str, translated_text: str) -> str:
    src_links = list(INLINE_LINK_RE.finditer(source_text))
    dst_links = list(INLINE_LINK_RE.finditer(translated_text))
    if len(src_links) != len(dst_links):
        return translated_text
    pieces: list[str] = []
    last = 0
    for src, dst in zip(src_links, dst_links):
        pieces.append(translated_text[last : dst.start()])
        bang, label, _target = dst.groups()
        pieces.append(f"{bang}[{label}]({src.group(3)})")
        last = dst.end()
    pieces.append(translated_text[last:])
    return "".join(pieces)


def translate_tsx(content: str, tr: Translator) -> str:
    updated = translate_attrs(content, tr)
    updated = re.sub(
        r"(>)([^<>{}\n][^<]*?)(<)",
        lambda m: f"{m.group(1)}{tr.translate(m.group(2).strip())}{m.group(3)}" if m.group(2).strip() else m.group(0),
        updated,
    )
    return updated


def write_manifest(files: list[str]) -> None:
    manifest = {
        "upstream": {
            "repository": "https://github.com/vercel/turborepo",
            "sha": UPSTREAM_SHA,
            "source_dir": "apps/docs/content/docs",
        },
        "counts": {"files": len(files)},
        "files": files,
    }
    (ROOT / "translation-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def iter_files() -> list[Path]:
    return sorted(path for path in UPSTREAM_DOCS.rglob("*") if path.is_file())


def translate_file(src: Path, dst: Path, tr: Translator) -> None:
    text = src.read_text(encoding="utf-8")
    dst.parent.mkdir(parents=True, exist_ok=True)
    if src.suffix in {".md", ".mdx"}:
        output = translate_mdx(text, tr)
    elif src.name == "meta.json":
        output = json.dumps(translate_json_value(json.loads(text), tr), ensure_ascii=False, indent=2) + "\n"
    elif src.suffix == ".tsx":
        output = translate_tsx(text, tr)
    else:
        output = text
    dst.write_text(output, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int)
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()

    files = iter_files()
    write_manifest([str(path.relative_to(UPSTREAM_DOCS)).replace(os.sep, "/") for path in files])
    if args.limit:
        files = files[: args.limit]

    tr = Translator()
    for src in files:
        relative = src.relative_to(UPSTREAM_DOCS)
        if args.verbose:
            print(relative)
        translate_file(src, OUTPUT_DOCS / relative, tr)

    return 0


if __name__ == "__main__":
    sys.exit(main())
