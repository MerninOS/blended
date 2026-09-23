"use client";
// Admin chrome (coffeeos/Chrome.jsx): grouped sidebar + sticky header with
// breadcrumbs, search and the title block.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { CO } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";

const NAV = [
  { label: "Operations", items: [
    { href: "/admin/orders", icon: "cart", label: "Orders", countKey: "orders" as const },
    { href: "/admin/green", icon: "bean", label: "Green catalog" },
  ] },
];

function NavItem({ href, icon, label, count, collapsed }: { href: string; icon: string; label: string; count?: number; collapsed: boolean }) {
  const path = usePathname();
  const active = path.startsWith(href);
  const [hover, setHover] = useState(false);
  return (
    <Link href={href} title={collapsed ? label : undefined} aria-current={active ? "page" : undefined}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, padding: collapsed ? "9px 0" : "8px 11px", justifyContent: collapsed ? "center" : "flex-start",
        background: active ? "var(--brand-soft)" : hover ? "var(--surface-hover)" : "transparent", color: active ? "var(--brand)" : "var(--ink-muted)",
        borderRadius: "var(--r-md)", textDecoration: "none", fontFamily: "var(--font-sans)", fontWeight: active ? 600 : 500, fontSize: 13.5, width: "100%",
        transition: "background var(--dur) var(--ease), color var(--dur) var(--ease)" }}>
      {active && <span style={{ position: "absolute", left: 0, top: 6, bottom: 6, width: 3, borderRadius: "0 3px 3px 0", background: "var(--brand)" }} />}
      <Icon name={icon} size={17} stroke={2} />
      {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
      {!collapsed && count != null && count > 0 && (
        <span style={{ ...CO.data({ fontSize: 11 }), padding: "1px 7px", borderRadius: "var(--r-pill)", background: "var(--brand)", color: "#fff" }}>{count}</span>
      )}
    </Link>
  );
}

export function Sidebar({ counts, shopName, demo }: { counts: { orders: number }; shopName: string; demo: boolean }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className="co-sidebar" style={{ width: collapsed ? "var(--nav-w-collapsed)" : "var(--nav-w)", flexShrink: 0, background: "var(--surface)", borderRight: "1px solid var(--hairline)", display: "flex", flexDirection: "column", minHeight: "100vh", position: "sticky", top: 0, alignSelf: "flex-start", transition: "width var(--dur) var(--ease)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, height: "var(--topbar-h)", padding: collapsed ? "0" : "0 16px", justifyContent: collapsed ? "center" : "flex-start", borderBottom: "1px solid var(--hairline)" }}>
        <span className="co-wordmark" style={CO.display({ fontSize: 18, color: "var(--ink)", lineHeight: 1, display: "flex", alignItems: "center", gap: 8 })}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 20px brand mark */}
          {!collapsed && <img src="/brand/blended-mark.png" alt="" width={20} height={20} style={{ width: 20, height: 20, flexShrink: 0 }} />}
          {collapsed ? "B" : "BLENDED"}
        </span>
      </div>
      <nav aria-label="Admin" className="co-navbody" style={{ flex: 1, overflowY: "auto", padding: collapsed ? "12px 8px" : "14px 12px", display: "flex", flexDirection: "column", gap: collapsed ? 4 : 2 }}>
        {!collapsed && (
          <Link href="/" style={{ textAlign: "left", width: "100%", padding: "9px 11px", marginBottom: 8, border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", background: "var(--surface)", display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={CO.over({ fontSize: 9, color: "var(--ink-subtle)" })}>{demo ? "Demo store" : "Store"}</div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2 }}>{shopName}</div>
            </div>
            <span style={{ color: "var(--ink-subtle)", fontSize: 11 }}>↗</span>
          </Link>
        )}
        {NAV.map((g, gi) => (
          <div key={g.label} style={{ marginTop: gi ? 14 : 0, display: "flex", flexDirection: "column", gap: 2 }}>
            {!collapsed && <div style={CO.over({ fontSize: 9.5, color: "var(--ink-subtle)", padding: "0 11px 6px" })}>{g.label}</div>}
            {g.items.map((n) => <NavItem key={n.href} href={n.href} icon={n.icon} label={n.label} count={"countKey" in n && n.countKey ? counts[n.countKey] : undefined} collapsed={collapsed} />)}
          </div>
        ))}
      </nav>
      <div className="co-navfoot" style={{ borderTop: "1px solid var(--hairline)", padding: collapsed ? "10px 8px" : "12px" }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", marginBottom: 8, border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", background: "var(--surface-sunken)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: demo ? "var(--warning)" : "var(--success)", flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{demo ? "Demo mode" : "Shopify connected"}</div>
              <div style={CO.data({ fontSize: 10, color: "var(--ink-subtle)" })}>{demo ? "Sample data · not saved" : "Orders sync live"}</div>
            </div>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <NavItem href="/admin/settings" icon="cog" label="Settings" collapsed={collapsed} />
          <button type="button" className="co-collapse" onClick={() => setCollapsed((c) => !c)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? "9px 0" : "8px 11px", background: "none", border: "none", cursor: "pointer", color: "var(--ink-subtle)", fontFamily: "var(--font-sans)", fontSize: 12.5, fontWeight: 500, width: "100%" }}>
            <span style={{ display: "inline-flex", transform: collapsed ? "rotate(180deg)" : "none" }}><Icon name="chevL" size={16} stroke={2} /></span>
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

export function TopBar({ title, subtitle, breadcrumbs, actions }: { title: string; subtitle?: string; breadcrumbs: string; actions?: ReactNode }) {
  const crumbs = breadcrumbs.split("/").map((s) => s.trim()).filter(Boolean);
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 200, background: "var(--surface)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, height: "var(--topbar-h)", padding: "0 24px", borderBottom: "1px solid var(--hairline)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0, flexShrink: 0 }}>
          {crumbs.map((c, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
              {i > 0 && <span style={{ color: "var(--ink-subtle)", fontSize: 11 }}>/</span>}
              <span style={CO.over({ fontSize: 10, color: i === crumbs.length - 1 ? "var(--ink)" : "var(--ink-muted)" })}>{c}</span>
            </span>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <form action="/admin/logout" method="post">
          <button type="submit" aria-label="Sign out" title="Sign out" style={{ width: 34, height: 34, borderRadius: "var(--r-md)", border: "1px solid var(--hairline)", background: "var(--surface)", color: "var(--ink-muted)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="logout" size={16} stroke={2} />
          </button>
        </form>
      </div>
      <div className="co-titleblock" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, padding: "18px 24px 16px", borderBottom: "1px solid var(--hairline)" }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={CO.display({ fontSize: "clamp(28px,3vw,40px)", lineHeight: 1, margin: 0, color: "var(--ink)", textTransform: "uppercase" })}>{title}</h1>
          {subtitle && <div style={{ marginTop: 8, fontSize: 14, color: "var(--ink-muted)" }}>{subtitle}</div>}
        </div>
        {actions && <div style={{ display: "flex", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>{actions}</div>}
      </div>
    </header>
  );
}
