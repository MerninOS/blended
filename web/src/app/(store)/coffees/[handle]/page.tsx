import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCatalog, getStockCoffees } from "@/lib/catalog";
import { abs, absImg, coffeeTitle, describe, fromPrice, productJsonLd } from "@/lib/seo";
import { env } from "@/lib/env";
import { CoffeeProductView } from "@/components/store/coffee/CoffeeProductView";
import { JsonLd } from "@/components/seo/JsonLd";
import "../../shop.css";

export const revalidate = 300;

export async function generateStaticParams() {
  const stock = await getStockCoffees().catch(() => []);
  return stock.map((c) => ({ handle: c.id }));
}

export async function generateMetadata({ params }: PageProps<"/coffees/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const c = (await getStockCoffees().catch(() => [])).find((x) => x.id === handle);
  if (!c) return { title: "Coffee not found" };
  const description = describe(c);
  const img = absImg(c.images?.[0]?.url ?? c.image);
  return {
    title: coffeeTitle(c),
    description,
    alternates: { canonical: `/coffees/${c.id}` },
    openGraph: { type: "website", title: c.name, description, url: abs(`/coffees/${c.id}`), images: img ? [{ url: img, alt: c.name }] : undefined },
    twitter: { card: img ? "summary_large_image" : "summary", title: c.name, description, images: img ? [img] : undefined },
    ...(fromPrice(c) != null ? { other: { "product:price:amount": fromPrice(c)!.toFixed(2), "product:price:currency": env.currency } } : {}),
  };
}

export default async function CoffeePage({ params }: PageProps<"/coffees/[handle]">) {
  const [{ handle }, catalog] = await Promise.all([params, getCatalog()]);
  const c = catalog.stock.find((x) => x.id === handle);
  if (!c) notFound();
  // Related: closest roast first.
  const related = catalog.stock.filter((x) => x.id !== c.id).sort((a, b) => Math.abs(a.roast - c.roast) - Math.abs(b.roast - c.roast)).slice(0, 4);
  // A single origin that's also a green lot opens the Coffee Lab with it already in the blend.
  const lot = c.kind !== "blend" ? catalog.green.find((l) => l.name.toLowerCase() === c.name.toLowerCase() && l.avail > 0) : undefined;
  const blendHref = lot ? `/lab?blend=${encodeURIComponent(`${lot.id}:100`)}#build` : "/lab#build";
  return (
    <>
      <JsonLd data={productJsonLd(c)} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: abs("/") },
        { "@type": "ListItem", position: 2, name: "Our coffees", item: abs("/coffees") },
        { "@type": "ListItem", position: 3, name: c.name, item: abs(`/coffees/${c.id}`) },
      ] }} />
      <CoffeeProductView c={c} related={related} blendHref={blendHref} />
    </>
  );
}
