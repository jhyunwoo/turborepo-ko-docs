import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const docsDir = path.join(rootDir, "content", "docs");
const publicDir = path.join(rootDir, "public");
const examplesDir = path.join(rootDir, ".upstream-turborepo", "examples");
const translationManifestPath = path.join(rootDir, "translation-manifest.json");
const searchIndexOutputPath = path.join(publicDir, "search-index.json");
const examplesOutputPath = path.join(rootDir, "content", "examples-data.json");
const sitemapOutputPath = path.join(publicDir, "sitemap.xml");
const robotsOutputPath = path.join(publicDir, "robots.txt");
const manifestOutputPath = path.join(publicDir, "site.webmanifest");
const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://turborepo-docs-ko.vercel.app"
).replace(/\/$/u, "");

if (!process.env.NEXT_PUBLIC_SITE_URL) {
  console.warn(
    "[seo] NEXT_PUBLIC_SITE_URL이 설정되지 않아 기본 URL을 사용합니다:",
    siteUrl
  );
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function filePathToUrl(relativePath) {
  const normalized = relativePath.replaceAll("\\", "/");
  const withoutExtension = normalized.replace(/\.(md|mdx)$/u, "");
  const slug = withoutExtension.endsWith("/index")
    ? withoutExtension.slice(0, -"/index".length)
    : withoutExtension;

  return slug ? `/docs/${slug}` : "/docs";
}

function parseFrontmatter(content) {
  if (!content.startsWith("---\n")) {
    return { data: {}, content };
  }

  const end = content.indexOf("\n---\n", 4);

  if (end === -1) {
    return { data: {}, content };
  }

  const frontmatter = content.slice(4, end).split("\n");
  const data = {};

  for (const line of frontmatter) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/u);

    if (!match) {
      continue;
    }

    const [, key, value] = match;
    data[key] = value.replace(/^['"]|['"]$/gu, "");
  }

  return {
    data,
    content: content.slice(end + 5)
  };
}

function stripMdx(source) {
  return source
    .replace(/^import\s+.*$/gmu, "")
    .replace(/```[\s\S]*?```/gmu, " ")
    .replace(/<[^>]+>/gmu, " ")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gmu, "$1")
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/gmu, "$1")
    .replace(/`([^`]+)`/gmu, "$1")
    .replace(/\*\*([^*]+)\*\*/gmu, "$1")
    .replace(/\*([^*]+)\*/gmu, "$1")
    .replace(/_{1,2}([^_]+)_{1,2}/gmu, "$1")
    .replace(/\s+/gmu, " ")
    .trim();
}

function collectHeadings(source) {
  return Array.from(source.matchAll(/^#{1,6}\s+(.+)$/gmu), (match) =>
    match[1].trim()
  );
}

function createSearchIndex() {
  const manifest = readJson(translationManifestPath);
  const entries = manifest.files
    .filter((relativePath) => relativePath.endsWith(".md") || relativePath.endsWith(".mdx"))
    .map((relativePath) => {
      const absolutePath = path.join(docsDir, relativePath);
      const source = fs.readFileSync(absolutePath, "utf8");
      const parsed = parseFrontmatter(source);
      const headings = collectHeadings(parsed.content);
      const title = parsed.data.title || headings[0] || path.basename(relativePath);
      const description = parsed.data.description || parsed.data.summary || "";
      const body = stripMdx(parsed.content);
      const section = relativePath.includes("/")
        ? relativePath.split("/")[0]
        : "docs";

      return {
        title,
        description,
        url: filePathToUrl(relativePath),
        section,
        headings,
        body
      };
    });

  ensureDirectory(path.dirname(searchIndexOutputPath));
  fs.writeFileSync(searchIndexOutputPath, JSON.stringify(entries, null, 2));
  console.log(`search index written to ${searchIndexOutputPath}`);
}

function createSitemap() {
  const manifest = readJson(translationManifestPath);
  const urls = new Set(["/", "/docs"]);

  for (const relativePath of manifest.files) {
    if (!relativePath.endsWith(".md") && !relativePath.endsWith(".mdx")) {
      continue;
    }

    urls.add(filePathToUrl(relativePath));
  }

  const buildDate = new Date().toISOString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from(urls)
  .sort()
  .map((url) => `  <url>
    <loc>${siteUrl}${url === "/" ? "" : url}</loc>
    <lastmod>${buildDate}</lastmod>
  </url>`)
  .join("\n")}
</urlset>
`;

  fs.writeFileSync(sitemapOutputPath, xml);
  console.log(`sitemap written to ${sitemapOutputPath}`);
}

function createRobots() {
  const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

  fs.writeFileSync(robotsOutputPath, robots);
  console.log(`robots written to ${robotsOutputPath}`);
}

function createManifest() {
  const manifest = {
    name: "Turborepo 한국어 문서",
    short_name: "Turborepo Docs KO",
    description:
      "Turborepo 공식 문서의 한국어 번역본을 빠르게 탐색할 수 있는 정적 문서 사이트입니다.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#3659f3",
    lang: "ko-KR",
    icons: [
      {
        src: "/images/product-icons/repo-light-32x32.png",
        sizes: "32x32",
        type: "image/png"
      },
      {
        src: "/images/product-icons/repo-dark-32x32.png",
        sizes: "32x32",
        type: "image/png"
      }
    ]
  };

  fs.writeFileSync(manifestOutputPath, JSON.stringify(manifest, null, 2));
  console.log(`manifest written to ${manifestOutputPath}`);
}

function createExamplesData() {
  if (!fs.existsSync(examplesDir)) {
    fs.writeFileSync(examplesOutputPath, "[]\n");
    return;
  }

  const entries = fs
    .readdirSync(examplesDir, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        !entry.name.startsWith(".") &&
        entry.name !== "node_modules" &&
        entry.name !== "with-nextjs"
    )
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => {
      const metaPath = path.join(examplesDir, entry.name, "meta.json");

      if (!fs.existsSync(metaPath)) {
        return [];
      }

      const meta = readJson(metaPath);
      return [
        {
          ...meta,
          slug: entry.name
        }
      ];
    });

  ensureDirectory(path.dirname(examplesOutputPath));
  fs.writeFileSync(examplesOutputPath, JSON.stringify(entries, null, 2));
  console.log(`examples data written to ${examplesOutputPath}`);
}

createSearchIndex();
createExamplesData();
createSitemap();
createRobots();
createManifest();
