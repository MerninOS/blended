"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CartButton } from "./CartDrawer";

const TABS = [
  { href: "/lab", id: "retail", label: "Retail", note: "Bags for home · free shipping over $50" },
  { href: "/wholesale", id: "wholesale", label: "Wholesale", note: "Cafés and private label · 5 lb minimum" },
] as const;

export function StorefrontChrome() {
  const path = usePathname();
  const tab = path.startsWith("/wholesale") ? "wholesale" : "retail";
  const [menu, setMenu] = useState(false);
  const [lastPath, setLastPath] = useState(path);
  if (path !== lastPath) { setLastPath(path); setMenu(false); }
  useEffect(() => {
    if (!menu) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(false); };
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  }, [menu]);

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--surface)", borderBottom: "1px solid var(--hairline)" }}>
      <div className="pc-bar" style={{ maxWidth: "var(--content-max)", margin: "0 auto", display: "flex", alignItems: "center", gap: 24, height: "var(--topbar-h)", padding: "0 24px" }}>
        <button type="button" className="sf-burger" aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
          <span className="sf-burger-lines" data-open={menu}><span></span><span></span><span></span></span>
        </button>
        <Link href="/" className="co-wordmark" aria-label="Blended home" style={{ fontFamily: "var(--font-logo)", fontWeight: 800, fontSize: 17, color: "var(--ink)", letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 22px brand mark */}
          <img src="/brand/blended-mark.png" alt="" width={22} height={22} style={{ width: 22, height: 22, flexShrink: 0 }} />
          <span style={{ fontWeight: 800 }}>BLENDED</span>
        </Link>
        <nav aria-label="Storefront" className="sf-tabs" style={{ display: "flex", gap: 20 }}>
          {TABS.map((t) => (
            <Link key={t.id} href={t.href} className="sf-tab" aria-selected={tab === t.id} aria-current={tab === t.id ? "page" : undefined}>{t.label}</Link>
          ))}
        </nav>
        <span style={{ flex: 1 }} />
        <span className="pc-facility" style={{ fontFamily: "var(--font-mono)", fontVariationSettings: "var(--data-settings)", fontSize: 11.5, color: "var(--ink-muted)" }}>
          {tab === "retail" ? "Free shipping over $50" : "Minimum 5 lb per order"}
        </span>
        {tab === "retail" && <CartButton />}
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
