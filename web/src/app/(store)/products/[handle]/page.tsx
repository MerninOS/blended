import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMerch } from "@/lib/merch";
import { COLLECTION_META, COLLECTION_PATH, catLabel, priceLabel } from "@/lib/merch-types";
import { env } from "@/lib/env";
import { SITE_NAME, abs } from "@/lib/seo";
import { ProductView } from "@/components/store/merch/ProductView";
import { JsonLd } from "@/components/seo/JsonLd";
import "../../shop.css";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getMerch().catch(() => [])).map((p) => ({ handle: p.handle }));
}

const find = async (handle: string) => (await getMerch()).find((p) => p.handle === handle);

export async function generateMetadata({ params }: PageProps<"/products/[handle]">): Promise<Metadata> {
  const p = await find((await params).handle);
  if (!p) return { title: "Product not found" };
  const description = `${p.blurb} ${priceLabel(p.price)}. Free shipping on orders over $50.`.trim().slice(0, 158);
  const img = p.images[0]?.url;
  return {
    title: `${p.name} · ${catLabel(p.cat)}`,
    description,
    alternates: { canonical: `/products/${p.handle}` },
    openGraph: { type: "website", title: p.name, description: p.blurb, url: abs(`/products/${p.handle}`), images: img ? [{ url: img, alt: p.name }] : undefined },
    twitter: { card: img ? "summary_large_image" : "summary", title: p.name, description: p.blurb, images: img ? [img] : undefined },
    other: { "product:price:amount": p.price.toFixed(2), "product:price:currency": env.currency },
  };
}

export default async function ProductPage({ params }: PageProps<"/products/[handle]">) {
  const [{ handle }, all] = await Promise.all([params, getMerch()]);
  const p = all.find((x) => x.handle === handle);
  if (!p) notFound();
  // Related: same category first.
  const related = all.filter((x) => x.handle !== p.handle).sort((a, b) => +(b.cat === p.cat) - +(a.cat === p.cat)).slice(0, 4);
  const url = abs(`/products/${p.handle}`), cat = catLabel(p.cat);
  const variantName = (o: Record<string, string>) => Object.values(o).join(" / ");
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Product", name: p.name, sku: p.handle, url, category: `${cat} > ${p.type}`, description: p.blurb,
            brand: { "@type": "Brand", name: SITE_NAME },
            ...(p.images.length ? { image: p.images.map((i) => i.url) } : {}),
            offers: p.variants.map((v) => ({
              "@type": "Offer", ...(Object.keys(v.options).length ? { name: variantName(v.options) } : {}),
              price: v.price.toFixed(2), priceCurrency: env.currency, url, itemCondition: "https://schema.org/NewCondition",
              availability: v.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              shippingDetails: { "@type": "OfferShippingDetails", shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" } },
              hasMerchantReturnPolicy: { "@type": "MerchantReturnPolicy", applicableCountry: "US", merchantReturnDays: 30, returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow" },
            })),
          },
          { "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: abs("/") },
            { "@type": "ListItem", position: 2, name: COLLECTION_META.all.crumb, item: abs(COLLECTION_PATH.all) },
            { "@type": "ListItem", position: 3, name: cat, item: abs(COLLECTION_PATH[p.cat]) },
            { "@type": "ListItem", position: 4, name: p.name, item: url },
          ] },
        ],
      }} />
      <ProductView p={p} related={related} />
    </>
  );
}
