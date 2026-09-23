"use client";
// Settings · Shopify (ShopifySettings.jsx): connection, checkout routing,
// catalog mapping, operational switches, webhooks and recent activity — all live.
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ConnectionInfo, StoreSettings } from "@/lib/settings";
import { Btn, CO, Pill, Toast } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { registerWebhooksAction, saveSettingsAction } from "@/app/admin/actions";

const over = (o = {}) => CO.over({ fontSize: 10, color: "var(--ink-muted)", ...o });

function Section({ title, note, right, children }: { title: string; note?: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, paddingBottom: 9, borderBottom: "1px solid var(--hairline-strong)" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={CO.display({ fontSize: 17, margin: 0, color: "var(--ink)", lineHeight: 1.1, textTransform: "uppercase" })}>{title}</h2>
          {note && <p style={{ margin: "7px 0 0", fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.55, color: "var(--ink-muted)", maxWidth: "72ch" }}>{note}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}
function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} style={{ width: 38, height: 22, flexShrink: 0, borderRadius: "var(--r-pill)", border: "1px solid " + (on ? "var(--ink)" : "var(--hairline-strong)"), background: on ? "var(--ink)" : "var(--surface-sunken)", cursor: "pointer", padding: 2, display: "flex", justifyContent: on ? "flex-end" : "flex-start", transition: "all var(--dur) var(--ease)" }}>
      <span style={{ width: 16, height: 16, borderRadius: "50%", background: on ? "var(--on-ink)" : "var(--surface)", boxShadow: "var(--shadow-sm)" }} />
    </button>
  );
}
function ToggleRow({ title, desc, on, onChange }: { title: string; desc: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "13px 0", borderBottom: "1px solid var(--hairline)" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{title}</div>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, lineHeight: 1.5, color: "var(--ink-muted)", marginTop: 3, maxWidth: "66ch" }}>{desc}</div>
      </div>
      <Switch on={on} onChange={onChange} label={title} />
    </div>
  );
}

const ROUTES = [
  { id: "retailCheckout" as const, channel: "Retail · Coffee Lab", target: "Draft order → checkout", detail: "Shopify hosted checkout", pay: "Captured at checkout by Shopify Payments", tag: "channel:retail", roast: "On the Orders board once paid" },
  { id: "wholesaleCheckout" as const, channel: "Wholesale · Private label", target: "Draft order", detail: "Net 30 on account, or card", pay: "Payment terms on the order, or card checkout", tag: "channel:wholesale · private-label", roast: "On the Orders board when placed" },
];
const MAP = [
  { from: "Green lot", to: "Metaobject green_lot", note: "Listing publishes it (ACTIVE); hiding sets it to draft. Photo is a Shopify file." },
  { from: "Our coffees", to: "Products in our-coffees", note: "Tag products blended-stock. Size option: 8 oz / 1 lb / 2 lb / 5 lb." },
  { from: "Bag size", to: "Variant", note: "Variant price is the shelf price shown on the storefront." },
  { from: "Custom blend", to: "Custom line item", note: "Priced from the ratios; recipe rides as line-item properties (_blend)." },
  { from: "Private label run", to: "Draft order lines", note: "Coffee per lb, bags, labels, plate setup and fill as separate lines." },
  { from: "Roast level, notes", to: "Metafields blended.*", note: "roast_level, tasting_notes, wholesale_price, reviews…" },
  { from: "Order stage", to: "Order tags", note: "stage:roasting / stage:packing; shipped = Shopify fulfillment." },
];

export function SettingsView({ conn, initial }: { conn: ConnectionInfo; initial: StoreSettings }) {
  const router = useRouter();
  const [s, setS] = useState(initial);
  const [busy, start] = useTransition();
  const [toast, setToast] = useState<{ msg: string; tone: "success" | "danger" } | null>(null);
  const flash = (msg: string, tone: "success" | "danger" = "success") => { setToast({ msg, tone }); setTimeout(() => setToast(null), 2800); };
  const set = <K extends keyof StoreSettings>(k: K, v: StoreSettings[K]) => setS((x) => ({ ...x, [k]: v }));
  const dirty = JSON.stringify(s) !== JSON.stringify(initial);
  const save = () => start(async () => { const r = await saveSettingsAction(s); if (r.ok) { flash("Settings saved"); router.refresh(); } else flash(r.error, "danger"); });
  const hooks = () => start(async () => { const r = await registerWebhooksAction(); if (r.ok) { flash("Webhooks registered"); router.refresh(); } else flash(r.error, "danger"); });
  const connected = !!conn.shop;

  return (
    <div style={{ maxWidth: 1040, padding: "22px 24px 80px", display: "flex", flexDirection: "column", gap: 34 }}>
      <section style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", padding: "16px 18px", border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", background: "var(--surface)" }}>
        <div style={{ width: 42, height: 42, flexShrink: 0, borderRadius: "var(--r-md)", background: "var(--surface-sunken)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--roast-0)" }}><Icon name="box" size={20} stroke={2} /></div>
        <div style={{ flex: "1 1 260px", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 14.5, fontWeight: 600, color: "var(--ink)" }}>{conn.shop?.name ?? "Shopify"}</span>
            <Pill variant={connected ? "matcha" : "cream"} dot>{connected ? "Connected" : conn.demo ? "Demo mode" : "Not connected"}</Pill>
          </div>
          <div style={CO.data({ fontSize: 11.5, color: "var(--ink-muted)", marginTop: 4 })}>{conn.shop ? `${conn.shop.domain} · Admin API ${conn.apiVersion} · ${conn.shop.currency}` : conn.error || "Add your store credentials to .env to connect."}</div>
        </div>
        <div style={{ display: "flex", gap: 9, flexShrink: 0 }}>
          <Btn size="sm" variant="outline" onClick={() => router.refresh()} iconLeft={<Icon name="refresh" size={14} stroke={2} />}>Check again</Btn>
          <Btn size="sm" variant="primary" disabled={!dirty || busy} onClick={save}>{busy ? "Saving…" : "Save changes"}</Btn>
        </div>
      </section>

      <Section title="Setup checklist" note="Environment variables on this deployment. Run scripts/setup-shopify.ts once to create the definitions, collection and webhooks.">
        <div style={{ border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
          {conn.checks.map((c, i) => (
            <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 16px", borderTop: i ? "1px solid var(--hairline)" : "none" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: c.ok ? "var(--success)" : "var(--warning)" }} />
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", flex: "0 0 170px" }}>{c.label}</span>
              <span style={CO.data({ fontSize: 11.5, color: "var(--ink-muted)", flex: 1, minWidth: 0 })}>{c.ok ? "Configured" : c.hint}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Checkout routing" note="Nothing is billed here. Both storefront tabs hand off to Shopify — retail as a checkout, wholesale as a draft order on account terms — and the order comes back to the Orders board as a roast job.">
        <div style={{ border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1.2fr 44px", gap: 16, padding: "9px 16px", background: "var(--surface-sunken)", borderBottom: "1px solid var(--hairline)" }}>
            <span style={over()}>Storefront tab</span><span style={over()}>Becomes</span><span style={over()}>Payment</span><span />
          </div>
          {ROUTES.map((r, i) => (
            <div key={r.id} style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1.2fr 44px", gap: 16, alignItems: "center", padding: "14px 16px", borderTop: i ? "1px solid var(--hairline)" : "none" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{r.channel}</div>
                <div style={CO.data({ fontSize: 11, color: "var(--ink-subtle)", marginTop: 3 })}>{r.tag}</div>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={CO.data({ fontSize: 13, color: "var(--ink)" })}>{r.target}</div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 11.5, color: "var(--ink-subtle)", marginTop: 3 }}>{r.detail}</div>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, color: "var(--ink-muted)", lineHeight: 1.45 }}>{r.pay}</div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 11.5, color: "var(--ink-subtle)", marginTop: 3 }}>{r.roast}</div>
              </div>
              <Switch on={s[r.id]} onChange={(v) => set(r.id, v)} label={`${r.channel} checkout`} />
            </div>
          ))}
        </div>
        <ToggleRow title="Hold custom blends for a QC cupping" desc="Paid orders with a custom blend land on the board with a QC hold. Shopify still shows them as paid; starting the roast releases the hold." on={s.qcHoldNewBlends} onChange={(v) => set("qcHoldNewBlends", v)} />
      </Section>

      <Section title="Catalog mapping" note="Shopify is the source of truth. The green catalog lives in metaobjects; Our coffees are regular products.">
        <div style={{ border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.6fr", gap: 16, padding: "9px 16px", background: "var(--surface-sunken)", borderBottom: "1px solid var(--hairline)" }}>
            <span style={over()}>Blended</span><span style={over()}>Shopify</span><span style={over()}>Note</span>
          </div>
          {MAP.map((m, i) => (
            <div key={m.from} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.6fr", gap: 16, alignItems: "center", padding: "11px 16px", borderTop: i ? "1px solid var(--hairline)" : "none" }}>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)" }}>{m.from}</span>
              <span style={CO.data({ fontSize: 12.5, color: "var(--ink)" })}>{m.to}</span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.45 }}>{m.note}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Inventory and fulfillment">
        <ToggleRow title="Draw down green on-hand when blend orders are paid" desc="Subtracts the green pounds each blend used (16% roast loss included) from its lot in the green catalog." on={s.drawDownGreen} onChange={(v) => set("drawDownGreen", v)} />
        <ToggleRow title="Email tracking when an order is marked shipped" desc="Marking an order shipped on the Orders board files a Shopify fulfillment; with this on, Shopify emails the customer." on={s.notifyOnShip} onChange={(v) => set("notifyOnShip", v)} />
      </Section>

      <Section title="Webhooks" note="Shopify tells the app what changed. Registering is idempotent — it only adds missing topics for this deployment's URL."
        right={<Btn size="sm" variant="outline" disabled={busy || !connected} onClick={hooks}>Register webhooks</Btn>}>
        <div style={{ border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
          {conn.hooks.map((h, i) => (
            <div key={h.topic} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", borderTop: i ? "1px solid var(--hairline)" : "none", flexWrap: "wrap" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: h.active ? "var(--success)" : "var(--ink-subtle)" }} />
              <span style={CO.data({ fontSize: 12.5, color: "var(--ink)", flex: "0 0 190px" })}>{h.topic.toLowerCase().replace(/_([a-z]+)$/, "/$1")}</span>
              <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--font-sans)", fontSize: 12.5, color: "var(--ink-muted)" }}>{h.use}</span>
              <span style={CO.data({ fontSize: 11.5, color: "var(--ink-subtle)", whiteSpace: "nowrap" })}>{h.active ? `since ${h.last}` : "Not registered"}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Recent activity">
        {conn.activity.length === 0
          ? <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink-muted)" }}>{connected ? "No storefront orders yet." : "Activity appears once the store is connected."}</p>
          : <div>{conn.activity.map((l, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 0", borderBottom: "1px solid var(--hairline)", flexWrap: "wrap" }}>
                <span style={CO.data({ fontSize: 11.5, color: "var(--ink-subtle)", width: 110, flexShrink: 0 })}>{l.t}</span>
                <span style={CO.data({ fontSize: 12, color: "var(--ink)", flex: "0 0 170px" })}>{l.ev}</span>
                <span style={CO.data({ fontSize: 12, color: "var(--ink-muted)", flex: "0 0 90px" })}>{l.ref}</span>
                <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--font-sans)", fontSize: 12.5, color: "var(--ink-muted)" }}>{l.msg}</span>
              </div>
            ))}</div>}
      </Section>
      {toast && <Toast tone={toast.tone}>{toast.msg}</Toast>}
    </div>
  );
}
