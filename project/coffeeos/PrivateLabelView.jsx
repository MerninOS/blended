// Roaster Portal × CoffeeOS — Private Label section.
// Buy finished coffee under your own name: pick a stocked coffee or build a blend,
// choose packaging (our bags / your label on our bags / your own bags), then order.

const PrivateLabelView = ({ openConfirm }) => {
  const [mode, setMode] = React.useState("stock"); // stock | blend
  const [skuId, setSkuId] = React.useState("s-counter");
  const [sel, setSel] = React.useState([]);
  const [roast, setRoast] = React.useState(null);
  const [blendName, setBlendName] = React.useState("");
  const [lbs, setLbs] = React.useState(PL_MIN);
  const [bagId, setBagId] = React.useState("12oz");
  const [packId, setPackId] = React.useState("stock");
  const [art, setArt] = React.useState(null);
  const [labelSize, setLabelSize] = React.useState('3.5" × 5" front');
  const [ownBags, setOwnBags] = React.useState(200);
  const [ownEta, setOwnEta] = React.useState("2026-05-04");
  const [needBy, setNeedBy] = React.useState("2026-05-11");

  const sku = PL_STOCK.find((s) => s.id === skuId);
  const isBlend = mode === "blend";
  const emptyBlend = isBlend && sel.length === 0;

  const effRoast = isBlend ? roast != null ? roast : sel.length ? plRoastOf(sel) : 3 : sku.roast;
  const pricePerLb = isBlend ? plPriceOf(sel) : sku.price;
  const vals = isBlend ? plWeighted(sel, roast != null ? roast : undefined) : sku.notes;
  const productName = isBlend ? blendName.trim() || "Untitled blend" : sku.name;

  const q = plQuote({ pricePerLb, lbs, bagId, packId, ownBagCount: ownBags });
  const pack = q.pack,bag = q.bag;
  const belowMin = lbs < PL_MIN;
  const batchG = lbs * PL_G_PER_LB;
  const minsOk = !isBlend || !sel.length || plMinsFit(sel, batchG);
  const minsG = isBlend ? sel.reduce((a, x) => a + plMinG(x.id), 0) : 0;
  const blocked = belowMin || emptyBlend || !minsOk || isBlend && !blendName.trim() || packId === "label" && !art || packId === "own" && q.shortBags > 0;

  const blocker = belowMin ? `Minimum private label run is ${PL_MIN} lb.` :
  emptyBlend ? "Add at least one coffee to the blend." :
  !minsOk ? `A ${lbs} lb run is ${Math.round(batchG).toLocaleString()} g — these coffees need ${minsG.toLocaleString()} g between them. Raise the run size or drop one.` :
  isBlend && !blendName.trim() ? "Name the blend before ordering." :
  packId === "label" && !art ? "Attach label artwork before ordering." :
  packId === "own" && q.shortBags > 0 ? `You're ${q.shortBags} bags short — this run needs ${q.bags}.` :
  null;

  const productStep = (n) =>
  <Step n={n} title="Pick a coffee">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(24px,3vw,50px)", alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 420px", minWidth: 0 }}>
            <StockList skuId={skuId} setSkuId={setSkuId} />
          </div>
          <div className="pl-cup-col" style={{ flex: "1 1 360px", minWidth: 320, position: "sticky", top: 96 }}>
            <TastingWheel vals={vals} roast={effRoast} title={sku.name}
        note="Cupping scores from our lab on the current lot. Roast level is fixed on stocked coffees." />
          </div>
        </div>
      </Step>;

  const packStep = (n) =>
  <Step n={n} title="How should it be bagged?">
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
          <span style={{ ...over, fontSize: 10, color: "var(--ink-subtle)" }}>Bag size</span>
          <div style={{ display: "flex", gap: 6 }}>
            {PL_BAGS.map((b) => {
          const on = b.id === bagId;
          return <button key={b.id} onClick={() => setBagId(b.id)} style={{ padding: "6px 14px", borderRadius: "var(--r-md)", cursor: "pointer",
            border: on ? "1px solid var(--ink)" : "1px solid var(--hairline-strong)", background: on ? "var(--ink)" : "var(--surface)", color: on ? "var(--on-ink)" : "var(--ink)", ...mono, fontSize: 12.5 }}>{b.label}</button>;
        })}
          </div>
          <span style={{ ...mono, fontSize: 12, color: "var(--ink-muted)" }}>{lbs} lb → <span style={{ color: "var(--ink)" }}>{q.bags.toLocaleString()} bags</span></span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 10 }}>
          {PL_PACK.map((p) => {
        const on = p.id === packId;
        return (
          <div key={p.id} className="opt-card" role="button" tabIndex={0} onClick={() => setPackId(p.id)} onKeyDown={(e) => {if (e.key === "Enter" || e.key === " ") {e.preventDefault();setPackId(p.id);}}} style={{ padding: 16, textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 8, height: "100%",
            border: on ? "1.5px solid var(--brand)" : "1px solid var(--hairline)", borderRadius: "var(--r-md)", background: on ? "var(--brand-soft)" : "var(--surface)", fontFamily: "var(--font-sans)", transition: "all var(--dur) var(--ease)" }}>
                <Slot id={`pl-pack-${p.id}`} cls="pl-pack" radius={5} placeholder={p.title} style={{ aspectRatio: "1 / 1", marginBottom: 2 }} />
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="opt-ico" style={{ width: 30, height: 30, borderRadius: "var(--r-md)", background: on ? "var(--surface)" : "var(--surface-sunken)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: on ? "var(--brand)" : "var(--roast-2)", flexShrink: 0 }}><I name={p.icon} size={16} stroke={2} /></span>
                  <span className="opt-title" style={{ ...disp, fontSize: 14, color: "var(--ink)", lineHeight: 1.1 }}>{p.title}</span>
                  {p.id === "stock" && <Pill variant="cream" style={{ marginLeft: "auto" }}>Default</Pill>}
                </div>
                <div className="opt-desc" style={{ fontSize: 12, lineHeight: 1.5, color: "var(--ink-muted)", flex: 1 }}>{p.desc}</div>
                <div className="opt-meta" style={{ ...over, fontSize: 9.5, color: "var(--ink-subtle)" }}>{p.rate}</div>
              </div>);

      })}
        </div>

        {/* conditional packaging detail */}
        {packId === "stock" &&
    <div style={{ marginTop: 14, padding: "14px 16px", border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", background: "var(--surface-sunken)", display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ ...over, fontSize: 9.5, color: "var(--ink-muted)" }}>Included</span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", flex: "1 1 300px", lineHeight: 1.5 }}>Kraft stand-up pouch with a one-way valve, resealable zip, and a printed sticker carrying the coffee name, roast date, and lot code. Nothing else on the bag.</span>
            <span style={{ ...mono, fontSize: 12.5, color: "var(--ink)" }}>{plMoney(bag.material.stock)}/bag</span>
          </div>
    }

        {packId === "label" &&
    <div style={{ marginTop: 14, padding: 16, border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", background: "var(--surface)", display: "flex", flexWrap: "wrap", gap: 16 }}>
            <label style={{ flex: "1 1 300px", minWidth: 260, display: "block", cursor: "pointer" }}>
              <span style={{ ...over, fontSize: 10, color: "var(--ink-muted)", display: "block", marginBottom: 6 }}>Label artwork</span>
              <input type="file" accept=".pdf,.ai,.svg,.png" onChange={(e) => setArt(e.target.files && e.target.files[0] ? e.target.files[0].name : null)} style={{ display: "none" }} />
              <span style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 16px", border: art ? "1px solid var(--success)" : "1px dashed var(--hairline-strong)", borderRadius: "var(--r-md)", background: art ? "var(--success-soft)" : "var(--surface-sunken)" }}>
                <span style={{ width: 32, height: 32, borderRadius: "var(--r-md)", background: "var(--surface)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: art ? "var(--success)" : "var(--ink-subtle)", flexShrink: 0 }}><I name={art ? "check" : "plus"} size={16} stroke={2.2} /></span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{art || "Attach artwork"}</span>
                  <span style={{ display: "block", ...mono, fontSize: 11, color: "var(--ink-muted)", marginTop: 2 }}>PDF, AI, SVG or 300dpi PNG · CMYK · 3mm bleed</span>
                </span>
              </span>
            </label>
            <div style={{ flex: "0 1 220px", minWidth: 200, display: "flex", flexDirection: "column", gap: 12 }}>
              <Field label="Label size"><select value={labelSize} onChange={(e) => setLabelSize(e.target.value)} style={inp}><option>3.5" × 5" front</option><option>4" × 6" front</option><option>2" × 3" front + back</option><option>Full wrap</option></select></Field>
              <div style={{ ...mono, fontSize: 11.5, color: "var(--ink-muted)", lineHeight: 1.6 }}>
                <div>Label {plMoney(pack.per)}/bag</div>
                <div>Plate setup {plMoney0(pack.setup)} once</div>
              </div>
            </div>
            <p style={{ flexBasis: "100%", margin: 0, fontFamily: "var(--font-sans)", fontSize: 12, lineHeight: 1.5, color: "var(--ink-subtle)" }}>We send a printed proof on the actual stock within two business days. The run doesn't start until you sign off — proof time isn't counted against your need-by date.</p>
          </div>
    }

        {packId === "own" &&
    <div style={{ marginTop: 14, padding: 16, border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", background: "var(--surface)", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
            <div style={{ flex: "0 1 180px", minWidth: 160 }}>
              <Field label="Bags you're sending"><input type="number" value={ownBags} onChange={(e) => setOwnBags(Math.max(0, +e.target.value || 0))} style={{ ...inp, ...mono }} /></Field>
            </div>
            <div style={{ flex: "0 1 200px", minWidth: 180 }}>
              <Field label="Arriving at the facility"><input type="date" value={ownEta} onChange={(e) => setOwnEta(e.target.value)} style={{ ...inp, ...mono }} /></Field>
            </div>
            <div style={{ flex: "1 1 260px", minWidth: 240, paddingTop: 2 }}>
              {q.shortBags > 0 ?
        <div style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: "11px 13px", borderRadius: "var(--r-md)", background: "var(--brand-soft)", border: "1px solid var(--brand)" }}>
                    <span style={{ color: "var(--brand)", marginTop: 1 }}><I name="cog" size={15} stroke={2} /></span>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, lineHeight: 1.5, color: "var(--ink)" }}>This run fills <span style={mono}>{q.bags}</span> bags. Send <span style={mono}>{q.shortBags}</span> more, or drop the run to <span style={mono}>{(ownBags * bag.lb).toFixed(0)} lb</span>.</span>
                  </div> :
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, lineHeight: 1.6, color: "var(--ink-muted)" }}>Enough for this run, with <span style={{ ...mono, color: "var(--ink)" }}>{ownBags - q.bags}</span> spare. Ship to the receiving door marked with your account name — we'll log them against your shelf.</div>}
            </div>
            <p style={{ flexBasis: "100%", margin: 0, fontFamily: "var(--font-sans)", fontSize: 12, lineHeight: 1.5, color: "var(--ink-subtle)" }}>Bags must be stand-up pouches with a valve and a heat-sealable lip. If they jam the line we stop and call you — no material charge either way.</p>
          </div>
    }
      </Step>;

  const runStep = (n) =>
  <Step n={n} title="How much, and when?">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 22, alignItems: "flex-start" }} data-comment-anchor="0facfa3b7c-div-147-9">
          <div style={{ flex: "0 1 320px", minWidth: 280 }}>
            <Field label="Run size (roasted lb)"><input type="number" value={lbs} onChange={(e) => setLbs(Math.max(0, +e.target.value || 0))} style={{ ...inp, ...mono }} /></Field>
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              {[5, 25, 50, 100].map((n) => <button key={n} onClick={() => setLbs(n)} style={{ padding: "4px 11px", borderRadius: "var(--r-pill)", cursor: "pointer", whiteSpace: "nowrap",
            border: lbs === n ? "1px solid var(--brand)" : "1px solid var(--hairline-strong)", background: lbs === n ? "var(--brand-soft)" : "var(--surface)", color: lbs === n ? "var(--brand)" : "var(--ink-muted)", ...mono, fontSize: 11.5 }}>{n} lb</button>)}
            </div>
          </div>
          <div style={{ flex: "0 1 200px", minWidth: 180 }}>
            <Field label="Need it by"><input type="date" value={needBy} onChange={(e) => setNeedBy(e.target.value)} style={{ ...inp, ...mono }} /></Field>
          </div>
          <div style={{ flex: "1 1 260px", minWidth: 240, paddingTop: 22, fontFamily: "var(--font-sans)", fontSize: 12.5, lineHeight: 1.6, color: "var(--ink-muted)" }}>
            {belowMin ? <span style={{ color: "var(--danger)" }}>Minimum private label run is {PL_MIN} lb.</span> :
        !minsOk ? <span style={{ color: "var(--danger)" }}>{blocker}</span> :
        <>Roasted to order the week you need it. {isBlend ? "First run of a new blend adds one day for a QC cupping." : sku.lead + "."}</>}
          </div>
        </div>
      </Step>;


  return (
    <div className="pv-page" style={{ maxWidth: "var(--content-max)", margin: "0 auto", padding: "24px 24px 96px", display: "flex", flexDirection: "column", gap: 40 }}>
      {/* Hero */}
      <div>
        <h1 style={{ ...disp, fontSize: "clamp(28px,3vw,50px)", lineHeight: 1, margin: 0, color: "var(--ink)" }}>Private label</h1>
        <p className="pv-lede" style={{ fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.6, color: "var(--ink-muted)", marginTop: 8, maxWidth: 620 }}>Coffee roasted here, sold under your name. No roaster time to book — pick something we already stock or build a blend, tell us how it should be bagged, and we ship it.</p>
      </div>

      {/* Step 1 — what */}
      <Step n={1} title="What are you selling?">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 10 }}>
          {[
          { id: "stock", icon: "pkg", title: "Ready to ship", desc: "Coffees we roast on a schedule. Priced by the pound, out the door in two to four days.", meta: `${PL_STOCK.length} stocked · from ${plMoney(Math.min(...PL_STOCK.map((s) => s.price)))}/lb` },
          { id: "blend", icon: "flame", title: "Build your own blend", desc: "Combine up to four of our green lots, set the ratios and the roast, watch the cup change.", meta: "Priced from your ratios · no blending fee" }].
          map((m) => {
            const on = mode === m.id;
            return (
              <button key={m.id} className="opt-card" onClick={() => setMode(m.id)} style={{ padding: 16, textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 8,
                border: on ? "1.5px solid var(--brand)" : "1px solid var(--hairline)", borderRadius: "var(--r-md)", background: on ? "var(--brand-soft)" : "var(--surface)", fontFamily: "var(--font-sans)", transition: "all var(--dur) var(--ease)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="opt-ico" style={{ width: 32, height: 32, borderRadius: "var(--r-md)", background: on ? "var(--surface)" : "var(--surface-sunken)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: on ? "var(--brand)" : "var(--roast-3)", flexShrink: 0 }}><I name={m.icon} size={17} stroke={2} /></span>
                  <span className="opt-title" style={{ ...disp, fontSize: 16, color: "var(--ink)", lineHeight: 1.05 }}>{m.title}</span>
                </div>
                <div className="opt-desc" style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--ink-muted)" }}>{m.desc}</div>
                <div className="opt-meta" style={{ ...over, fontSize: 9.5, color: "var(--ink-subtle)", marginTop: 2 }}>{m.meta}</div>
              </button>);

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
              <BlendRatios sel={sel} setSel={setSel} roast={roast} setRoast={setRoast}
              blendName={blendName} setBlendName={setBlendName}
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

      {/* Order worksheet */}
      <section>
        <RuleHead label="Order" right={<span style={{ ...mono, fontSize: 11.5, color: "var(--ink-subtle)", whiteSpace: "nowrap" }}>{q.bags.toLocaleString()} × {bag.label}</span>} />
        <LineItem k={`${productName} · ${plRoastName(effRoast)}`} sub={`${lbs} lb × ${plMoney(pricePerLb)}/lb roasted`} v={q.coffee} />
        {q.material > 0 && <LineItem k={`${bag.label} stock bags`} sub={`${q.bags} × ${plMoney(bag.material[pack.id])}`} v={q.material} />}
        {pack.id === "own" && <LineItem k="Bag handling" sub={`${q.bags} × ${plMoney(pack.per)} · your bags`} v={q.perBag} />}
        {pack.id === "label" && <LineItem k={`Label · ${labelSize}`} sub={`${q.bags} × ${plMoney(pack.per)}`} v={q.perBag} />}
        {q.setup > 0 && <LineItem k="Plate setup" sub="One time, per artwork" v={q.setup} />}
        <LineItem k="Fill, seal, date-stamp" sub={`${q.bags} × ${plMoney(PL_FILL)} · packaging line`} v={q.fill} />
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0 0" }}>
          <span style={{ flex: 1, ...over, fontSize: 10.5, color: "var(--ink-muted)" }}>Estimated total</span>
          <span style={{ ...mono, fontSize: 12, color: "var(--ink-subtle)" }}>{plMoney(q.perLb)}/lb · {plMoney(q.unit)}/bag</span>
          <span style={{ ...disp, fontSize: 30, color: "var(--ink)", lineHeight: 1 }}>{plMoney0(q.total)}</span>
        </div>
        <p style={{ margin: "10px 0 0", fontFamily: "var(--font-sans)", fontSize: 12, lineHeight: 1.55, color: "var(--ink-subtle)", maxWidth: "70ch" }}>Billed on your account terms after the run ships. Green price is locked for 60 days from order; packaging is billed at actual bag count, which can move by up to 2% on fill.</p>
      </section>

      {/* Sticky confirm bar */}
      <div className="co-confirmbar" style={{ position: "sticky", bottom: 16, background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-pop)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div className="cb-icon" style={{ width: 44, height: 44, background: "var(--surface-sunken)", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "center", color: plRampColor(effRoast), flexShrink: 0 }}><I name={isBlend ? "flame" : "pkg"} size={20} stroke={2} /></div>
        <div style={{ flex: "1 1 260px", minWidth: 0 }}>
          <div className="cb-title" style={{ ...disp, fontSize: 18, color: "var(--ink)", lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{productName}</div>
          <div className="cb-meta" style={{ fontSize: 12.5, color: blocker ? "var(--danger)" : "var(--ink-muted)", fontFamily: "var(--font-sans)", marginTop: 4 }}>
            {blocker || <span style={mono}>{lbs} lb · {q.bags} × {bag.label} · {pack.title.toLowerCase()}</span>}
          </div>
        </div>
        <div className="cb-price" style={{ textAlign: "right", flexShrink: 0 }}>
          <div className="cb-figure" style={{ ...disp, fontSize: 28, color: "var(--ink)", lineHeight: 1 }}>{plMoney0(q.total)}</div>
          <div style={{ ...over, fontSize: 9, color: "var(--ink-subtle)", marginTop: 3 }}>est. total</div>
        </div>
        <Btn variant="primary" size="lg" disabled={blocked} icon={<I name="arrow" size={15} stroke={2} />}
        onClick={() => openConfirm({ kind: "pl", productName, isBlend, sel, effRoast, pricePerLb, lbs, needBy, q, art, labelSize, ownBags, ownEta })}>Review order</Btn>
      </div>
    </div>);

};

// ---- image placeholder: user drops the real photo in ----
const Slot = ({ id, w, h, radius = 5, placeholder, cls, style }) =>
<div className={cls ? cls + "-wrap" : undefined} onClick={(e) => e.stopPropagation()} style={{ width: w || "100%", height: h, flexShrink: 0, position: "relative", ...style }}>
    <image-slot id={id} class={cls} shape="rounded" radius={radius} placeholder={placeholder}></image-slot>
  </div>;


// ---- stocked coffees, worksheet list ----
const StockList = ({ skuId, setSkuId }) =>
<div style={{ border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", background: "var(--surface)", overflow: "hidden" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 16px", background: "var(--surface-sunken)", borderBottom: "1px solid var(--hairline)" }}>
      <span style={{ flex: 1, ...over, fontSize: 10, color: "var(--ink-muted)" }}>Coffee</span>
      <span style={{ width: 74, textAlign: "right", ...over, fontSize: 10, color: "var(--ink-muted)" }}>$ / lb</span>
    </div>
    {PL_STOCK.map((s, i) => {
    const on = s.id === skuId;
    return (
      <div key={s.id} role="button" tabIndex={0} onClick={() => setSkuId(s.id)} onKeyDown={(e) => {if (e.key === "Enter" || e.key === " ") {e.preventDefault();setSkuId(s.id);}}} style={{ width: "100%", textAlign: "left", cursor: "pointer", padding: "13px 16px",
        borderTop: i ? "1px solid var(--hairline)" : "none", borderLeft: on ? "3px solid var(--brand)" : "3px solid transparent",
        background: on ? "var(--brand-soft)" : "var(--surface)", fontFamily: "var(--font-sans)", display: "flex", gap: 14 }}>
          <Slot id={`pl-coffee-${s.id}`} cls="pl-thumb" w={84} h={84} radius={5} placeholder="Photo" />
          <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 11, height: 11, borderRadius: "var(--r-sm)", flexShrink: 0, background: plRampColor(s.roast), boxShadow: "inset 0 0 0 1px rgba(0,0,0,.14)" }} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{s.name}</span>
                {s.tag && <Pill variant="tomato" dot pulse>{s.tag}</Pill>}
              </span>
              <span style={{ display: "block", fontSize: 12, color: "var(--ink-subtle)", marginTop: 3 }}>{s.sub}</span>
            </span>
            <span style={{ ...mono, fontSize: 14, color: "var(--ink)", width: 74, textAlign: "right" }}>{plMoney(s.price)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8, paddingLeft: 23, flexWrap: "wrap" }}>
            <span style={{ ...over, fontSize: 9, color: "var(--ink-subtle)" }}>{plRoastName(s.roast)}</span>
            <span style={{ ...mono, fontSize: 11, color: "var(--ink-muted)" }}>{s.lead}</span>
            <span style={{ ...mono, fontSize: 11, color: "var(--ink-muted)" }}>{s.avail}</span>
          </div>
          {on && <div style={{ marginTop: 8, paddingLeft: 23, fontSize: 12.5, lineHeight: 1.55, color: "var(--ink-muted)", maxWidth: "58ch" }}>{s.blurb}</div>}
          </div>
        </div>);

  })}
  </div>;


const LineItem = ({ k, sub, v, negative }) =>
<div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0", borderBottom: "1px solid var(--hairline)" }}>
    <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontFamily: "var(--font-sans)", fontSize: 13.5, color: "var(--ink)" }}>{k}</span>
      <span style={{ ...mono, fontSize: 11.5, color: "var(--ink-subtle)" }}>{sub}</span>
    </span>
    <span style={{ ...mono, fontSize: 13.5, color: negative ? "var(--success)" : "var(--ink)", whiteSpace: "nowrap" }}>{negative ? "−" : ""}{plMoney(v)}</span>
  </div>;


// ---- Private label orders, shown under My bookings ----
const PrivateLabelOrders = ({ extra }) => {
  const rows = [...(extra || []), ...PL_ORDERS];
  const tone = { roasting: "tomato", packing: "sun", shipped: "cream", submitted: "sky" };
  return (
    <Panel title="Private label orders" noPadding>
      {rows.map((o, i) =>
      <div key={o.id} className="co-rowlist-row" style={{ display: "flex", alignItems: "center", gap: 16, padding: "13px 16px", borderTop: i ? "1px solid var(--hairline)" : "none" }}>
          <span style={{ ...mono, fontSize: 12, color: "var(--ink-muted)", width: 72, flexShrink: 0 }}>{o.id}</span>
          <div className="co-vrule" style={{ width: 1, alignSelf: "stretch", background: "var(--hairline)" }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>{o.name}</div>
            <div style={{ ...mono, fontSize: 11.5, color: "var(--ink-muted)", marginTop: 3 }}>{o.lbs} lb · {o.bags} × {o.bag} · {o.pack}</div>
          </div>
          <div className="co-rowlist-end" style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ ...disp, fontSize: 20, color: "var(--ink)" }}>{plMoney0(o.total)}</div>
            <Pill variant={tone[o.status] || "cream"} dot pulse={o.status === "roasting"}>{o.eta}</Pill>
          </div>
          <Btn size="sm" variant="outline">{o.status === "shipped" ? "Reorder" : "Track"}</Btn>
        </div>
      )}
    </Panel>);

};

Object.assign(window, { PrivateLabelView, StockList, LineItem, PrivateLabelOrders, Slot });