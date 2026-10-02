import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import { CatalogProvider } from "@/components/store/catalog-context";
import { ShopView } from "@/components/store/ShopView";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Coffee Lab · build your blend",
  description: "Build your own coffee blend: pick up to four single-origin green lots, set the ratios and the roast, and we roast it to order with your name on the bag.",
  alternates: { canonical: "/lab" },
};

export default async function LabPage() {
  const catalog = await getCatalog();
  return (
    <CatalogProvider catalog={catalog}>
      <ShopView />
    </CatalogProvider>
  );
}
