"use client";
// Wholesale / private label (PrivateLabelView.jsx): pick a stocked coffee or
// build a blend, choose packaging, set the run, then review + place the order.
import { useState } from "react";
import type { SelItem } from "@/lib/domain/types";
import type { ShipTo } from "@/lib/domain/requests";
import {
  G_PER_LB, PL_BAGS, PL_FILL, PL_LABEL_SIZES, PL_MIN, PL_PACK, minsFit, minsTotalG, money, money0, plQuote,
  rampColor, roastName, roastOf, weighted, wholesaleSel,
} from "@/lib/domain/coffee";
import { Btn, Field, LineItem, Photo, Pill, RuleHead, Step, Toast, disp, inp, mono, over } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { useCatalog } from "./catalog-context";
import { BlendRatios, TastingWheel } from "./BlendBuilder";
import { WholesaleCheckout, type PlPayload } from "./WholesaleCheckout";

const today = () => new Date().toISOString().slice(0, 10);
const plusDays = (d: number) => new Date(Date.now() + d * 864e5).toISOString().slice(0, 10);

export function PrivateLabelView({ account }: { account: { company: string; email: string; address: ShipTo | null } }) {
  const { stock: allStock, idx } = useCatalog();
  const stock = allStock.filter((s) => s.price > 0);
  const [mode, setMode] = useState<"stock" | "blend">("stock");
  const [skuId, setSkuId] = useState(stock[0]?.id ?? "");
  const [sel, setSel] = useState<SelItem[]>([]);
  const [roast, setRoast] = useState<number | null>(null);
  const [blendName, setBlendName] = useState("");
  const [lbs, setLbs] = useState(PL_MIN);
  const [bagId, setBagId] = useState("12oz");
  const [packId, setPackId] = useState<"stock" | "label" | "own">("stock");
  const [art, setArt] = useState<{ fileId: string | null; filename: string } | null>(null);
  const [artState, setArtState] = useState<"idle" | "uploading" | "error">("idle");
  const [labelSize, setLabelSize] = useState(PL_LABEL_SIZES[0]);
  const [ownBags, setOwnBags] = useState(200);
  const [ownEta, setOwnEta] = useState(plusDays(10));
  const [needBy, setNeedBy] = useState(plusDays(14));
  const [confirm, setConfirm] = useState<PlPayload | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const sku = stock.find((s) => s.id === skuId) ?? stock[0];
  const isBlend = mode === "blend";
  const emptyBlend = isBlend && sel.length === 0;
  const effRoast = isBlend ? (roast != null ? roast : sel.length ? roastOf(sel, idx) : 3) : (sku?.roast ?? 3);
  const pricePerLb = isBlend ? wholesaleSel(sel, idx) : (sku?.price ?? 0);
  const vals = isBlend ? weighted(sel, idx, roast) : (sku?.notes ?? {});
  const productName = isBlend ? blendName.trim() || "Untitled blend" : (sku?.name ?? "");

  const q = plQuote({ pricePerLb, lbs, bagId, packId, ownBagCount: ownBags });
  const pack = q.pack, bag = q.bag;
  const belowMin = lbs < PL_MIN;
  const batchG = lbs * G_PER_LB;
  const minsOk = !isBlend || !sel.length || minsFit(sel, batchG, idx);
  const blocked = belowMin || emptyBlend || !minsOk || (isBlend && !blendName.trim()) || (packId === "label" && !art) || (packId === "own" && q.shortBags > 0) || artState === "uploading" || (!isBlend && !sku);
  const blocker = belowMin ? `Minimum private label run is ${PL_MIN} lb.`
    : emptyBlend ? "Add at least one coffee to the blend."
    : !minsOk ? `A ${lbs} lb run is ${Math.round(batchG).toLocaleString()} g — these coffees need ${minsTotalG(sel, idx).toLocaleString()} g between them. Raise the run size or drop one.`
    : isBlend && !blendName.trim() ? "Name the blend before ordering."
    : packId === "label" && artState === "uploading" ? "Uploading artwork…"
    : packId === "label" && !art ? "Attach label artwork before ordering."
    : packId === "own" && q.shortBags > 0 ? `You're ${q.shortBags} bags short — this run needs ${q.bags}.`
    : null;

  const uploadArt = async (file: File | undefined) => {
    if (!file) return;
    setArtState("uploading");
    try {
      const staged = await fetch("/api/wholesale/artwork", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "stage", filename: file.name, mimeType: file.type || "application/octet-stream", size: file.size }) }).then((r) => r.json());
      if (staged.error) throw new Error(staged.error);
      if (staged.demo) { setArt({ fileId: null, filename: file.name }); setArtState("idle"); return; }
      const form = new FormData();
      (staged.parameters as { name: string; value: string }[]).forEach((p) => form.append(p.name, p.value));
      form.append("file", file);
      const up = await fetch(staged.url, { method: "POST", body: form });
      if (!up.ok) throw new Error("upload");
      const done = await fetch("/api/wholesale/artwork", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "finalize", resourceUrl: staged.resourceUrl, filename: file.name }) }).then((r) => r.json());
      if (done.error) throw new Error(done.error);
      setArt({ fileId: done.fileId ?? null, filename: file.name }); setArtState("idle");
    } catch { setArt(null); setArtState("error"); }
  };

  const productStep = (n: number) => (
    <Step n={n} title="Pick a coffee">
      <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(24px,3vw,50px)", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 420px", minWidth: 0 }}>
          <StockList stock={stock} skuId={sku?.id} setSkuId={setSkuId} />
        </div>
        <div className="pl-cup-col" style={{ flex: "1 1 360px", minWidth: 320, position: "sticky", top: 96 }}>
          <TastingWheel vals={vals} roast={effRoast} empty={!sku} title={sku?.name} note="Cupping scores from our lab on the current lot. Roast level is fixed on stocked coffees." />
        </div>
      </div>
    </Step>
  );

  const packStep = (n: number) => (
    <Step n={n} title="How should it be bagged?">
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <span style={{ ...over, fontSize: 10, color: "var(--ink-subtle)" }}>Bag size</span>
        <div role="radiogroup" aria-label="Bag size" style={{ display: "flex", gap: 6 }}>
          {PL_BAGS.map((b) => {
            const on = b.id === bagId;
            return <button type="button" role="radio" aria-checked={on} key={b.id} onClick={() => setBagId(b.id)} style={{ padding: "6px 14px", borderRadius: "var(--r-md)", cursor: "pointer",
              border: on ? "1px solid var(--ink)" : "1px solid var(--hairline-strong)", background: on ? "var(--ink)" : "var(--surface)", color: on ? "var(--on-ink)" : "var(--ink)", ...mono, fontSize: 12.5 }}>{b.label}</button>;
          })}
        </div>
        <span style={{ ...mono, fontSize: 12, color: "var(--ink-muted)" }}>{lbs} lb → <span style={{ color: "var(--ink)" }}>{q.bags.toLocaleString()} bags</span></span>
      </div>

      <div role="radiogroup" aria-label="Packaging" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 10 }}>
        {PL_PACK.map((p) => {
          const on = p.id === packId;
          return (
            <div key={p.id} className="opt-card" role="radio" aria-checked={on} tabIndex={0} onClick={() => setPackId(p.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPackId(p.id); } }} style={{ padding: 16, textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 8, height: "100%",
              border: on ? "1.5px solid var(--brand)" : "1px solid var(--hairline)", borderRadius: "var(--r-md)", background: on ? "var(--brand-soft)" : "var(--surface)", fontFamily: "var(--font-sans)", transition: "all var(--dur) var(--ease)" }}>
              <Photo src={p.image} alt={p.title} cls="pl-pack" placeholder={p.title} style={{ aspectRatio: "1 / 1", marginBottom: 2 }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="opt-ico" style={{ width: 30, height: 30, borderRadius: "var(--r-md)", background: on ? "var(--surface)" : "var(--surface-sunken)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: on ? "var(--brand)" : "var(--roast-2)", flexShrink: 0 }}><Icon name={p.icon} size={16} stroke={2} /></span>
                <span className="opt-title" style={{ ...disp, fontSize: 14, color: "var(--ink)", lineHeight: 1.1 }}>{p.title}</span>
                {p.id === "stock" && <Pill variant="cream" style={{ marginLeft: "auto" }}>Default</Pill>}
              </div>
              <div className="opt-desc" style={{ fontSize: 12, lineHeight: 1.5, color: "var(--ink-muted)", flex: 1 }}>{p.desc}</div>
              <div className="opt-meta" style={{ ...over, fontSize: 9.5, color: "var(--ink-subtle)" }}>{p.rate}</div>
            </div>
          );
        })}
      </div>

      {packId === "stock" && (
        <div style={{ marginTop: 14, padding: "14px 16px", border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", background: "var(--surface-sunken)", display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ ...over, fontSize: 9.5, color: "var(--ink-muted)" }}>Included</span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", flex: "1 1 300px", lineHeight: 1.5 }}>Kraft stand-up pouch with a one-way valve, resealable zip, and a printed sticker carrying the coffee name, roast date, and lot code. Nothing else on the bag.</span>
          <span style={{ ...mono, fontSize: 12.5, color: "var(--ink)" }}>{money(bag.material.stock)}/bag</span>
        </div>
      )}

      {packId === "label" && (
        <div style={{ marginTop: 14, padding: 16, border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", background: "var(--surface)", display: "flex", flexWrap: "wrap", gap: 16 }}>
          <label style={{ flex: "1 1 300px", minWidth: 260, display: "block", cursor: "pointer" }}>
            <span style={{ ...over, fontSize: 10, color: "var(--ink-muted)", display: "block", marginBottom: 6 }}>Label artwork</span>
            <input type="file" accept=".pdf,.ai,.svg,.png" onChange={(e) => uploadArt(e.target.files?.[0])} style={{ position: "absolute", width: 1, height: 1, opacity: 0 }} />
            <span style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 16px", border: art ? "1px solid var(--success)" : "1px dashed var(--hairline-strong)", borderRadius: "var(--r-md)", background: art ? "var(--success-soft)" : "var(--surface-sunken)" }}>
              <span style={{ width: 32, height: 32, borderRadius: "var(--r-md)", background: "var(--surface)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: art ? "var(--success)" : "var(--ink-subtle)", flexShrink: 0 }}><Icon name={art ? "check" : "plus"} size={16} stroke={2.2} /></span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: artState === "error" ? "var(--danger)" : "var(--ink)" }}>{artState === "uploading" ? "Uploading…" : artState === "error" ? "Upload failed — try again" : art?.filename || "Attach artwork"}</span>
                <span style={{ display: "block", ...mono, fontSize: 11, color: "var(--ink-muted)", marginTop: 2 }}>PDF, AI, SVG or 300dpi PNG · CMYK · 3mm bleed</span>
              </span>
            </span>
          </label>
          <div style={{ flex: "0 1 220px", minWidth: 200, display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Label size"><select value={labelSize} onChange={(e) => setLabelSize(e.target.value)} style={inp}>{PL_LABEL_SIZES.map((s) => <option key={s}>{s}</option>)}</select></Field>
            <div style={{ ...mono, fontSize: 11.5, color: "var(--ink-muted)", lineHeight: 1.6 }}>
              <div>Label {money(pack.per)}/bag</div>
              <div>Plate setup {money0(pack.setup)} once</div>
            </div>
          </div>
          <p style={{ flexBasis: "100%", margin: 0, fontFamily: "var(--font-sans)", fontSize: 12, lineHeight: 1.5, color: "var(--ink-subtle)" }}>We send a printed proof on the actual stock within two business days. The run doesn&apos;t start until you sign off — proof time isn&apos;t counted against your need-by date.</p>
        </div>
      )}

      {packId === "own" && (
        <div style={{ marginTop: 14, padding: 16, border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", background: "var(--surface)", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
          <div style={{ flex: "0 1 180px", minWidth: 160 }}>
            <Field label="Bags you're sending"><input type="number" min={0} value={ownBags} onChange={(e) => setOwnBags(Math.max(0, +e.target.value || 0))} style={{ ...inp, ...mono }} /></Field>
          </div>
          <div style={{ flex: "0 1 200px", minWidth: 180 }}>
            <Field label="Arriving at the facility"><input type="date" min={today()} value={ownEta} onChange={(e) => setOwnEta(e.target.value)} style={{ ...inp, ...mono }} /></Field>
          </div>
          <div style={{ flex: "1 1 260px", minWidth: 240, paddingTop: 2 }}>
            {q.shortBags > 0 ? (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: "11px 13px", borderRadius: "var(--r-md)", background: "var(--brand-soft)", border: "1px solid var(--brand)" }}>
                <span style={{ color: "var(--brand)", marginTop: 1 }}><Icon name="cog" size={15} stroke={2} /></span>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, lineHeight: 1.5, color: "var(--ink)" }}>This run fills <span style={mono}>{q.bags}</span> bags. Send <span style={mono}>{q.shortBags}</span> more, or drop the run to <span style={mono}>{(ownBags * bag.lb).toFixed(0)} lb</span>.</span>
              </div>
            ) : (
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, lineHeight: 1.6, color: "var(--ink-muted)" }}>Enough for this run, with <span style={{ ...mono, color: "var(--ink)" }}>{ownBags - q.bags}</span> spare. Ship to the receiving door marked with your account name — we&apos;ll log them against your account.</div>
            )}
          </div>
          <p style={{ flexBasis: "100%", margin: 0, fontFamily: "var(--font-sans)", fontSize: 12, lineHeight: 1.5, color: "var(--ink-subtle)" }}>Bags must be stand-up pouches with a valve and a heat-sealable lip. If they jam the line we stop and call you — no material charge either way.</p>
        </div>
      )}
    </Step>
  );

  const runStep = (n: number) => (
    <Step n={n} title="How much, and when?">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 22, alignItems: "flex-start" }}>
        <div style={{ flex: "0 1 320px", minWidth: 280 }}>
          <Field label="Run size (roasted lb)"><input type="number" min={PL_MIN} value={lbs} onChange={(e) => setLbs(Math.max(0, Math.round(+e.target.value || 0)))} style={{ ...inp, ...mono }} /></Field>
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            {[5, 25, 50, 100].map((n) => <button type="button" key={n} onClick={() => setLbs(n)} style={{ padding: "4px 11px", borderRadius: "var(--r-pill)", cursor: "pointer", whiteSpace: "nowrap",
              border: lbs === n ? "1px solid var(--brand)" : "1px solid var(--hairline-strong)", background: lbs === n ? "var(--brand-soft)" : "var(--surface)", color: lbs === n ? "var(--brand)" : "var(--ink-muted)", ...mono, fontSize: 11.5 }}>{n} lb</button>)}
          </div>
        </div>
        <div style={{ flex: "0 1 200px", minWidth: 180 }}>
          <Field label="Need it by"><input type="date" min={today()} value={needBy} onChange={(e) => setNeedBy(e.target.value)} style={{ ...inp, ...mono }} /></Field>
        </div>
        <div style={{ flex: "1 1 260px", minWidth: 240, paddingTop: 22, fontFamily: "var(--font-sans)", fontSize: 12.5, lineHeight: 1.6, color: "var(--ink-muted)" }}>
          {belowMin ? <span style={{ color: "var(--danger)" }}>Minimum private label run is {PL_MIN} lb.</span>
            : !minsOk ? <span style={{ color: "var(--danger)" }}>{blocker}</span>
            : <>Roasted to order the week you need it. {isBlend ? "First run of a new blend adds one day for a QC cupping." : (sku?.lead ?? "") + "."}</>}
        </div>
      </div>
    </Step>
  );

  return (
    <div className="pv-page" style={{ maxWidth: "var(--content-max)", margin: "0 auto", padding: "24px 24px 96px", display: "flex", flexDirection: "column", gap: 40 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ ...disp, fontSize: "clamp(28px,3vw,50px)", lineHeight: 1, margin: 0, color: "var(--ink)" }}>Private label</h1>
          <p className="pv-lede" style={{ fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.6, color: "var(--ink-muted)", marginTop: 8, maxWidth: 620 }}>Coffee roasted here, sold under your name. Pick something we already stock or build a blend, tell us how it should be bagged, and we ship it.</p>
        </div>
        <form action="/account/logout" method="post" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ ...mono, fontSize: 11.5, color: "var(--ink-muted)" }}>{account.company}</span>
          <Btn size="sm" variant="ghost" type="submit" iconLeft={<Icon name="logout" size={14} stroke={2} />}>Sign out</Btn>
        </form>
      </div>

      <Step n={1} title="What are you selling?">
        <div role="radiogroup" aria-label="What are you selling" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 10 }}>
          {[
            { id: "stock" as const, icon: "pkg", title: "Ready to ship", desc: "Coffees we roast on a schedule. Priced by the pound, out the door in two to four days.", meta: `${stock.length} stocked · from ${money(stock.length ? Math.min(...stock.map((s) => s.price)) : 0)}/lb` },
            { id: "blend" as const, icon: "flame", title: "Build your own blend", desc: "Combine up to four of our green lots, set the ratios and the roast, watch the cup change.", meta: "Priced from your ratios · no blending fee" },
          ].map((m) => {
            const on = mode === m.id;
            return (
              <button type="button" role="radio" aria-checked={on} key={m.id} className="opt-card" onClick={() => setMode(m.id)} style={{ padding: 16, textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 8,
                border: on ? "1.5px solid var(--brand)" : "1px solid var(--hairline)", borderRadius: "var(--r-md)", background: on ? "var(--brand-soft)" : "var(--surface)", fontFamily: "var(--font-sans)", transition: "all var(--dur) var(--ease)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="opt-ico" style={{ width: 32, height: 32, borderRadius: "var(--r-md)", background: on ? "var(--surface)" : "var(--surface-sunken)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: on ? "var(--brand)" : "var(--roast-3)", flexShrink: 0 }}><Icon name={m.icon} size={17} stroke={2} /></span>
                  <span className="opt-title" style={{ ...disp, fontSize: 16, color: "var(--ink)", lineHeight: 1.05 }}>{m.title}</span>
                </div>
                <div className="opt-desc" style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--ink-muted)" }}>{m.desc}</div>
                <div className="opt-meta" style={{ ...over, fontSize: 9.5, color: "var(--ink-subtle)", marginTop: 2 }}>{m.meta}</div>
              </button>
            );
          })}
        </div>
      </Step>

      {isBlend ? <>
        <Step n={2} title="Choose your coffees">
          <BlendRatios sel={sel} setSel={setSel} batchG={batchG} batchLabel={`${lbs} lb run`} sections={["add"]} />
        </Step>
        <Step n={3} title="Adjust your ratios">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(24px,3vw,50px)", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 420px", minWidth: 0 }}>
              <BlendRatios sel={sel} setSel={setSel} roast={roast} setRoast={setRoast} blendName={blendName} setBlendName={setBlendName}
                batchG={batchG} batchLabel={`${lbs} lb run`} sections={["ratios", "roast", "name"]} />
            </div>
            <div className="pl-cup-col" style={{ flex: "1 1 360px", minWidth: 320, position: "sticky", top: 96 }}>
              <TastingWheel vals={vals} roast={effRoast} empty={emptyBlend} title="The cup" />
            </div>
          </div>
        </Step>
        {runStep(4)}
        {packStep(5)}
      </> : <>
        {productStep(2)}
        {packStep(3)}
        {runStep(4)}
      </>}

      <section>
        <RuleHead label="Order" right={<span style={{ ...mono, fontSize: 11.5, color: "var(--ink-subtle)", whiteSpace: "nowrap" }}>{q.bags.toLocaleString()} × {bag.label}</span>} />
        <LineItem k={`${productName} · ${roastName(effRoast)}`} sub={`${lbs} lb × ${money(pricePerLb)}/lb roasted`} v={q.coffee} />
        {q.material > 0 && <LineItem k={`${bag.label} stock bags`} sub={`${q.bags} × ${money(bag.material[pack.id])}`} v={q.material} />}
        {pack.id === "own" && <LineItem k="Bag handling" sub={`${q.bags} × ${money(pack.per)} · your bags`} v={q.perBag} />}
        {pack.id === "label" && <LineItem k={`Label · ${labelSize}`} sub={`${q.bags} × ${money(pack.per)}`} v={q.perBag} />}
        {q.setup > 0 && <LineItem k="Plate setup" sub="One time, per artwork" v={q.setup} />}
        <LineItem k="Fill, seal, date-stamp" sub={`${q.bags} × ${money(PL_FILL)} · packaging line`} v={q.fill} />
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0 0" }}>
          <span style={{ flex: 1, ...over, fontSize: 10.5, color: "var(--ink-muted)" }}>Estimated total</span>
          <span style={{ ...mono, fontSize: 12, color: "var(--ink-subtle)" }}>{money(q.perLb)}/lb · {money(q.unit)}/bag</span>
          <span style={{ ...disp, fontSize: 30, color: "var(--ink)", lineHeight: 1 }}>{money0(q.total)}</span>
        </div>
        <p style={{ margin: "10px 0 0", fontFamily: "var(--font-sans)", fontSize: 12, lineHeight: 1.55, color: "var(--ink-subtle)", maxWidth: "70ch" }}>Paid by card at checkout. Green price is locked for 60 days from order; packaging is billed at actual bag count, which can move by up to 2% on fill.</p>
      </section>

      <div className="co-confirmbar" style={{ position: "sticky", bottom: 16, background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-pop)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div className="cb-icon" style={{ width: 44, height: 44, background: "var(--surface-sunken)", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "center", color: rampColor(effRoast), flexShrink: 0 }}><Icon name={isBlend ? "flame" : "pkg"} size={20} stroke={2} /></div>
        <div style={{ flex: "1 1 260px", minWidth: 0 }}>
          <div className="cb-title" style={{ ...disp, fontSize: 18, color: "var(--ink)", lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{productName}</div>
          <div className="cb-meta" aria-live="polite" style={{ fontSize: 12.5, color: blocker ? "var(--danger)" : "var(--ink-muted)", fontFamily: "var(--font-sans)", marginTop: 4 }}>
            {blocker || <span style={mono}>{lbs} lb · {q.bags} × {bag.label} · {pack.title.toLowerCase()}</span>}
          </div>
        </div>
        <div className="cb-price" style={{ textAlign: "right", flexShrink: 0 }}>
          <div className="cb-figure" style={{ ...disp, fontSize: 28, color: "var(--ink)", lineHeight: 1 }}>{money0(q.total)}</div>
          <div style={{ ...over, fontSize: 9, color: "var(--ink-subtle)", marginTop: 3 }}>est. total</div>
        </div>
        <Btn variant="primary" size="lg" disabled={blocked} icon={<Icon name="arrow" size={15} stroke={2} />}
          onClick={() => setConfirm({ mode, skuId: sku?.id, sel, roast, blendName, productName, isBlend, effRoast, pricePerLb, lbs, needBy, q, art, labelSize, ownBags, ownEta, bagId, packId })}>Review order</Btn>
      </div>

      <WholesaleCheckout payload={confirm} account={account} onClose={() => setConfirm(null)}
        onPlaced={(name) => { setConfirm(null); setToast(`Private label order placed${name ? ` · ${name}` : ""}.`); setTimeout(() => setToast(null), 3200); }} />
      {toast && <Toast>{toast}</Toast>}
    </div>
  );
}

// ---- stocked coffees, worksheet list ----
function StockList({ stock, skuId, setSkuId }: { stock: ReturnType<typeof useCatalog>["stock"]; skuId?: string; setSkuId: (id: string) => void }) {
  return (
    <div role="radiogroup" aria-label="Stocked coffees" style={{ border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", background: "var(--surface)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 16px", background: "var(--surface-sunken)", borderBottom: "1px solid var(--hairline)" }}>
        <span style={{ flex: 1, ...over, fontSize: 10, color: "var(--ink-muted)" }}>Coffee</span>
        <span style={{ width: 74, textAlign: "right", ...over, fontSize: 10, color: "var(--ink-muted)" }}>$ / lb</span>
      </div>
      {stock.map((s, i) => {
        const on = s.id === skuId;
        return (
          <div key={s.id} role="radio" aria-checked={on} tabIndex={0} onClick={() => setSkuId(s.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSkuId(s.id); } }} style={{ width: "100%", textAlign: "left", cursor: "pointer", padding: "13px 16px",
            borderTop: i ? "1px solid var(--hairline)" : "none", borderLeft: on ? "3px solid var(--brand)" : "3px solid transparent",
            background: on ? "var(--brand-soft)" : "var(--surface)", fontFamily: "var(--font-sans)", display: "flex", gap: 14 }}>
            <Photo src={s.image} alt={s.name} cls="pl-thumb" placeholder="Photo" style={{ width: 84, height: 84 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 11, height: 11, borderRadius: "var(--r-sm)", flexShrink: 0, background: rampColor(s.roast), boxShadow: "inset 0 0 0 1px rgba(0,0,0,.14)" }} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{s.name}</span>
                    {s.tag && <Pill variant="tomato" dot pulse>{s.tag}</Pill>}
                  </span>
                  <span style={{ display: "block", fontSize: 12, color: "var(--ink-subtle)", marginTop: 3 }}>{s.sub}</span>
                </span>
                <span style={{ ...mono, fontSize: 14, color: "var(--ink)", width: 74, textAlign: "right" }}>{money(s.price)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8, paddingLeft: 23, flexWrap: "wrap" }}>
                <span style={{ ...over, fontSize: 9, color: "var(--ink-subtle)" }}>{roastName(s.roast)}</span>
                <span style={{ ...mono, fontSize: 11, color: "var(--ink-muted)" }}>{s.lead}</span>
                <span style={{ ...mono, fontSize: 11, color: "var(--ink-muted)" }}>{s.avail}</span>
              </div>
              {on && <div style={{ marginTop: 8, paddingLeft: 23, fontSize: 12.5, lineHeight: 1.55, color: "var(--ink-muted)", maxWidth: "58ch" }}>{s.blurb}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
