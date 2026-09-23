"use client";
// Orders (ShopOrdersAdmin.jsx): what the shop sold and what it takes to fulfil
// it. Table → drawer per order; Roast list aggregates the unshipped queue.
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AdminOrder, Stage } from "@/lib/domain/orders";
import { GREEN_LOSS, STAGES, itemLbs, orderBags, orderLbs, roastPlan, stageIdx } from "@/lib/domain/orders";
import { money, money0, rampColor, roastName } from "@/lib/domain/coffee";
import { Btn, CO, Pill, Toast } from "@/components/ui/primitives";
import { HeroMetric, Kbd, SearchInput, Segmented, StatStrip, Tabs, downloadCsv } from "./parts";
import { OrderDrawer } from "./OrderDrawer";
import { advanceOrder } from "@/app/admin/actions";

const cell = { padding: "11px 14px", verticalAlign: "middle" } as const;

export function Avatar({ name, size = 30 }: { name: string; size?: number }) {
  const ini = name.replace(/[^\p{L}\p{N}\s]/gu, "").trim().split(/\s+/).slice(0, 2).map((s) => s[0]).join("").toUpperCase() || "—";
  return <span aria-hidden="true" style={{ width: size, height: size, flexShrink: 0, borderRadius: "var(--r-md)", background: "var(--surface-sunken)", border: "1px solid var(--hairline)", display: "inline-flex", alignItems: "center", justifyContent: "center", ...CO.data({ fontSize: size * 0.38, color: "var(--ink-muted)" }) }}>{ini}</span>;
}

export function StatusChip({ status }: { status: Stage }) {
  const m = {
    paid: { fg: "var(--warning)", bg: "rgba(178,107,0,.10)", dot: "var(--warning)", pulse: false },
    roasting: { fg: "var(--brand)", bg: "var(--brand-soft)", dot: "var(--brand)", pulse: true },
    packing: { fg: "var(--ink)", bg: "var(--surface-sunken)", dot: "var(--roast-3)", pulse: false },
    shipped: { fg: "var(--success)", bg: "rgba(30,122,74,.10)", dot: "var(--success)", pulse: false },
  }[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: "var(--r-pill)", background: m.bg, color: m.fg, whiteSpace: "nowrap", ...CO.over({ fontSize: 10, letterSpacing: ".05em" }) }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.dot, flexShrink: 0, animation: m.pulse ? "co-pulse 1.5s ease-in-out infinite" : "none" }} />{STAGES[stageIdx(status)].label}
    </span>
  );
}

function OrdersTable({ rows, onOpen, onExport }: { rows: AdminOrder[]; onOpen: (o: AdminOrder) => void; onExport: () => void }) {
  return (
    <div style={{ border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", overflow: "hidden", background: "var(--surface)" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1080 }}>
          <thead>
            <tr style={{ background: "var(--surface-sunken)", borderBottom: "1px solid var(--hairline)" }}>
              {([["Order", "left"], ["Customer", "left"], ["What they bought", "left"], ["Lbs", "right"], ["Bags", "right"], ["Grind", "left"], ["Status", "left"], ["Total", "right"]] as const).map(([h, al], i) => (
                <th key={i} scope="col" style={{ textAlign: al, padding: "9px 14px", whiteSpace: "nowrap", ...CO.over({ fontSize: 10, color: "var(--ink-muted)" }) }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => {
              const lbs = orderLbs(o);
              const grinds = [...new Set(o.items.map((i) => i.grind))];
              return (
                <tr key={o.id} tabIndex={0} onClick={() => onOpen(o)} onKeyDown={(e) => { if (e.key === "Enter") onOpen(o); }} style={{ borderBottom: "1px solid var(--hairline)", cursor: "pointer", transition: "background var(--dur) var(--ease)" }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "var(--surface-hover)")} onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}>
                  <td style={cell}>
                    <div style={CO.data({ fontSize: 13, color: "var(--ink)", whiteSpace: "nowrap" })}>{o.name}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-subtle)", fontFamily: "var(--font-sans)", whiteSpace: "nowrap" }}>Placed {o.placed}</div>
                  </td>
                  <td style={cell}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={o.customer.name} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap" }}>{o.customer.name}</div>
                        <div style={CO.over({ fontSize: 9.5, color: "var(--ink-subtle)", whiteSpace: "nowrap" })}>{o.customer.city} · {o.channel}</div>
                      </div>
                    </div>
                  </td>
                  <td style={cell}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {o.items.map((it, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <span style={{ width: 10, height: 10, borderRadius: "var(--r-sm)", flexShrink: 0, background: rampColor(it.roast), boxShadow: "inset 0 0 0 1px rgba(0,0,0,.14)" }} />
                          <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", whiteSpace: "nowrap" }}>{it.name}</span>
                          <span style={CO.data({ fontSize: 11.5, color: "var(--ink-subtle)", whiteSpace: "nowrap" })}>{it.qty} × {it.sizeLabel}</span>
                          {it.kind === "blend" && <Pill variant="cream">Blend</Pill>}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={{ ...cell, textAlign: "right" }}><span style={CO.data({ fontSize: 13, color: "var(--ink)" })}>{lbs % 1 ? lbs.toFixed(1) : lbs}</span></td>
                  <td style={{ ...cell, textAlign: "right" }}><span style={CO.data({ fontSize: 13, color: "var(--ink)" })}>{orderBags(o)}</span></td>
                  <td style={cell}><span style={CO.data({ fontSize: 12, color: "var(--ink-muted)", whiteSpace: "nowrap" })}>{grinds.length > 1 ? `${grinds.length} grinds` : grinds[0]}</span></td>
                  <td style={cell}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 5 }}>
                      <StatusChip status={o.status} />
                      {o.qcHold && <span style={CO.over({ fontSize: 9.5, color: "var(--brand)" })}>QC hold</span>}
                      {o.gift && <span style={CO.over({ fontSize: 9.5, color: "var(--info)" })}>Gift note</span>}
                    </div>
                  </td>
                  <td style={{ ...cell, textAlign: "right" }}><span style={CO.data({ fontSize: 13, color: "var(--ink)" })}>{money(o.money.total)}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 14px", borderTop: "1px solid var(--hairline)" }}>
        <span style={{ fontSize: 12, color: "var(--ink-muted)", fontFamily: "var(--font-sans)" }}>{rows.length} orders · <Kbd>Enter</Kbd> to open</span>
        <Btn size="sm" variant="outline" onClick={onExport}>Export CSV</Btn>
      </div>
    </div>
  );
}

function RoastList({ orders }: { orders: AdminOrder[] }) {
  const plan = roastPlan(orders);
  const totalLbs = plan.roasted.reduce((a, r) => a + r.lbs, 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <section>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, paddingBottom: 10, borderBottom: "1px solid var(--hairline-strong)" }}>
          <span style={CO.over({ fontSize: 10.5, color: "var(--ink-muted)" })}>Roast this batch</span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink-subtle)" }}>{totalLbs.toFixed(1)} lb roasted across {orders.length} unshipped orders</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
            <thead><tr>{["Coffee", "Roast", "Roasted lb", "Green lb", "Orders"].map((h, i) => (
              <th key={i} scope="col" style={{ textAlign: i > 1 ? "right" : "left", padding: "9px 14px 9px 0", ...CO.over({ fontSize: 10, color: "var(--ink-muted)" }) }}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {plan.roasted.map((r) => (
                <tr key={r.key} style={{ borderTop: "1px solid var(--hairline)" }}>
                  <td style={{ padding: "12px 14px 12px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 11, height: 11, borderRadius: "var(--r-sm)", flexShrink: 0, background: rampColor(r.roast), boxShadow: "inset 0 0 0 1px rgba(0,0,0,.14)" }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontFamily: "var(--font-sans)", fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{r.name}</span>
                          {r.kind === "blend" && <Pill variant="cream">Blend</Pill>}
                        </div>
                        {r.kind === "blend" && r.sel && <div style={CO.data({ fontSize: 11, color: "var(--ink-subtle)", marginTop: 3 })}>{r.sel.map((s) => `${s.name} ${s.pct}%`).join(" · ")}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px 12px 0" }}><span style={CO.over({ fontSize: 9.5, color: "var(--ink-muted)" })}>{roastName(r.roast)}</span></td>
                  <td style={{ padding: "12px 14px 12px 0", textAlign: "right" }}><span style={CO.data({ fontSize: 13, color: "var(--ink)" })}>{r.lbs.toFixed(1)}</span></td>
                  <td style={{ padding: "12px 14px 12px 0", textAlign: "right" }}><span style={CO.data({ fontSize: 12.5, color: "var(--ink-muted)" })}>{(r.lbs / GREEN_LOSS).toFixed(1)}</span></td>
                  <td style={{ padding: "12px 0", textAlign: "right" }}><span style={CO.data({ fontSize: 12.5, color: "var(--ink-muted)" })}>{r.orders}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, paddingBottom: 10, borderBottom: "1px solid var(--hairline-strong)" }}>
          <span style={CO.over({ fontSize: 10.5, color: "var(--ink-muted)" })}>Green to pull</span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink-subtle)" }}>Blend components · 16% roast loss included</span>
        </div>
        {plan.green.length === 0
          ? <p style={{ margin: "14px 0 0", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink-muted)" }}>No blends in this queue — every line is a single coffee.</p>
          : plan.green.map((g) => (
            <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid var(--hairline)", flexWrap: "wrap" }}>
              <span style={{ width: 11, height: 11, borderRadius: "var(--r-sm)", flexShrink: 0, background: rampColor(g.roast) }} />
              <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{g.name}</div>
                <div style={CO.data({ fontSize: 11.5, color: "var(--ink-subtle)", marginTop: 2 })}>{g.lot}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={CO.data({ fontSize: 18, color: "var(--ink)" })}>{(g.lbs / GREEN_LOSS).toFixed(1)}</div>
                <div style={CO.over({ fontSize: 9, color: "var(--ink-subtle)", marginTop: 2 })}>green lb</div>
              </div>
              <span style={CO.data({ fontSize: 12, color: "var(--ink-muted)", width: 120, textAlign: "right" })}>{g.lbs.toFixed(1)} lb roasted</span>
            </div>
          ))}
      </section>
    </div>
  );
}

export function OrdersView({ orders }: { orders: AdminOrder[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"queue" | "roastlist" | "all">("queue");
  const [seg, setSeg] = useState<"all" | "wholesale" | "blend">("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [toast, setToast] = useState<{ msg: string; tone: "success" | "danger" } | null>(null);

  const live = orders.filter((o) => o.status !== "shipped");
  const toRoast = live.filter((o) => o.status === "paid");
  const shipReady = live.filter((o) => o.status === "packing");
  const rows = useMemo(() => {
    const base = tab === "all" ? orders : live;
    const needle = q.trim().toLowerCase();
    return base
      .filter((o) => (seg === "all" ? true : seg === "wholesale" ? o.channel === "Wholesale" : o.items.some((i) => i.kind === "blend")))
      .filter((o) => !needle || [o.name, o.customer.name, o.customer.email, ...o.items.map((i) => i.name)].some((s) => s.toLowerCase().includes(needle)));
  }, [orders, live, tab, seg, q]);
  const lbs = live.reduce((s, o) => s + orderLbs(o), 0);
  const bags = live.reduce((s, o) => s + orderBags(o), 0);
  const value = live.reduce((s, o) => s + o.money.total, 0);
  const open = openId ? orders.find((o) => o.id === openId) ?? null : null;

  const advance = (o: AdminOrder, tracking?: { number: string; company: string } | null) => {
    const next = STAGES[stageIdx(o.status) + 1];
    if (!next) return;
    start(async () => {
      const r = await advanceOrder(o.id, next.id, tracking);
      if (r.ok) { setToast({ msg: `${o.name} → ${next.label}`, tone: "success" }); router.refresh(); }
      else setToast({ msg: r.error, tone: "danger" });
      setTimeout(() => setToast(null), 2800);
    });
  };
  const exportCsv = () => downloadCsv(`orders-${new Date().toISOString().slice(0, 10)}.csv`, [
    ["Order", "Placed", "Channel", "Customer", "Email", "Status", "Item", "Kind", "Qty", "Size", "Roast", "Components", "Lbs", "Total"],
    ...rows.flatMap((o) => o.items.map((it) => [o.name, o.placed, o.channel, o.customer.name, o.customer.email, o.status, it.name, it.kind, it.qty, it.sizeLabel, roastName(it.roast),
      (it.sel ?? []).map((s) => `${s.pct}% ${s.name}`).join(" / "), itemLbs(it), o.money.total.toFixed(2)])),
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "20px 24px 40px", maxWidth: "var(--content-max)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <HeroMetric label="Orders to fulfil" value={live.length} caption={`${lbs.toFixed(1)} lb to roast · ${bags} bags to fill · ${toRoast.length} not started`} />
        <StatStrip items={[
          { label: "Unshipped value", value: money0(value) },
          { label: "Waiting to roast", value: toRoast.length, live: true },
          { label: "Ready to ship", value: shipReady.length },
          { label: "Wholesale", value: live.filter((o) => o.channel === "Wholesale").length },
        ]} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Tabs active={tab} onChange={setTab} tabs={[
          { id: "queue", label: "To fulfil", count: live.length },
          { id: "roastlist", label: "Roast list" },
          { id: "all", label: "All orders", count: orders.length },
        ]} />
        {tab !== "roastlist" && <>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, background: "var(--surface-sunken)", border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", flexWrap: "wrap" }}>
            <div style={{ maxWidth: 320, flex: 1, display: "flex", minWidth: 200 }}><SearchInput placeholder="Customer, order #, or coffee" value={q} onChange={setQ} /></div>
            <Segmented value={seg} onChange={setSeg} options={[{ id: "all", label: "All" }, { id: "wholesale", label: "Wholesale" }, { id: "blend", label: "Custom blends" }]} />
          </div>
          {rows.length === 0
            ? <div style={{ padding: "48px 16px", textAlign: "center", border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", background: "var(--surface)" }}>
                <div style={CO.display({ fontSize: 20, color: "var(--ink)", textTransform: "uppercase" })}>{q || seg !== "all" ? "No matches" : "Nothing to fulfil"}</div>
                <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 8, fontFamily: "var(--font-sans)" }}>{q || seg !== "all" ? "Try another search or filter." : "Every order is out the door. Switch to All orders for the history."}</div>
              </div>
            : <OrdersTable rows={rows} onOpen={(o) => setOpenId(o.id)} onExport={exportCsv} />}
        </>}
        {tab === "roastlist" && <RoastList orders={live} />}
      </div>

      <OrderDrawer order={open} busy={pending} onClose={() => setOpenId(null)} onAdvance={advance} />
      {toast && <Toast tone={toast.tone}>{toast.msg}</Toast>}
    </div>
  );
}
