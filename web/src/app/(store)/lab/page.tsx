import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import { CatalogProvider } from "@/components/store/catalog-context";
import { ShopView } from "@/components/store/ShopView";
import { landingData } from "@/lib/landing";
import { getSettings } from "@/lib/settings";
import { isExclusive } from "@/lib/domain/coffee";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Coffee Lab · build your blend",
  description: "Build your own coffee blend: pick up to four single-origin green lots, set the ratios and the roast, and we roast it to order with your name on the bag.",
  alternates: { canonical: "/lab" },
};

export default async function LabPage() {
  const [all, settings] = await Promise.all([getCatalog(), getSettings()]);
  // SMS exclusives switched off: those lots aren't offered at all (checkout refuses them too)
  const catalog = settings.smsExclusives ? all : { ...all, green: all.green.filter((l) => !isExclusive(l)) };
  return (
    <CatalogProvider catalog={catalog}>
      <ShopView intro={landingData(catalog.green, catalog.stock.length).intro} />
    </CatalogProvider>
  );
}
