"use client";
// Our coffees (Coffee Collection.html): header, sticky All / Single origin /
// House blends tabs (#single, #blend) with a sort, the shelf, and the
// "Can't pick just one?" nudge into the Coffee Lab.
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import type { StockCoffee } from "@/lib/domain/types";
import { CartDrawer } from "@/components/store/CartDrawer";
import { useToast } from "@/components/store/merch/MerchCard";
import { CoffeeCard, defaultSize, priceOf } from "./shelf";

type Filter = "all" | "single" | "blend";
const COPY: Record<Filter, { crumb: string; intro: string; head: React.ReactNode }> = {
  all: { crumb: "Our coffees", intro: "What we have on the shelf this week. Each one comes from a farm we buy from directly and is roasted after you order.",
    head: <>Our <span style={{ color: "var(--brand)" }}>coffees.</span></> },
  single: { crumb: "Single origin", intro: "One farm or washing station per bag, so you taste exactly where it was grown.",
    head: <>Single <span style={{ color: "var(--brand)" }}>origin.</span></> },
  blend: { crumb: "House blends", intro: "The blends we brew on our own bar every day, balanced to taste the same bag after bag.",
    head: <>House <span style={{ color: "var(--brand)" }}>blends.</span></> },
};
const TABS: { f: Filter; label: string }[] = [{ f: "all", label: "All" }, { f: "single", label: "Single origin" }, { f: "blend", label: "House blends" }];
type Sort = "feat" | "light" | "dark" | "low";

// The filter lives in the URL hash (#single / #blend), like the design, so tabs are linkable.
const hashSub = (cb: () => void) => { addEventListener("hashchange", cb); return () => removeEventListener("hashchange", cb); };
const useFilter = (): Filter => {
  const h = useSyncExternalStore(hashSub, () => location.hash.slice(1), () => "");
  return h === "single" || h === "blend" ? h : "all";
};

export function CoffeeCollectionView({ coffees }: { coffees: StockCoffee[] }) {
  const filter = useFilter();
  const [sort, setSort] = useState<Sort>("feat");
  const [toast, toastNode] = useToast();
  const c = COPY[filter];
  const count = (f: Filter) => (f === "all" ? coffees.length : coffees.filter((x) => x.kind === f).length);
  let list = coffees.filter((x) => filter === "all" || x.kind === filter);
  const by = { light: (a: StockCoffee, b: StockCoffee) => a.roast - b.roast, dark: (a: StockCoffee, b: StockCoffee) => b.roast - a.roast,
    low: (a: StockCoffee, b: StockCoffee) => priceOf(a, defaultSize(a)) - priceOf(b, defaultSize(b)) }[sort as Exclude<Sort, "feat">];
  if (by) list = [...list].sort(by);
  const pick = (f: Filter) => history.replaceState(history.state, "", f === "all" ? location.pathname + location.search : `#${f}`);

  return (
    <main className="sh-root">
      <section className="sh-wrap co-head">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <nav aria-label="Breadcrumb">
            <ol className="sh-crumbs sh-over">
              <li><Link href="/">Home</Link></li>
              {filter !== "all" && <li><Link href="/coffees">Our coffees</Link></li>}
              <li aria-current="page">{c.crumb}</li>
            </ol>
          </nav>
          <h1 className="sh-disp" style={{ fontSize: "clamp(48px,8vw,128px)" }}>{c.head}</h1>
        </div>
        <p>{c.intro}</p>
      </section>

      <div className="sh-tools">
        <div className="sh-wrap">
          <nav className="sh-tabs sh-over" aria-label="Filter coffees">
            {TABS.map((t) => (
              <a key={t.f} className="sh-tab" href={t.f === "all" ? "/coffees" : `#${t.f}`} aria-current={t.f === filter ? "page" : undefined}
                onClick={(e) => { e.preventDefault(); pick(t.f); dispatchEvent(new HashChangeEvent("hashchange")); }}>
                {t.label} <span>{count(t.f)}</span>
              </a>
            ))}
          </nav>
          <label className="sh-sort sh-over">
            <span>Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort coffees" data-active={sort !== "feat"} title="Sort coffees">
              <option value="feat">Featured</option>
              <option value="light">Roast: light–dark</option>
              <option value="dark">Roast: dark–light</option>
              <option value="low">Price: low–high</option>
            </select>
          </label>
        </div>
      </div>

      <section className="sh-wrap" style={{ paddingTop: "clamp(28px,3vw,40px)" }} aria-label="Coffees">
        <ul className="sh-grid">
          {list.length
            ? list.map((x) => <CoffeeCard key={x.id} c={x} onAdded={(y) => toast(`Added · ${y.name}`)} />)
            : <li className="co-empty">Nothing on the shelf here right now.</li>}
        </ul>
      </section>

      <section className="sh-wrap">
        <div className="co-seo">
          <h2 className="sh-disp">Can&apos;t pick<br />just <span style={{ color: "var(--brand)" }}>one?</span></h2>
          <div>
            <p>Every coffee here can go into a blend of your own. Choose up to four, set the ratios and the roast, and we pack it with your name on it.</p>
            <p><Link href="/lab#build">Build your blend</Link> · Orders over $50 ship free.</p>
          </div>
        </div>
      </section>
      {toastNode}
      <CartDrawer />
    </main>
  );
}
