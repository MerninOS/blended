import type { Metadata } from "next";
import { getGreenLots, getStockCoffees } from "@/lib/catalog";
import { farmsData } from "@/lib/farms";
import { getFarmsCms } from "@/lib/sanity";
import { SHARE_IMAGE, SITE_NAME, abs } from "@/lib/seo";
import { plainHeadline } from "@/lib/landing-copy";
import { JsonLd } from "@/components/seo/JsonLd";
import { FarmsView } from "@/components/store/farms/FarmsView";
import "./farms.css";

export const revalidate = 300;

async function load() {
  const [green, stock, cms] = await Promise.all([getGreenLots().catch(() => []), getStockCoffees().catch(() => []), getFarmsCms()]);
  return farmsData(green, stock, cms);
}

export async function generateMetadata(): Promise<Metadata> {
  const { copy, heroImage } = await load();
  const title = copy.seo.title, description = copy.seo.description;
  const image = /^https?:\/\//.test(heroImage.src) ? { url: heroImage.src, alt: plainHeadline(copy.hero.headline) } : SHARE_IMAGE;
  return {
    title, description, alternates: { canonical: "/farms" },
    openGraph: { type: "website", title: `${title} · ${SITE_NAME}`, description, url: abs("/farms"), images: [image] },
  };
}

export default async function FarmsPage() {
  const data = await load();
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "WebPage", name: plainHeadline(data.copy.hero.headline), url: abs("/farms"), description: data.copy.seo.description },
          { "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: abs("/") },
            { "@type": "ListItem", position: 2, name: plainHeadline(data.copy.hero.headline), item: abs("/farms") },
          ] },
        ],
      }} />
      <FarmsView data={data} />
    </>
  );
}
