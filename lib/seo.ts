const fallbackSiteUrl = "https://turborepo-docs-ko.vercel.app";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/u, "") || fallbackSiteUrl;

export function toAbsoluteUrl(path = "/") {
  if (!path || path === "/") {
    return siteUrl;
  }

  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function normalizeTitle(title: string) {
  return title.replace(/\s+/gu, " ").trim();
}
