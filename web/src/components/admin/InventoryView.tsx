"use client";
// Inventory: green is the only stock. Coffees shows what each of Our coffees is
// roasted from (its recipe), the green a 1 lb bag takes (roast loss included)
// and how many bags the green on hand can roast per size — with Shopify's count
// next to it when the sync is on. Ledger shows what recent orders took, and
// catches any order with coffee that never had its green deducted.
import { Fragment, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SelItem } from "@/lib/domain/types";
import type { Linked, RoastLoss } from "@/lib/domain/green";
import type { LedgerRow } from "@/lib/green-ledger";
import { Btn, CO, Pill, Toast, type PillVariant } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { StatStrip, Tabs } from "./parts";
import { deductOrderAction, saveRecipeAction, syncNowAction } from "@/app/admin/actions";

export interface CoffeeRow {
  id: string; gid?: string; name: string; sub: string; roast: number;
  link: Linked | null;
  perLb: { id: string; name: string; g: number }[];
  sizes: { label: string; bags: number | null; shopify: number | null }[];
}
type Lot = { id: string; name: string; lb: number; listed: boolean };

const cell = { padding: "11px 14px", verticalAlign: "top" as const, borderBottom: "1px solid var(--hairline)" };
const th = (al: "left" | "right" = "left") => ({ textAlign: al, padding: "9px 14px", whiteSpace: "nowrap" as const, ...CO.over({ fontSize: 10, color: "var(--ink-muted)" }) });
const sans = (o = {}) => ({ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", ...o });
const lb = (g: number) => (g / 453.592).toLocaleString("en-US", { maximumFractionDigits: 1 });

const SOURCE: Record<string, { label: string; v: PillVariant; hint?: string }> = {
  recipe: { label: "Recipe", v: "matcha" },
  description: { label: "From description", v: "sun", hint: "Read from the product description. Save it as a recipe to confirm." },
  name: { label: "Matched by name", v: "sun", hint: "Same name as a green lot, so 100% of it. Save it as a recipe to confirm." },
};

function Table({ head, children, min = 860 }: { head: [string, "left" | "right"][]; children: React.ReactNode; min?: number }) {
  return (
    <div style={{ border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", overflow: "hidden", background: "var(--surface)" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: min }}>
          <thead><tr style={{ background: "var(--surface-sunken)" }}>{head.map(([h, al], i) => <th key={i} scope="col" style={{ ...th(al), borderBottom: "1px solid var(--hairline)" }}>{h}</th>)}</tr></thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

function RecipeEditor({ row, lots, onClose, flash }: { row: CoffeeRow; lots: Lot[]; onClose: () => void; flash: (m: string, t?: "success" | "danger") => void }) {
  const router = useRouter();
  const [busy, start] = useTransition();
  const [parts, setParts] = useState<SelItem[]>(() => row.link && !row.link.missing.length ? row.link.sel.map((s) => ({ ...s })) : [{ id: lots[0]?.id ?? "", pct: 100 }]);
  const total = parts.reduce((a, p) => a + (Number(p.pct) || 0), 0);
  const free = lots.filter((l) => !parts.some((p) => p.id === l.id));
  const up = (i: number, patch: Partial<SelItem>) => setParts((ps) => ps.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const inp = { height: 34, padding: "0 10px", border: "1px solid var(--hairline-strong)", borderRadius: "var(--r-sm)", background: "var(--surface)", ...sans() };
  const save = () => start(async () => {
    const r = await saveRecipeAction(row.id, row.gid, parts);
    if (r.ok) { flash(`Recipe saved for ${row.name}`); onClose(); router.refresh(); } else flash(r.error, "danger");
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 14px", background: "var(--surface-sunken)", borderRadius: "var(--r-md)", maxWidth: 560 }}>
      {parts.map((p, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select value={p.id} onChange={(e) => up(i, { id: e.target.value })} aria-label={`Green lot ${i + 1}`} style={{ ...inp, flex: 1, minWidth: 0 }}>
            {lots.filter((l) => l.id === p.id || !parts.some((x) => x.id === l.id)).map((l) => <option key={l.id} value={l.id}>{l.name}{l.listed ? "" : " (hidden in the Lab)"}</option>)}
          </select>
          <span style={{ position: "relative", width: 84, flexShrink: 0 }}>
            <input type="number" min={1} max={100} value={p.pct} aria-label={`Share of lot ${i + 1}, percent`} onChange={(e) => up(i, { pct: Number(e.target.value) })} style={{ ...inp, width: "100%", paddingRight: 24, ...CO.data({ fontSize: 13 }) }} />
            <span aria-hidden="true" style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", ...CO.data({ fontSize: 12, color: "var(--ink-subtle)" }) }}>%</span>
          </span>
          <button type="button" aria-label="Remove lot" disabled={parts.length < 2} onClick={() => setParts((ps) => ps.filter((_, j) => j !== i))}
            style={{ ...inp, width: 34, padding: 0, cursor: parts.length < 2 ? "default" : "pointer", opacity: parts.length < 2 ? .4 : 1 }}>−</button>
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {parts.length < 4 && free.length > 0 && <Btn size="sm" variant="outline" icon={<Icon name="plus" size={14} />} onClick={() => setParts((ps) => [...ps, { id: free[0].id, pct: 0 }])}>Add a lot</Btn>}
        <span style={{ flex: 1 }} />
        <span style={CO.data({ fontSize: 12, color: total === 100 ? "var(--ink-muted)" : "var(--danger)" })}>{total}% of 100%</span>
        <Btn size="sm" variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn size="sm" variant="primary" disabled={busy || total !== 100} onClick={save}>{busy ? "Saving…" : "Save recipe"}</Btn>
      </div>
    </div>
  );
}

export function InventoryView({ rows, lots, ledger, settings, demo }: {
  rows: CoffeeRow[]; lots: Lot[]; ledger: LedgerRow[] | null; demo: boolean;
  settings: { syncStock: boolean; drawDownGreen: boolean; roastLoss: RoastLoss };
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"coffees" | "ledger">("coffees");
  const [editing, setEditing] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; tone: "success" | "danger" } | null>(null);
  const [busy, start] = useTransition();
  const flash = (msg: string, tone: "success" | "danger" = "success") => { setToast({ msg, tone }); setTimeout(() => setToast(null), 3200); };

  const linked = rows.filter((r) => r.link && !r.link.missing.length).length;
  const attention = rows.filter((r) => !r.link || r.link.missing.length || r.link.source !== "recipe").length;
  const missing = ledger?.filter((r) => r.state === "missing") ?? [];
  const syncNow = () => start(async () => { const r = await syncNowAction(); if (r.ok) { flash(r.changed ? `Updated ${r.changed} counts in Shopify` : "Shopify already matches the green"); router.refresh(); } else flash(r.error, "danger"); });
  const deduct = (o: LedgerRow) => start(async () => { const r = await deductOrderAction(o.id); if (r.ok) { flash(`Green deducted for ${o.name}`); router.refresh(); } else flash(r.error, "danger"); });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "20px clamp(16px,3vw,32px) 48px", minWidth: 0 }}>
      <StatStrip items={[
        { label: "Coffees linked to green", value: `${linked} / ${rows.length}` },
        { label: "Recipes to confirm", value: attention },
        { label: "Orders missing a deduction", value: ledger ? missing.length : "—", live: missing.length > 0 },
        { label: "Shopify stock sync", value: settings.syncStock ? "On" : "Off" },
      ]} />
      <p style={sans({ margin: 0, fontSize: 13, lineHeight: 1.6, color: "var(--ink-muted)", maxWidth: "80ch" })}>
        Every bag is roasted to order, so a bag takes green: its weight ÷ (1 − roast loss) — {settings.roastLoss.join(" / ")}% from light to dark, set in <Link href="/admin/settings" style={{ color: "var(--ink)" }}>Settings</Link>.
        {settings.drawDownGreen ? " Orders from any channel deduct it when placed." : " Green draw-down is off in Settings, so orders aren’t deducting green."}
        {settings.syncStock ? " Shopify’s counts for Our coffees follow the green." : " Shopify still sells Our coffees untracked; turn on the stock sync in Settings once the recipes look right."}
      </p>

      <Tabs tabs={[{ id: "coffees", label: "Coffees", count: rows.length }, { id: "ledger", label: "Ledger", count: missing.length || undefined }]} active={tab} onChange={setTab} />

      {tab === "coffees" ? (
        <>
          {settings.syncStock && !demo && <div style={{ display: "flex", justifyContent: "flex-end" }}><Btn size="sm" variant="outline" disabled={busy} icon={<Icon name="refresh" size={14} />} onClick={syncNow}>Sync Shopify now</Btn></div>}
          <Table head={[["Coffee", "left"], ["Roasted from", "left"], ["Green per 1 lb bag", "left"], ...rows[0]?.sizes.map((s): [string, "right"] => [s.label, "right"]) ?? [], ["", "right"]]} min={980}>
            {rows.map((r) => {
              const src = r.link ? SOURCE[r.link.source] : null, bad = !r.link || r.link.missing.length > 0;
              return (
                <Fragment key={r.id}>
                  <tr>
                    <td style={cell}>
                      <div style={sans({ fontWeight: 600 })}>{r.name}</div>
                      <div style={sans({ fontSize: 11.5, color: "var(--ink-subtle)", marginTop: 2 })}>{r.sub}</div>
                    </td>
                    <td style={cell}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
                        {r.link?.sel.map((s) => <span key={s.id} style={sans({ fontSize: 12.5 })}><span style={CO.data({ fontSize: 12 })}>{s.pct}%</span> {lots.find((l) => l.id === s.id)?.name ?? s.id}</span>)}
                        {bad ? <Pill variant="tomato">{r.link ? `Unknown lot: ${r.link.missing.join(", ")}` : "Not linked to green"}</Pill>
                          : src && <span title={src.hint}><Pill variant={src.v}>{src.label}</Pill></span>}
                      </div>
                    </td>
                    <td style={cell}>
                      {r.perLb.length ? r.perLb.map((p) => <div key={p.id} style={sans({ fontSize: 12.5, whiteSpace: "nowrap" })}><span style={CO.data({ fontSize: 12 })}>{p.g} g</span> {p.name}</div>)
                        : <span style={sans({ fontSize: 12.5, color: "var(--ink-subtle)" })}>{bad && !r.link ? "Sold without touching green" : "—"}</span>}
                    </td>
                    {r.sizes.map((s) => (
                      <td key={s.label} style={{ ...cell, textAlign: "right" }}>
                        <div style={CO.data({ fontSize: 13, color: s.bags === 0 ? "var(--danger)" : s.bags == null ? "var(--ink-subtle)" : "var(--ink)" })}>{s.bags == null ? "∞" : s.bags.toLocaleString("en-US")}</div>
                        {s.shopify != null && <div title="Shopify's count" style={CO.data({ fontSize: 11, color: s.shopify === s.bags ? "var(--ink-subtle)" : "var(--warning)", marginTop: 2 })}>Shopify {s.shopify}</div>}
                      </td>
                    ))}
                    <td style={{ ...cell, textAlign: "right" }}>
                      <Btn size="sm" variant="outline" onClick={() => setEditing(editing === r.id ? null : r.id)}>{bad ? "Set recipe" : "Edit"}</Btn>
                    </td>
                  </tr>
                  {editing === r.id && (
                    <tr><td colSpan={4 + r.sizes.length} style={{ ...cell, paddingTop: 0 }}>
                      <RecipeEditor row={r} lots={lots} onClose={() => setEditing(null)} flash={flash} />
                    </td></tr>
                  )}
                </Fragment>
              );
            })}
          </Table>
          <p style={sans({ margin: 0, fontSize: 12, color: "var(--ink-subtle)" })}>Bags each size can sell on its own from the green on hand; sizes share that green. ∞ = not linked, so not limited by green.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {lots.map((l) => <span key={l.id} style={{ padding: "6px 10px", border: "1px solid var(--hairline)", borderRadius: "var(--r-pill)", ...sans({ fontSize: 12 }) }}>{l.name} <span style={CO.data({ fontSize: 11.5, color: "var(--ink-muted)" })}>{l.lb.toLocaleString("en-US")} lb</span></span>)}
          </div>
        </>
      ) : !ledger ? (
        <p style={sans({ color: "var(--ink-muted)" })}>{demo ? "The ledger reads orders from Shopify. Connect a store to see it." : "Couldn’t read orders from Shopify. Check the app has the read_orders permission (Settings → Setup checklist)."}</p>
      ) : (
        <>
          {missing.length > 0 && (
            <div role="status" style={{ padding: "12px 14px", borderRadius: "var(--r-md)", background: "var(--warning-soft)", ...sans({ fontSize: 13, lineHeight: 1.5 }) }}>
              {missing.length} {missing.length === 1 ? "order has" : "orders have"} coffee but never had green deducted — usually orders placed before this was set up, or while draw-down was off. Deduct them to bring the green back in line.
            </div>
          )}
          <Table head={[["Order", "left"], ["Placed", "left"], ["Channel", "left"], ["Green taken", "left"], ["Status", "left"], ["", "right"]]} min={760}>
            {ledger.length === 0 && <tr><td colSpan={6} style={{ ...cell, ...sans({ color: "var(--ink-subtle)" }) }}>No orders with coffee in the last 30 days.</td></tr>}
            {ledger.map((o) => (
              <tr key={o.id}>
                <td style={cell}><span style={CO.data({ fontSize: 13 })}>{o.name}</span></td>
                <td style={cell}><span style={sans({ fontSize: 12.5, color: "var(--ink-muted)", whiteSpace: "nowrap" })}>{new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span></td>
                <td style={cell}><span style={sans({ fontSize: 12.5 })}>{o.channel}</span></td>
                <td style={cell}>
                  {o.lots.map((l) => <div key={l.id} style={sans({ fontSize: 12.5, whiteSpace: "nowrap" })}><span style={CO.data({ fontSize: 12 })}>{l.g.toLocaleString("en-US")} g</span> {l.name} <span style={{ color: "var(--ink-subtle)" }}>({lb(l.g)} lb)</span></div>)}
                  {o.unlinked.length > 0 && <div style={sans({ fontSize: 11.5, color: "var(--warning)", marginTop: 4 })}>Not linked: {o.unlinked.join(", ")}</div>}
                </td>
                <td style={cell}>
                  <Pill variant={o.state === "deducted" ? "matcha" : o.state === "restocked" ? "fog" : o.state === "missing" ? "tomato" : "sun"}>
                    {o.state === "deducted" ? "Deducted" : o.state === "restocked" ? "Put back" : o.state === "missing" ? "Not deducted" : "Not linked"}
                  </Pill>
                </td>
                <td style={{ ...cell, textAlign: "right" }}>{o.state === "missing" && <Btn size="sm" variant="primary" disabled={busy} onClick={() => deduct(o)}>Deduct now</Btn>}</td>
              </tr>
            ))}
          </Table>
        </>
      )}
      {toast && <Toast tone={toast.tone}>{toast.msg}</Toast>}
    </div>
  );
}
