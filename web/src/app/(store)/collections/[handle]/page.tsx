import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMerch } from "@/lib/merch";
import { COLLECTION_META, COLLECTION_PATH, type CollectionFilter } from "@/lib/merch-types";
import { SITE_NAME, abs } from "@/lib/seo";
import { CollectionView } from "@/components/store/merch/CollectionView";
import { JsonLd } from "@/components/seo/JsonLd";
import "../../shop.css";

export const revalidate = 300;
export const dynamicParams = false;

const FILTER: Record<string, CollectionFilter> = { "merch-and-gear": "all", merch: "merch", gear: "gear" };
export const generateStaticParams = () => Object.keys(FILTER).map((handle) => ({ handle }));

const DESCRIPTION: Record<CollectionFilter, string> = {
  all: "Shop Blended merch and home brew gear: caps, tees, mugs, hand grinders, gooseneck kettles, drippers and scales. Free shipping on orders over $50.",
  merch: "Blended caps, tees, hoodies and mugs from the roastery, printed and embroidered in small runs. Free shipping on orders over $50.",
  gear: "The grinders, kettles, drippers and scales we use on our own bar, picked for brewing at home. Free shipping on orders over $50.",
};

export async function generateMetadata({ params }: PageProps<"/collections/[handle]">): Promise<Metadata> {
  const f = FILTER[(await params).handle];
  if (!f) return {};
  const m = COLLECTION_META[f];
  return {
    title: m.title, description: DESCRIPTION[f],
    alternates: { canonical: COLLECTION_PATH[f] },
    openGraph: { type: "website", title: `${m.title} · ${SITE_NAME}`, description: m.intro, url: abs(COLLECTION_PATH[f]) },
  };
}

export default async function CollectionPage({ params }: PageProps<"/collections/[handle]">) {
  const filter = FILTER[(await params).handle];
  if (!filter) notFound();
  const products = await getMerch();
  const list = products.filter((p) => filter === "all" || p.cat === filter);
  const m = COLLECTION_META[filter];
  const crumbs = [{ name: "Home", url: abs("/") }, ...(filter === "all" ? [] : [{ name: COLLECTION_META.all.crumb, url: abs(COLLECTION_PATH.all) }]), { name: m.crumb, url: abs(COLLECTION_PATH[filter]) }];
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "CollectionPage", name: m.crumb, url: abs(COLLECTION_PATH[filter]), description: m.intro,
            mainEntity: { "@type": "ItemList", itemListElement: list.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`/products/${p.handle}`), name: p.name })) } },
          { "@type": "BreadcrumbList", itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.url })) },
        ],
      }} />
      <CollectionView filter={filter} products={products} />
    </>
  );
}
