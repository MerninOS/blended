import { getCatalog } from "@/lib/catalog";
import { CatalogProvider } from "@/components/store/catalog-context";
import { ShopView } from "@/components/store/ShopView";

export const revalidate = 300;

export default async function RetailPage() {
  const catalog = await getCatalog();
  return (
    <CatalogProvider catalog={catalog}>
      <ShopView />
    </CatalogProvider>
  );
}
