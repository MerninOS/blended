"use client";
// Merch & gear collection (Merch Gear Collection.html): header, sticky
// All / Merch / Brew gear tabs with a sort, the product grid, and the copy block.
import Link from "next/link";
import { useState } from "react";
import { COLLECTION_META, COLLECTION_PATH, type CollectionFilter, type MerchProduct } from "@/lib/merch-types";
import { CartDrawer } from "@/components/store/CartDrawer";
import { MerchCard, useToast } from "./MerchCard";

const HEAD: Record<CollectionFilter, React.ReactNode> = {
  all: <>Merch &amp; <span style={{ color: "var(--brand)" }}>gear.</span></>,
  merch: <span style={{ color: "var(--brand)" }}>Merch.</span>,
  gear: <>Brew <span style={{ color: "var(--brand)" }}>gear.</span></>,
};
const TABS: { f: CollectionFilter; label: string }[] = [{ f: "all", label: "All" }, { f: "merch", label: "Merch" }, { f: "gear", label: "Brew gear" }];
type Sort = "feat" | "low" | "high";

export function CollectionView({ filter, products }: { filter: CollectionFilter; products: MerchProduct[] }) {
  const [sort, setSort] = useState<Sort>("feat");
  const [toast, toastNode] = useToast();
  const c = COLLECTION_META[filter];
  const count = (f: CollectionFilter) => (f === "all" ? products.length : products.filter((p) => p.cat === f).length);
  let list = products.filter((p) => filter === "all" || p.cat === filter);
  if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);

  return (
    <main className="sh-root">
      <section className="sh-wrap co-head">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <nav aria-label="Breadcrumb">
            <ol className="sh-crumbs sh-over">
              <li><Link href="/">Home</Link></li>
              {filter !== "all" && <li><Link href={COLLECTION_PATH.all}>Merch &amp; gear</Link></li>}
              <li aria-current="page">{c.crumb}</li>
            </ol>
          </nav>
          <h1 className="sh-disp" style={{ fontSize: "clamp(48px,8vw,128px)" }}>{HEAD[filter]}</h1>
        </div>
        <p>{c.intro}</p>
      </section>

      <div className="sh-tools">
        <div className="sh-wrap">
          <nav className="sh-tabs sh-over" aria-label="Filter products">
            {TABS.map((t) => (
              <Link key={t.f} className="sh-tab" href={COLLECTION_PATH[t.f]} aria-current={t.f === filter ? "page" : undefined} scroll={false}>
                {t.label} <span>{count(t.f)}</span>
              </Link>
            ))}
          </nav>
          <label className="sh-sort sh-over">
            <span>Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort products" data-active={sort !== "feat"} title="Sort products">
              <option value="feat">Featured</option>
              <option value="low">Price: low–high</option>
              <option value="high">Price: high–low</option>
            </select>
          </label>
        </div>
      </div>

      <section className="sh-wrap" style={{ paddingTop: "clamp(28px,3vw,40px)" }} aria-label="Products">
        <ul className="sh-grid">
          {list.length
            ? list.map((p, i) => <MerchCard key={p.handle} p={p} hot={i === 0} onAdded={(x) => toast(`Added · ${x.name}`)} />)
            : <li className="co-empty">Nothing here yet.</li>}
        </ul>
      </section>

      <section className="sh-wrap">
        <div className="co-seo">
          <h2 className="sh-disp">Gear from<br />our bar.</h2>
          <div>
            <p>Everything here is something we use or wear at the roastery. The brew gear is what we dial in our coffees with: a hand grinder with stainless conical burrs, a gooseneck kettle for controlled pours, a ceramic dripper and a scale that reads to a tenth of a gram.</p>
            <p>New to brewing at home? Start with the dripper, filters and scale, then <Link href="/lab#build">build a blend</Link> to brew with. Orders over $50 ship free.</p>
          </div>
        </div>
      </section>
      {toastNode}
      <CartDrawer />
    </main>
  );
}
