import type { Metadata } from "next";
import { getGreenLots, getStockCoffees } from "@/lib/catalog";
import { landingData } from "@/lib/landing";
import { getShopInfo } from "@/lib/shop";
import { siteJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Landing } from "@/components/landing/Landing";

export const revalidate = 300;
export const metadata: Metadata = {
  title: { absolute: "Blended · Build your blend" },
  description: "Coffee from farmers we know by name. Pick up to four, set the ratios, and we roast it to order in your own bag.",
  alternates: { canonical: "/" },
};

export default async function LandingPage() {
  const [green, stock, shop] = await Promise.all([
    getGreenLots().catch(() => []), getStockCoffees().catch(() => []), getShopInfo(),
  ]);
  return (
    <>
      <JsonLd data={siteJsonLd()} />
      <Landing data={landingData(green, stock.length)} policies={shop.policies} />
    </>
  );
}
