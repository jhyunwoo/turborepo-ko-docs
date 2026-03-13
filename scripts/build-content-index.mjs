import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const docsRoot = path.join(root, "content", "docs");
const examplesRoot = path.join(root, ".upstream-turborepo", "examples");

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const resolved = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(resolved);
      return [resolved];
    })
  );

  return files.flat();
}

function parseFrontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { data: {}, body: source };

  const block = match[1];
  const data = {};

  for (const line of block.split("\n")) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) continue;
    const [, key, rawValue] = kv;
    data[key] = rawValue.replace(/^["']|["']$/g, "");
  }

  return {
    data,
    body: source.slice(match[0].length)
  };
}

function toUrl(filePath) {
  const relative = path.relative(docsRoot, filePath).replaceAll(path.sep, "/");
  const withoutExt = relative.replace(/\.(md|mdx)$/, "");
  if (withoutExt === "index") return "/docs";
  if (withoutExt.endsWith("/index")) {
    return `/docs/${withoutExt.slice(0, -"/index".length)}`;
  }
  return `/docs/${withoutExt}`;
}

function normalizeText(markdown) {
  return markdown
    .replace(/^import\s+.*$/gm, " ")
    .replace(/^export\s+.*$/gm, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/<[^>\n]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[>#*_~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function buildSearchIndex() {
  const files = (await walk(docsRoot)).filter((file) => /\.(md|mdx)$/.test(file));
  const entries = [];

  for (const file of files) {
    const raw = await readFile(file, "utf8");
    const { data, body } = parseFrontmatter(raw);
    const text = normalizeText(body);
    const headings = [...body.matchAll(/^#{1,6}\s+(.+)$/gm)].map((match) =>
      match[1].trim()
    );

    entries.push({
      url: toUrl(file),
      title: data.title ?? path.basename(file),
      description: data.description ?? "",
      section: path.relative(docsRoot, file).split(path.sep)[0].replace(/\.(md|mdx)$/, ""),
      headings,
      text
    });
  }

  await mkdir(path.join(root, "public"), { recursive: true });
  await writeFile(
    path.join(root, "public", "search-index.json"),
    `${JSON.stringify(entries, null, 2)}\n`
  );
}

async function buildExamplesData() {
  const exampleDirs = await readdir(examplesRoot, { withFileTypes: true });
  const examples = [];

  for (const entry of exampleDirs) {
    if (!entry.isDirectory()) continue;

    const metaPath = path.join(examplesRoot, entry.name, "meta.json");

    try {
      const meta = JSON.parse(await readFile(metaPath, "utf8"));
      examples.push({
        slug: entry.name,
        name: meta.name,
        description: meta.description,
        maintainedByCoreTeam: Boolean(meta.maintainedByCoreTeam),
        template: meta.template
      });
    } catch {
      // Skip example folders without metadata.
    }
  }

  examples.sort((left, right) => left.name.localeCompare(right.name, "en"));

  await mkdir(path.join(root, "content"), { recursive: true });
  await writeFile(
    path.join(root, "content", "examples-data.json"),
    `${JSON.stringify(examples, null, 2)}\n`
  );
}

await Promise.all([buildSearchIndex(), buildExamplesData()]);
