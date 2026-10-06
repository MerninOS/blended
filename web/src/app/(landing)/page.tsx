import type { Metadata } from "next";
import { getGreenLots, getStockCoffees } from "@/lib/catalog";
import { landingData } from "@/lib/landing";
import { DEFAULT_COPY, mergeCopy } from "@/lib/landing-copy";
import { getLandingCms, getSiteSettings } from "@/lib/sanity";
import { getShopInfo } from "@/lib/shop";
import { SHARE_IMAGE, siteJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Landing } from "@/components/landing/Landing";

export const revalidate = 300;
export async function generateMetadata(): Promise<Metadata> {
  const [cms, site] = await Promise.all([getLandingCms(), getSiteSettings()]);
  const { seo } = mergeCopy(DEFAULT_COPY, cms);
  return {
    title: { absolute: seo.title }, description: seo.description, alternates: { canonical: "/" },
    openGraph: { type: "website", siteName: site.siteName, title: seo.title, description: seo.description, url: "/", locale: "en_US", images: [SHARE_IMAGE] },
    twitter: { card: "summary_large_image", title: seo.title, description: seo.description },
  };
}

export default async function LandingPage() {
  const [green, stock, shop, cms] = await Promise.all([
    getGreenLots().catch(() => []), getStockCoffees().catch(() => []), getShopInfo(), getLandingCms(),
  ]);
  return (
    <>
      <JsonLd data={siteJsonLd()} />
      <Landing data={landingData(green, stock.length, cms)} policies={shop.policies} />
    </>
  );
}
