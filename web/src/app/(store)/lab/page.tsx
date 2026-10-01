import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import { CatalogProvider } from "@/components/store/catalog-context";
import { ShopView } from "@/components/store/ShopView";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Coffee Lab · start from our recipe or build your blend",
  description: "Start from one of our coffees and adjust the ratio, or build your own blend from up to four single-origin green lots. Set the roast and we roast it to order with your name on the bag.",
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
