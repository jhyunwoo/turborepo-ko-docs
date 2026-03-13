import { createRelativeLink } from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle
} from "@/components/geistdocs/docs-page";
import { getMDXComponents } from "@/components/geistdocs/mdx-components";
import { normalizeTitle, toAbsoluteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { source } from "@/lib/source";

type RouteParams = {
  slug?: string[];
};

export default async function DocPage({
  params
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  const page = source.getPage(slug);

  if (!page) {
    notFound();
  }

  const MDX = page.data.body;
  const slugSegments = slug ?? [];
  const canonicalPath = slugSegments.length
    ? `/docs/${slugSegments.join("/")}`
    : "/docs";
  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: siteConfig.name,
      item: toAbsoluteUrl("/")
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "문서",
      item: toAbsoluteUrl("/docs")
    },
    ...slugSegments.map((segment, index) => ({
      "@type": "ListItem",
      position: index + 3,
      name:
        index === slugSegments.length - 1
          ? normalizeTitle(page.data.title)
          : segment.replace(/-/gu, " "),
      item: toAbsoluteUrl(`/docs/${slugSegments.slice(0, index + 1).join("/")}`)
    }))
  ];
  const pageJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: normalizeTitle(page.data.title),
      description:
        page.data.description ||
        page.data.summary ||
        siteConfig.shortDescription,
      url: toAbsoluteUrl(canonicalPath),
      inLanguage: "ko-KR",
      about: "Turborepo",
      isPartOf: {
        "@type": "WebSite",
        name: siteConfig.name,
        url: toAbsoluteUrl("/")
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbItems
    }
  ];

  return (
    <DocsPage
      toc={page.data.toc}
      tableOfContent={{
        style: "clerk"
      }}
    >
      <JsonLd data={pageJsonLd} />
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            components: {
              a: createRelativeLink(source, page)
            }
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export const dynamicParams = false;

export async function generateMetadata({
  params
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = source.getPage(slug);

  if (!page) {
    return {};
  }

  const slugSegments = slug ?? [];
  const canonicalPath = slugSegments.length
    ? `/docs/${slugSegments.join("/")}`
    : "/docs";
  const title = normalizeTitle(page.data.title);
  const description =
    page.data.description ||
    page.data.summary ||
    siteConfig.shortDescription;
  const keywords = [
    "Turborepo",
    title,
    page.data.product,
    page.data.type,
    slugSegments[0]
  ].filter(Boolean) as string[];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalPath
    },
    openGraph: {
      type: "article",
      url: toAbsoluteUrl(canonicalPath),
      title,
      description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: [
        {
          url: toAbsoluteUrl("/og-image.png"),
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [toAbsoluteUrl("/og-image.png")]
    }
  };
}
