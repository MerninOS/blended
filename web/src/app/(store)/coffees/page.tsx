import type { Metadata } from "next";
import { getStockCoffees } from "@/lib/catalog";
import { SITE_NAME, abs } from "@/lib/seo";
import { CoffeeCollectionView } from "@/components/store/coffee/CoffeeCollectionView";
import { JsonLd } from "@/components/seo/JsonLd";
import "../shop.css";

export const revalidate = 300;

const INTRO = "What we have on the shelf this week. Each one comes from a farm we buy from directly and is roasted after you order.";
export const metadata: Metadata = {
  title: "Our Coffees: Single Origins & House Blends",
  description: "Single origins and house blends roasted to order, whole bean or ground. Free shipping on orders over $50.",
  alternates: { canonical: "/coffees" },
  openGraph: { type: "website", title: `Our coffees · ${SITE_NAME}`, description: INTRO, url: abs("/coffees") },
};

export default async function CoffeesPage() {
  const coffees = await getStockCoffees().catch(() => []);
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "CollectionPage", name: "Our coffees", url: abs("/coffees"), description: INTRO,
            mainEntity: { "@type": "ItemList", itemListElement: coffees.map((c, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`/coffees/${c.id}`), name: c.name })) } },
          { "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: abs("/") },
            { "@type": "ListItem", position: 2, name: "Our coffees", item: abs("/coffees") },
          ] },
        ],
      }} />
      <CoffeeCollectionView coffees={coffees} />
    </>
  );
}
