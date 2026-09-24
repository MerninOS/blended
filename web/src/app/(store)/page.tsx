import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import { siteJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { CatalogProvider } from "@/components/store/catalog-context";
import { ShopView } from "@/components/store/ShopView";

export const revalidate = 300;
export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function RetailPage() {
  const catalog = await getCatalog();
  return (
    <CatalogProvider catalog={catalog}>
      <JsonLd data={siteJsonLd()} />
      <ShopView />
    </CatalogProvider>
  );
}
