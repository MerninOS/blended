import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCatalog, getStockCoffees } from "@/lib/catalog";
import { SHOP_SIZES, money, stockBagPrice } from "@/lib/domain/coffee";
import { abs, absImg, describe, productJsonLd, roastLabel } from "@/lib/seo";
import { CatalogProvider } from "@/components/store/catalog-context";
import { ShopView } from "@/components/store/ShopView";
import { JsonLd } from "@/components/seo/JsonLd";
import { disp, mono, over } from "@/components/ui/primitives";

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
  const img = absImg(c.image);
  return {
    title: `${c.name} · ${roastLabel(c.roast)} roast`,
    description,
    alternates: { canonical: `/coffees/${c.id}` },
    openGraph: { type: "website", title: c.name, description, url: abs(`/coffees/${c.id}`), images: img ? [{ url: img, alt: c.name }] : undefined },
    twitter: { card: img ? "summary_large_image" : "summary", title: c.name, description, images: img ? [img] : undefined },
  };
}

export default async function CoffeePage({ params }: PageProps<"/coffees/[handle]">) {
  const { handle } = await params;
  const catalog = await getCatalog();
  const c = catalog.stock.find((x) => x.id === handle);
  if (!c) notFound();
  const from = Math.min(...SHOP_SIZES.map((s) => stockBagPrice(c, s)));
  const intro = (
    <section style={{ maxWidth: "var(--content-max)", margin: "0 auto", padding: "28px 24px 4px", display: "flex", flexDirection: "column", gap: 10 }}>
      <nav aria-label="Breadcrumb" style={{ ...over, fontSize: 10, color: "var(--ink-subtle)" }}>
        <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Our coffees</Link> / {c.name}
      </nav>
      <h1 style={{ ...disp, fontSize: "clamp(28px, 4vw, 44px)", margin: 0, color: "var(--ink)", lineHeight: 1 }}>{c.name}</h1>
      <p style={{ margin: 0, ...mono, fontSize: 12.5, color: "var(--ink-muted)" }}>{roastLabel(c.roast)} roast · {c.sub} · from {money(from)}</p>
      {c.blurb && <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 15, lineHeight: 1.6, color: "var(--ink)", maxWidth: "68ch" }}>{c.blurb}</p>}
    </section>
  );
  return (
    <CatalogProvider catalog={catalog}>
      <JsonLd data={productJsonLd(c)} />
      <ShopView initialSkuId={c.id} productPage intro={intro} />
    </CatalogProvider>
  );
}
