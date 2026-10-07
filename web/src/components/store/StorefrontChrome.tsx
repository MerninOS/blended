"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CartButton } from "./CartDrawer";

const TABS = [
  { href: "/coffees", id: "coffees", label: "Coffees", note: "Single origins and house blends, roasted to order" },
  { href: "/lab", id: "retail", label: "Coffee Lab", note: "Build your own blend · free shipping over $50" },
  { href: "/collections/merch", id: "merch", label: "Merch", note: "Caps, tees and mugs from the roastery" },
  { href: "/collections/gear", id: "gear", label: "Gear", note: "The brew gear we use on our own bar" },
  { href: "/wholesale", id: "wholesale", label: "Wholesale", note: "Cafés and private label · 5 lb minimum" },
] as const;
type TabId = (typeof TABS)[number]["id"] | null;
const tabOf = (path: string): TabId =>
  path.startsWith("/wholesale") ? "wholesale" : path.startsWith("/coffees") ? "coffees" : path.startsWith("/collections/merch-and-gear") || path.startsWith("/products/") ? null
    : path.startsWith("/collections/merch") ? "merch" : path.startsWith("/collections/gear") ? "gear" : "retail";

export function StorefrontChrome() {
  const path = usePathname();
  const tab = tabOf(path);
  const [menu, setMenu] = useState(false);
  const [lastPath, setLastPath] = useState(path);
  if (path !== lastPath) { setLastPath(path); setMenu(false); }
  // Phones and tablets: the header slides away while scrolling down and comes back on the way up.
  // On the Coffee Lab it stays out of the way the whole time the cup is pinned at the top (either
  // direction), and is back once the cup has scrolled off. Desktop never hides it.
  // <html data-head-hidden> lets things pinned under it (the Lab's cup, the shop toolbar) move up too.
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = scrollY;
    const f = () => {
      if (innerWidth > 1024) { setHidden(false); last = scrollY; return; }
      const lab = document.querySelector<HTMLElement>(".cp-layout"), cup = lab?.querySelector<HTMLElement>(".cp-layout-cup");
      if (lab && cup) {
        const r = lab.getBoundingClientRect(), headH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--topbar-h")) || 52;
        setHidden(r.top <= headH && r.bottom > cup.offsetHeight); last = scrollY; return;
      }
      const y = scrollY, d = y - last;
      if (Math.abs(d) < 6) return;
      setHidden(d > 0 && y > 80); last = y;
    };
    f();
    addEventListener("scroll", f, { passive: true }); addEventListener("resize", f);
    return () => { removeEventListener("scroll", f); removeEventListener("resize", f); delete document.documentElement.dataset.headHidden; };
  }, [path]);
  const off = hidden && !menu;
  useEffect(() => { document.documentElement.dataset.headHidden = String(off); }, [off]);
  useEffect(() => {
    if (!menu) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(false); };
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  }, [menu]);

  return (
    <header className="sf-head" data-hidden={off} style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--surface)", borderBottom: "1px solid var(--hairline)" }}>
      <div className="pc-bar" style={{ maxWidth: "var(--content-max)", margin: "0 auto", display: "flex", alignItems: "center", gap: 24, height: "var(--topbar-h)", padding: "0 24px" }}>
        <button type="button" className="sf-burger" aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
          <span className="sf-burger-lines" data-open={menu}><span></span><span></span><span></span></span>
        </button>
        <Link href="/" className="co-wordmark" aria-label="Blended home" style={{ fontFamily: "var(--font-logo)", fontWeight: 800, fontSize: 17, color: "var(--ink)", letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <span style={{ fontWeight: 800 }}>BLENDED</span>
        </Link>
        <nav aria-label="Storefront" className="sf-tabs" style={{ display: "flex", gap: 20 }}>
          {TABS.map((t) => (
            <Link key={t.id} href={t.href} className="sf-tab" aria-selected={tab === t.id} aria-current={tab === t.id ? "page" : undefined}>{t.label}</Link>
          ))}
        </nav>
        <span style={{ flex: 1 }} />
        <span className="pc-facility" style={{ fontFamily: "var(--font-mono)", fontVariationSettings: "var(--data-settings)", fontSize: 11.5, color: "var(--ink-muted)" }}>
          {tab === "wholesale" ? "Minimum 5 lb per order" : "Free shipping over $50"}
        </span>
        {tab !== "wholesale" && <CartButton />}
      </div>
      {menu && <>
        <div className="sf-menu-scrim" onClick={() => setMenu(false)}></div>
        <nav className="sf-menu" aria-label="Storefront menu">
          {TABS.map((t) => (
            <Link key={t.id} href={t.href} className="sf-menu-item" aria-current={tab === t.id ? "page" : undefined} onClick={() => setMenu(false)}>
              <span>{t.label}</span>
              <span className="sf-menu-note">{t.note}</span>
            </Link>
          ))}
        </nav>
      </>}
    </header>
  );
}
