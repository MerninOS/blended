import type { Metadata, Viewport } from "next";
import { env } from "@/lib/env";
import { getSiteSettings } from "@/lib/sanity";
import { fontVars } from "./fonts";
import "./globals.css";

// Site name, default title, title ending and description come from Sanity's "Site settings"
// (with defaults in lib/site-settings.ts); the share image is served by opengraph-image.tsx.
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    metadataBase: new URL(env.appUrl),
    title: { default: s.title, template: `%s ${s.titleSuffix}`.trim() },
    description: s.description,
    applicationName: s.siteName,
    icons: { icon: "/brand/icon.svg", apple: "/brand/blended-mark.png" },
    openGraph: { type: "website", siteName: s.siteName, title: s.title, description: s.description, locale: "en_US" },
    twitter: { card: "summary_large_image", title: s.title, description: s.description },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFFFFF",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-product="coroasted-coffee-os" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
