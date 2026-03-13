import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { toAbsoluteUrl } from "@/lib/seo";
import { Providers } from "@/components/providers";
import { siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(toAbsoluteUrl("/")),
  applicationName: siteConfig.name,
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: toAbsoluteUrl("/"),
    title: siteConfig.name,
    description: siteConfig.shortDescription,
    siteName: siteConfig.name,
    images: [
      {
        url: toAbsoluteUrl("/og-image.png"),
        width: 1200,
        height: 630,
        alt: siteConfig.name
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.shortDescription,
    images: [toAbsoluteUrl("/og-image.png")]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  icons: {
    icon: "/images/product-icons/repo-dark-32x32.png"
  },
  manifest: "/site.webmanifest",
  category: "documentation"
};

const rootJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: toAbsoluteUrl("/"),
    inLanguage: "ko-KR",
    description: siteConfig.shortDescription
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Turborepo",
    url: "https://turborepo.com",
    sameAs: [
      "https://github.com/vercel/turborepo",
      "https://twitter.com/turborepo"
    ]
  }
];

export default function RootLayout({
  children
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="site-shell">
        <JsonLd data={rootJsonLd} />
        <Providers>
          <SiteHeader />
          <div className="relative min-h-screen pt-[4.5rem]">{children}</div>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
