// CoRoasted Shop — direct-to-customer storefront. Same two paths as Private label
// (buy what we roast, or build a blend), priced at retail per bag instead of
// wholesale per pound. Shares PL_STOCK / PL_GREEN / BlendRatios / TastingWheel.

const SHOP_SIZES = [
  {id:"8oz", label:"8 oz",  lb:0.5, mult:1.20, note:"about 14 cups"},
  {id:"1lb", label:"1 lb",  lb:1,   mult:1.00, note:"about 28 cups"},
  {id:"2lb", label:"2 lb",  lb:2,   mult:0.92, note:"about 56 cups"},
  {id:"5lb", label:"5 lb",  lb:5,   mult:0.84, note:"café size"},
];

const SHIP_FLAT  = 6.50;
const SHIP_FREE  = 50;

const shopQuarter = (n) => Math.round(n*4)/4;
// perLb is the shelf price per roasted pound (from the green catalog)
const shopBagPrice = (perLb, size) => shopQuarter(perLb * size.lb * size.mult);

const ShopView = () => {
  const [mode, setMode]   = React.useState("shop");     // shop | blend
  const [skuId, setSkuId] = React.useState("s-counter");
  const [sel, setSel]     = React.useState([]);
  const [roast, setRoast] = React.useState(null);
  const [blendName, setBlendName] = React.useState("");
  const [sizeId, setSizeId] = React.useState("1lb");
  const [qty, setQty]       = React.useState(1);
  const [justAdded, setJustAdded] = React.useState(false);

  const sku = PL_STOCK.find(s=>s.id===skuId);
  const isBlend = mode === "blend";
  const emptyBlend = isBlend && sel.length === 0;
  const size = SHOP_SIZES.find(s=>s.id===sizeId);

  const effRoast = isBlend ? (roast != null ? roast : (sel.length ? plRoastOf(sel) : 3)) : sku.roast;
  const perLb    = isBlend ? (sel.length ? plRetailSel(sel) : 0) : plStockRetail(sku);
  const vals     = isBlend ? plWeighted(sel, roast != null ? roast : undefined) : sku.notes;
  const name     = isBlend ? (blendName.trim() || "Your blend") : sku.name;

  const unit     = shopBagPrice(perLb, size);
  const goods    = unit * qty;
  const shipping = goods >= SHIP_FREE || goods === 0 ? 0 : SHIP_FLAT;
  const total    = goods + shipping;
  const toFree   = Math.max(0, SHIP_FREE - goods);

  const batchG   = size.lb * qty * PL_G_PER_LB;
  const minsOk   = !isBlend || !sel.length || plMinsFit(sel, batchG);
  const minsG    = isBlend ? sel.reduce((a,x)=>a+plMinG(x.id),0) : 0;
  const blocked  = emptyBlend || qty < 1 || !minsOk;
  const blocker  = emptyBlend ? "Add at least one coffee to your blend."
    : !minsOk ? `${qty} × ${size.label} is ${Math.round(batchG).toLocaleString()} g — these coffees need ${minsG.toLocaleString()} g between them. Order a bigger size, more bags, or drop one.`
    : null;

  const pageRef = React.useRef(null), blendTopRef = React.useRef(null);
  const toBlendTop = () => requestAnimationFrame(()=>{ const el = blendTopRef.current || pageRef.current; if (!el) return;
    const top = el.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--topbar-h"))||56) - 16;
    scrollTo({top, behavior:"smooth"}); });
  const addToCart = () => {
    if (blocked) return;
    const parts = isBlend ? sel.map(x=>{ const g = PL_GREEN.find(c=>c.id===x.id)||{}; return {id:x.id, pct:x.pct, name:g.name||x.id}; }) : null;
    cartStore.add({ kind:isBlend?"blend":"stock", key:isBlend?null:`${skuId}-${sizeId}`, name, sizeLabel:size.label, qty, unit, roast:effRoast, parts, fresh:isBlend });
    setJustAdded(true); setTimeout(()=>setJustAdded(false), 1600);
    if (isBlend) setTimeout(()=>{ setSel([]); setRoast(null); setBlendName(""); setQty(1); }, 320);
    else setQty(1);
  };
  React.useEffect(()=>{ window.__shopNewBlend = () => { setMode("blend"); toBlendTop(); }; }, []);
  const pick = (id) => {
    setMode(id);
    requestAnimationFrame(()=>{ const el = pageRef.current; if (!el) return;
      const top = el.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--topbar-h"))||56) - 8;
      scrollTo({top, behavior:"smooth"}); });
  };
  const options = [
            {id:"shop", icon:"pkg",   title:"Our coffees", desc:"Single origins and house blends we roast every week. Pick one and pick a size.", meta:`${PL_STOCK.length} on the roster · from ${plMoney(shopBagPrice(Math.min(...PL_STOCK.map(s=>plStockRetail(s))), SHOP_SIZES[0]))} a bag`},
            {id:"blend",icon:"flame", title:"Build your own blend", desc:"Combine up to four green lots, move the ratios, set the roast, and watch the cup change as you go.", meta:"Priced from your ratios · no extra fee"},
  ];

  return (<>
    <BoxHero mode={mode} onPick={pick} options={options}/>
    <div ref={pageRef} className="pv-page" style={{maxWidth:"var(--content-max)",margin:"0 auto",padding:"24px 24px 96px",display:"flex",flexDirection:"column",gap:40}}>
      {/* blend: coffees → ratios → name → size */}
      {isBlend ? <>
        <div ref={blendTopRef}/>
        <Step n={2} title="Choose your coffees">
          <BlendRatios sel={sel} setSel={setSel} batchG={batchG} batchLabel={`${qty} × ${size.label}`} retail sections={["add"]}/>
        </Step>

        <Step n={3} title="Adjust your ratios">
          <div style={{display:"flex",flexWrap:"wrap",gap:"clamp(24px,3vw,40px)",alignItems:"flex-start"}}>
            <div style={{flex:"1 1 420px",minWidth:0}}>
              <BlendRatios sel={sel} setSel={setSel} roast={roast} setRoast={setRoast} retail
                blendName={blendName} setBlendName={setBlendName}
                batchG={batchG} batchLabel={`${qty} × ${size.label}`} sections={["ratios","roast","name"]}
                nameHint="Your name for it. It prints on the bag alongside the roast date, and you can reorder it in one click."/>
            </div>
            <div className="pl-cup-col" style={{flex:"1 1 360px",minWidth:320,position:"sticky",top:96}}>
              <TastingWheel vals={vals} roast={effRoast} empty={emptyBlend} title="The cup" />
            </div>
          </div>
        </Step>

        <Step n={4} title="Choose your bag size">
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:8}}>
          {SHOP_SIZES.map(s=>{
            const on = s.id===sizeId, p = shopBagPrice(perLb, s);
            return (
              <button key={s.id} onClick={()=>setSizeId(s.id)} style={{padding:"13px 14px",textAlign:"left",cursor:"pointer",display:"flex",flexDirection:"column",gap:5,
                border:on?"1.5px solid var(--brand)":"1px solid var(--hairline-strong)",borderRadius:"var(--r-md)",background:on?"var(--brand-soft)":"var(--surface)",transition:"all var(--dur) var(--ease)"}}>
                <span style={{...disp,fontSize:15,color:"var(--ink)",lineHeight:1}}>{s.label}</span>
                <span style={{...mono,fontSize:14,color:on?"var(--brand-hover)":"var(--ink)"}}>{plMoney(p)}</span>
                <span style={{fontFamily:"var(--font-sans)",fontSize:11.5,color:"var(--ink-subtle)"}}>{s.note} · {plMoney(p/s.lb)}/lb</span>
              </button>
            );
          })}
        </div>

        </Step>

      </> : <>
        <Step n={2} title="Pick a coffee">
          <div style={{display:"flex",flexWrap:"wrap",gap:"clamp(24px,3vw,40px)",alignItems:"flex-start"}}>
            <div style={{flex:"1 1 420px",minWidth:0}}><ShopGrid skuId={skuId} setSkuId={setSkuId} size={size}/></div>
            <div className="pl-cup-col" style={{flex:"1 1 360px",minWidth:320,position:"sticky",top:96}}>
              <TastingWheel vals={vals} roast={effRoast} empty={emptyBlend} title={sku.name} note="Cupping scores from our lab on the lot in the bag right now."/>
            </div>
          </div>
        </Step>

        <Step n={3} title="Choose your bag size">
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:8}}>
          {SHOP_SIZES.map(s=>{
            const on = s.id===sizeId, p = shopBagPrice(perLb, s);
            return (
              <button key={s.id} onClick={()=>setSizeId(s.id)} style={{padding:"13px 14px",textAlign:"left",cursor:"pointer",display:"flex",flexDirection:"column",gap:5,
                border:on?"1.5px solid var(--brand)":"1px solid var(--hairline-strong)",borderRadius:"var(--r-md)",background:on?"var(--brand-soft)":"var(--surface)",transition:"all var(--dur) var(--ease)"}}>
                <span style={{...disp,fontSize:15,color:"var(--ink)",lineHeight:1}}>{s.label}</span>
                <span style={{...mono,fontSize:14,color:on?"var(--brand-hover)":"var(--ink)"}}>{plMoney(p)}</span>
                <span style={{fontFamily:"var(--font-sans)",fontSize:11.5,color:"var(--ink-subtle)"}}>{s.note} · {plMoney(p/s.lb)}/lb</span>
              </button>
            );
          })}
        </div>

        </Step>
      </>}

      <Step n={isBlend ? 5 : 4} title="Checkout">
      {isBlend && !emptyBlend && (
        <div className="bc-preview" style={{display:"grid",gridTemplateColumns:"minmax(220px,1fr) minmax(0,2fr)",gap:24,alignItems:"stretch",marginBottom:8}}>
          <div style={{background:"var(--surface-sunken)",borderRadius:"var(--r-lg)",minHeight:280,overflow:"hidden",position:"relative"}}><div style={{position:"absolute",inset:0}}><BoxViewer label={name}/></div></div>
          <div className="bc-card" style={{minWidth:0}}><BlendCard sel={sel} vals={vals} name={name} sizeLabel={size.label} roast={effRoast}/></div>
        </div>
      )}
      <section>
        <RuleHead label="Your order" right={<span style={{...mono,fontSize:11.5,color:"var(--ink-subtle)",whiteSpace:"nowrap"}}>{qty} × {size.label}</span>}/>
        <LineItem k={`${name} · ${plRoastName(effRoast)}`} sub={`${qty} × ${size.label} · whole bean`} v={goods}/>
        <LineItem k="Shipping" sub={shipping === 0 ? "Free over $50" : "Flat rate, 2–3 days"} v={shipping}/>
        <div style={{display:"flex",alignItems:"center",gap:16,padding:"14px 0 0"}}>
          <span style={{flex:1,...over,fontSize:10.5,color:"var(--ink-muted)"}}>Total</span>
          <span style={{...mono,fontSize:12,color:"var(--ink-subtle)"}}>{plMoney(unit)}/bag</span>
          <span style={{...disp,fontSize:30,color:"var(--ink)",lineHeight:1}}>{plMoney(total)}</span>
        </div>
        <p style={{margin:"10px 0 0",fontFamily:"var(--font-sans)",fontSize:12,lineHeight:1.55,color:"var(--ink-subtle)",maxWidth:"70ch"}}>
          {toFree > 0 ? `Add ${plMoney(toFree)} for free shipping. ` : ""}Whole bean only, roasted Tuesday and Thursday and shipped the same afternoon. Blends are cupped once before the first bag goes out, which can add a day.
        </p>
      </section>
      </Step>

      {/* sticky bar */}
      <div className="co-confirmbar" style={{position:"sticky",bottom:16,background:"var(--surface)",border:"1px solid var(--hairline)",borderRadius:"var(--r-lg)",boxShadow:"var(--shadow-pop)",padding:"14px 18px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div className="cb-icon" style={{width:44,height:44,background:"var(--surface-sunken)",borderRadius:"var(--r-md)",display:"flex",alignItems:"center",justifyContent:"center",color:plRampColor(effRoast),flexShrink:0}}><I name={isBlend?"flame":"pkg"} size={20} stroke={2}/></div>
        <div style={{flex:"1 1 260px",minWidth:0}}>
          <div className="cb-title" style={{...disp,fontSize:18,color:"var(--ink)",lineHeight:1.1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{name}</div>
          <div className="cb-meta" style={{fontSize:12.5,color:blocker?"var(--danger)":"var(--ink-muted)",fontFamily:"var(--font-sans)",marginTop:4}}>
            {blocker || <span style={mono}>{qty} × {size.label} · whole bean</span>}
          </div>
        </div>
        <div className="cb-qty" style={{display:"flex",alignItems:"center",gap:2,flexShrink:0}}>
          <Stepper glyph="−" side="l" onClick={()=>setQty(q=>Math.max(1,q-1))}/>
          <span style={{minWidth:46,textAlign:"center",...mono,fontSize:14,color:"var(--ink)"}}>{qty}</span>
          <Stepper glyph="+" side="r" onClick={()=>setQty(q=>Math.min(24,q+1))}/>
        </div>
        <div className="cb-price" style={{textAlign:"right",flexShrink:0}}>
          <div className="cb-figure" style={{...disp,fontSize:28,color:"var(--ink)",lineHeight:1}}>{plMoney(total)}</div>
          <div style={{...over,fontSize:9,color:"var(--ink-subtle)",marginTop:3}}></div>
        </div>
        <Btn variant="primary" size="lg" disabled={blocked} icon={<I name="arrow" size={15} stroke={2}/>} onClick={addToCart}>{justAdded ? "Added" : "Add to cart"}</Btn>
      </div>

    </div>
  </>);
};

// ---- retail coffee grid: photo, name, cup notes, shelf price ----
const ShopGrid = ({ skuId, setSkuId, size }) => (
  <div className="sg-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:12,alignItems:"start"}}>
    {PL_STOCK.map(s=>{
      const on = s.id===skuId;
      return (
        <div key={s.id} className="sg-card" role="button" tabIndex={0} onClick={()=>setSkuId(s.id)} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setSkuId(s.id);}}}
          style={{cursor:"pointer",display:"flex",flexDirection:"column",gap:9,padding:11,textAlign:"left",transition:"all var(--dur) var(--ease)",
            border:on?"1.5px solid var(--brand)":"1px solid var(--hairline)",borderRadius:"var(--r-md)",background:on?"var(--brand-soft)":"var(--surface)"}}>
          <Slot id={`shop-${s.id}`} cls="sg-photo" radius={5} placeholder={s.name} style={{aspectRatio:"1 / 1"}}/>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{width:10,height:10,borderRadius:"var(--r-sm)",flexShrink:0,background:plRampColor(s.roast),boxShadow:"inset 0 0 0 1px rgba(0,0,0,.14)"}}/>
            <span style={{flex:1,minWidth:0,fontFamily:"var(--font-sans)",fontSize:13.5,fontWeight:600,color:"var(--ink)"}}>{s.name}</span>
            {s.tag && <Pill variant="tomato" dot pulse>{s.tag}</Pill>}
          </div>
          <div style={{...over,fontSize:9,color:"var(--ink-subtle)"}}>{plRoastName(s.roast)} · {s.sub.split(" · ")[0]}</div>
          <div style={{fontFamily:"var(--font-sans)",fontSize:12,lineHeight:1.5,color:"var(--ink-muted)",flex:1}}>{s.blurb}</div>
          <div style={{display:"flex",alignItems:"baseline",gap:7,paddingTop:2,borderTop:"1px solid var(--hairline)"}}>
            <span style={{...mono,fontSize:14,color:"var(--ink)",paddingTop:7}}>{plMoney(shopBagPrice(plStockRetail(s), size))}</span>
            <span style={{...mono,fontSize:11,color:"var(--ink-subtle)"}}>/ {size.label}</span>
          </div>
          {window.CoffeeReviews && <CoffeeReviews coffee={s} compact/>}
        </div>
      );
    })}
  </div>
);

// ---- storefront chrome ----
const ShopChrome = () => (
  <div style={{position:"sticky",top:0,zIndex:50,background:"var(--surface)",borderBottom:"1px solid var(--hairline)"}}>
    <div className="pc-bar" style={{maxWidth:"var(--content-max)",margin:"0 auto",display:"flex",alignItems:"center",gap:16,height:"var(--topbar-h)",padding:"0 24px"}}>
      <span style={{...disp,fontSize:17,color:"var(--ink)",letterSpacing:"-0.02em"}}>Co<span style={{color:"var(--brand)"}}>R</span>oasted</span>
      <span className="pc-facility" style={{...over,fontSize:10,color:"var(--ink-subtle)"}}>Shop</span>
      <span style={{flex:1}}/>
      <span style={{...mono,fontSize:11.5,color:"var(--ink-muted)"}}>Free shipping over $50</span>
    </div>
  </div>
);

Object.assign(window, { ShopView, ShopGrid, ShopChrome, SHOP_SIZES, shopBagPrice });
