// JobRequestFlow — for services where the roaster requests a job rather than booking time.
// Used by Co-Roast and Packaging. Replaces the resource picker + timeline with:
//   • How much  — quantity input with quick-set chips
//   • When do you need it by  — Standard / Priority / Express tiers with date deltas
//   • Source picker (which lot / which bags) for co-roast / pack
// Returns up via openConfirm(payload) the same shape as BookView.

const JobRequestFlow = ({ serviceId, openConfirm }) => {
  const meta = {
    coroast: {
      label:"Co-Roast", icon:"coffee", color:"honey",
      desc:"We pull green from your shelf, roast to your spec, and stage the output.",
      ratePerLb: 3.5,
      qtyLabel:"Pounds (green)", qtyUnit:"lb", qtyDefault:120, qtyChips:[40,80,120,200,300],
      sourcePicker:"green",
    },
    pack: {
      label:"Packaging", icon:"box", color:"matcha",
      desc:"Bag, tin-tie, label, and stage for pickup.",
      ratePerLb: 1.4, // per oz-equivalent simplified per-bag
      qtyLabel:"Bags", qtyUnit:"bag", qtyDefault:200, qtyChips:[50,100,200,500,1000],
      sourcePicker:"roasted",
    },
  }[serviceId];

  // Tiers — relative to "now" (Apr 25 2026)
  const TIERS = [
    { id:"standard", label:"Standard",  hint:"Next available slot",         days:7,  pct:0,    queue:"~ 5–7 days out" },
    { id:"priority", label:"Priority",  hint:"We'll fit it in this week",   days:3,  pct:0.20, queue:"In ~3 business days" },
    { id:"express",  label:"Express",   hint:"Bumped to the front",          days:1,  pct:0.45, queue:"Tomorrow if green is on shelf" },
    { id:"sameday",  label:"Same-Day",  hint:"Walk it on the floor today",   days:0,  pct:0.85, queue:"Floor confirms by 11a" },
  ];

  const [qty, setQty]     = React.useState(meta.qtyDefault);
  const [tierId, setTier] = React.useState("standard");
  const [profile, setProfile] = React.useState(serviceId==="coroast"?"Med · Full City":"");
  const [bagSize, setBagSize] = React.useState("12 oz");
  const [sourceId, setSourceId] = React.useState(myShelves[0]?.id || null);
  const [notes, setNotes] = React.useState("");

  const tier = TIERS.find(t=>t.id===tierId);
  const subtotal = qty * meta.ratePerLb;
  const rush = subtotal * tier.pct;
  const total = subtotal + rush;

  // Need-by date
  const today = new Date(2026, 3, 25); // Apr 25
  const needBy = new Date(today.getTime() + tier.days*86400000);
  const needByLabel = `${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][needBy.getDay()]} · ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][needBy.getMonth()]} ${needBy.getDate()}`;

  // Capacity hint based on qty (data-driven flavor)
  const capacityNote = (() => {
    if (serviceId==="coroast") {
      if (qty <= 80)  return "1 batch on the Probat 12kg.";
      if (qty <= 160) return "2 batches on the Probat 25kg.";
      if (qty <= 300) return "3–4 batches on the Loring S15.";
      return "Multi-day run on the Loring S15.";
    } else {
      if (qty <= 100) return "Half-shift on the line.";
      if (qty <= 300) return "1 shift on the line.";
      return "1.5–2 shifts on the line.";
    }
  })();

  // Mock sources for the picker
  const sources = serviceId === "coroast"
    ? myShelves.length ? myShelves : [{id:"shelf-stub",row:"A",num:"01",size:"Full"}]
    : [
        {id:"roast-1", lot:"Ethiopia Yirgacheffe G1",   lbs:42,  ready:"Apr 22"},
        {id:"roast-2", lot:"Brazil Daterra Sweet",       lbs:88,  ready:"Apr 24"},
        {id:"roast-3", lot:"Decaf Sumatra (CO₂ method)", lbs:30,  ready:"Apr 24"},
      ];
  React.useEffect(()=>{ if (!sources.find(s=>s.id===sourceId)) setSourceId(sources[0]?.id || null); },[serviceId]);

  return (
    <div style={{padding:"24px 28px 80px",display:"flex",flexDirection:"column",gap:18}}>
      {/* Hero */}
      <div style={{display:"flex",alignItems:"flex-end",gap:14}}>
        <h1 style={{fontFamily:"var(--font-display)",fontSize:54,lineHeight:1.2,textTransform:"uppercase",margin:0}}>
          Request {meta.label}
        </h1>
        <div style={{fontSize:13,color:"var(--fg2)",fontWeight:600,paddingBottom:8,maxWidth:440}}>{meta.desc} You don't book the machine — we slot it into the queue based on how soon you need it.</div>
      </div>

      {/* Step 1 — Service */}
      <ServicePicker serviceId={serviceId}/>

      {/* Step 2 — How much */}
      <Step n={2} title="How much?">
        <div style={{display:"flex",alignItems:"center",gap:24,flexWrap:"wrap",padding:"18px 20px",background:"var(--color-cream)",border:"3px solid var(--color-espresso)",borderRadius:14,boxShadow:"3px 3px 0 var(--color-espresso)"}}>
          <div style={{flex:"0 0 auto",display:"flex",alignItems:"baseline",gap:9}}>
            <input
              type="number" min="1" value={qty} onChange={e=>setQty(Math.max(1, +e.target.value || 1))}
              style={{
                width:170,fontFamily:"var(--font-display)",fontSize:64,lineHeight:1.2,
                border:"none",background:"transparent",color:"var(--color-espresso)",
                outline:"none",padding:0,
              }}/>
            <span style={{fontFamily:"var(--font-display)",fontSize:24,textTransform:"uppercase",color:"var(--fg2)"}}>{meta.qtyUnit}{qty===1?"":"s"}</span>
          </div>
          <div style={{flex:"1 1 280px",display:"flex",flexDirection:"column",gap:8}}>
            <div style={{fontSize:10.5,fontWeight:800,letterSpacing:".11em",textTransform:"uppercase",color:"var(--fg2)"}}>Quick-set</div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {meta.qtyChips.map(n=>(
                <button key={n} onClick={()=>setQty(n)} style={{
                  padding:"6px 13px",borderRadius:9999,border:"2px solid var(--color-espresso)",
                  background: qty===n ? "var(--color-espresso)" : "var(--color-cream)",
                  color: qty===n ? "var(--color-cream)" : "var(--color-espresso)",
                  fontFamily:"var(--font-mono)",fontSize:12,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap",
                }}>{n} {meta.qtyUnit}</button>
              ))}
            </div>
            <div style={{fontSize:11.5,fontWeight:700,color:"var(--fg2)",marginTop:4,display:"flex",alignItems:"center",gap:6}}>
              <I2 name="info" size={12}/> {capacityNote}
            </div>
          </div>
        </div>
      </Step>

      {/* Step 3 — Source */}
      <Step n={3} title={meta.sourcePicker==="green" ? "Which green coffee?" : "Which roasted lot?"}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:9}}>
          {sources.map(s=>{
            const active = s.id===sourceId;
            const label = meta.sourcePicker==="green"
              ? (s.lot ? `${s.lot}` : `Shelf ${s.row}-${s.num}`)
              : s.lot;
            const sub = meta.sourcePicker==="green"
              ? (`Shelf ${s.row}-${s.num} · ${s.size||"Full"}`)
              : `${s.lbs} lb available · roasted ${s.ready}`;
            return (
              <button key={s.id} onClick={()=>setSourceId(s.id)} style={{
                padding:12,border:"2.5px solid var(--color-espresso)",borderRadius:12,
                background: active ? "var(--color-sun)" : "var(--color-cream)",
                color:"var(--color-espresso)",cursor:"pointer",textAlign:"left",
                boxShadow: active ? "3px 3px 0 var(--color-espresso)" : "1px 1px 0 var(--color-espresso)",
                transform: active ? "translate(-1px,-1px)" : "none",fontFamily:"var(--font-body)",
              }}>
                <div style={{fontWeight:800,fontSize:13.5,lineHeight:1.2}}>{label}</div>
                <div style={{fontSize:11,color:"var(--fg2)",marginTop:3,fontWeight:700}}>{sub}</div>
              </button>
            );
          })}
          <button style={{
            padding:12,border:"2.5px dashed var(--color-espresso)",borderRadius:12,
            background:"transparent",color:"var(--color-espresso)",cursor:"pointer",
            fontFamily:"var(--font-body)",fontWeight:700,fontSize:13,
          }}>+ Bring something new</button>
        </div>
      </Step>

      {/* Step 4 — Profile / bag size */}
      {serviceId === "coroast" && (
        <Step n={4} title="Roast spec">
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {["Light · City","Med · Full City","Med-Dark · Vienna","Dark · French","Custom curve"].map(p=>(
              <button key={p} onClick={()=>setProfile(p)} style={{
                padding:"9px 14px",border:"2.5px solid var(--color-espresso)",borderRadius:10,
                background: profile===p ? "var(--color-espresso)" : "var(--color-cream)",
                color: profile===p ? "var(--color-cream)" : "var(--color-espresso)",
                fontFamily:"var(--font-body)",fontWeight:700,fontSize:12.5,cursor:"pointer",
              }}>{p}</button>
            ))}
          </div>
        </Step>
      )}
      {serviceId === "pack" && (
        <Step n={4} title="Bag spec">
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {["8 oz","12 oz","16 oz","2 lb","5 lb"].map(b=>(
              <button key={b} onClick={()=>setBagSize(b)} style={{
                padding:"9px 14px",border:"2.5px solid var(--color-espresso)",borderRadius:10,
                background: bagSize===b ? "var(--color-espresso)" : "var(--color-cream)",
                color: bagSize===b ? "var(--color-cream)" : "var(--color-espresso)",
                fontFamily:"var(--font-body)",fontWeight:700,fontSize:12.5,cursor:"pointer",
              }}>{b}</button>
            ))}
          </div>
        </Step>
      )}

      {/* Step 5 — When */}
      <Step n={5} title="When do you need it by?">
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:10}}>
          {TIERS.map(t=>{
            const active = t.id===tierId;
            const date = new Date(today.getTime() + t.days*86400000);
            const dLabel = t.days===0
              ? "Today"
              : `${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][date.getDay()]} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][date.getMonth()]} ${date.getDate()}`;
            const surchargeLabel = t.pct === 0 ? "No rush fee" : `+${Math.round(t.pct*100)}% rush fee`;
            return (
              <button key={t.id} onClick={()=>setTier(t.id)} style={{
                padding:14,border:"3px solid var(--color-espresso)",borderRadius:14,textAlign:"left",
                background: active ? "var(--color-tomato)" : "var(--color-cream)",
                color: active ? "var(--color-cream)" : "var(--color-espresso)",
                boxShadow: active ? "4px 4px 0 var(--color-espresso)" : "2px 2px 0 var(--color-espresso)",
                transform: active ? "translate(-1.5px,-1.5px)" : "none",
                cursor:"pointer",fontFamily:"var(--font-body)",
                display:"flex",flexDirection:"column",gap:5,position:"relative",
              }}>
                {t.id==="express" && <span style={{position:"absolute",top:-9,right:10,padding:"2px 8px",background:"var(--color-sun)",border:"2px solid var(--color-espresso)",borderRadius:6,fontSize:9.5,fontWeight:900,letterSpacing:".11em",textTransform:"uppercase",color:"var(--color-espresso)"}}>Most picked</span>}
                <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:8}}>
                  <span style={{fontFamily:"var(--font-display)",fontSize:22,textTransform:"uppercase",lineHeight:1.2}}>{t.label}</span>
                  <span style={{fontFamily:"var(--font-mono)",fontSize:12.5,fontWeight:800,opacity:.9}}>{dLabel}</span>
                </div>
                <div style={{fontSize:12,fontWeight:700,opacity:.85}}>{t.hint}</div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginTop:5,fontSize:10.5,fontWeight:800,letterSpacing:".07em",textTransform:"uppercase"}}>
                  <I2 name="bolt" size={11}/>{surchargeLabel}
                </div>
              </button>
            );
          })}
        </div>
        <div style={{marginTop:10,padding:"9px 14px",background:"var(--color-chalk)",border:"2px solid var(--color-fog)",borderRadius:10,fontSize:11.5,fontWeight:700,color:"var(--fg2)",display:"flex",alignItems:"center",gap:8}}>
          <I2 name="info" size={13}/>
          {tier.queue} · {FACILITY.name} confirms within 4 working hours.
        </div>
      </Step>

      {/* Notes */}
      <Step n={6} title="Anything else?">
        <textarea
          value={notes} onChange={e=>setNotes(e.target.value)}
          placeholder={serviceId==="coroast" ? "First-crack target, drop temp, special handling..." : "Label artwork dropbox link, lot codes, sticker placement..."}
          rows={2}
          style={{
            width:"100%",padding:"11px 14px",fontFamily:"var(--font-body)",fontSize:13,
            border:"2.5px solid var(--color-espresso)",borderRadius:11,background:"var(--color-cream)",
            outline:"none",resize:"vertical",
          }}/>
      </Step>

      {/* Confirm bar */}
      <div style={{
        position:"sticky",bottom:14,background:"var(--color-cream)",border:"3px solid var(--color-espresso)",borderRadius:14,
        boxShadow:"4px 4px 0 var(--color-espresso)",padding:"14px 18px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",
      }}>
        <div style={{flex:"1 1 320px",display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:46,height:46,background:`var(--color-${meta.color})`,border:"2.5px solid var(--color-espresso)",borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <I name={meta.icon} size={20}/>
          </div>
          <div>
            <div style={{fontFamily:"var(--font-display)",fontSize:22,textTransform:"uppercase",lineHeight:1.2}}>
              {qty} {meta.qtyUnit}{qty===1?"":"s"} · {tier.label}
            </div>
            <div style={{fontSize:12,fontWeight:700,color:"var(--fg2)",marginTop:5}}>
              Need by {needByLabel} · ${meta.ratePerLb.toFixed(2)}/{meta.qtyUnit}
              {tier.pct>0 && <> · <span style={{color:"var(--color-tomato)",fontWeight:800}}>+{Math.round(tier.pct*100)}% rush</span></>}
            </div>
          </div>
        </div>
        <div style={{textAlign:"right",lineHeight:1.2}}>
          <div style={{fontFamily:"var(--font-mono)",fontSize:11,fontWeight:700,color:"var(--fg2)"}}>
            {qty}×${meta.ratePerLb.toFixed(2)} = ${subtotal.toFixed(0)}{rush>0 && <> + ${rush.toFixed(0)} rush</>}
          </div>
          <div style={{fontFamily:"var(--font-display)",fontSize:30,color:"var(--color-tomato)",lineHeight:1.2,marginTop:2}}>${total.toFixed(0)}</div>
          <div style={{fontSize:9.5,fontWeight:800,letterSpacing:".11em",textTransform:"uppercase",color:"var(--fg2)"}}>est. total</div>
        </div>
        <Btn variant="primary" onClick={()=>openConfirm({
          serviceId, kind:"job",
          payload:{ qty, unit:meta.qtyUnit, tier, needByLabel, profile, bagSize,
                   sourceId, source:sources.find(s=>s.id===sourceId), notes,
                   ratePerLb:meta.ratePerLb, subtotal, rush, total, label:meta.label, color:meta.color, icon:meta.icon }
        })}>
          Submit Request →
        </Btn>
      </div>
    </div>
  );
};

// Slim re-render of the service picker so it sits at the top of either flow
const ServicePicker = ({serviceId}) => {
  const setServiceId = window.__setServiceId;
  const items = [
    { id:"toll",     label:"Toll Roasting",  desc:"Bring your green. Run your own roast.",       icon:"flame", color:"tomato", pricing:"$75/hr · book a slot" },
    { id:"coroast",  label:"Co-Roast",       desc:"We pull from your shelf and roast to spec.",  icon:"coffee",color:"honey",  pricing:"$3.50/lb · job request" },
    { id:"sample",   label:"Sample Roast",   desc:"Tiny batch on the sample roaster.",           icon:"bolt",  color:"sky",    pricing:"$35/hr · book a slot" },
    { id:"coach",    label:"1:1 with Joel",  desc:"Walk through the curve and the cup.",         icon:"user",  color:"sky",    pricing:"$90/hr · book a slot" },
    { id:"pack",     label:"Packaging",      desc:"Bag, tin-tie, label, stage for pickup.",      icon:"box",   color:"matcha", pricing:"$1.40/bag · job request" },
  ];
  return (
    <Step n={1} title="What do you need?">
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(190px, 1fr))",gap:10}}>
        {items.map(m=>(
          <button key={m.id} onClick={()=>setServiceId(m.id)} style={{
            padding:14,border:"3px solid var(--color-espresso)",borderRadius:14,
            background:serviceId===m.id?`var(--color-${m.color})`:"var(--color-cream)",
            color:serviceId===m.id && m.color==="tomato"?"var(--color-cream)":"var(--color-espresso)",
            boxShadow:serviceId===m.id?"4px 4px 0 var(--color-espresso)":"2px 2px 0 var(--color-espresso)",
            transform:serviceId===m.id?"translate(-1.5px,-1.5px)":"none",
            textAlign:"left",cursor:"pointer",fontFamily:"var(--font-body)",
            transition:"all .12s var(--ease-snap)",display:"flex",flexDirection:"column",gap:6,
          }}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <I name={m.icon} size={18}/>
              <span style={{fontFamily:"var(--font-display)",fontSize:18,textTransform:"uppercase",lineHeight:1.2}}>{m.label}</span>
            </div>
            <div style={{fontSize:11.5,fontWeight:600,opacity:.85,lineHeight:1.35}}>{m.desc}</div>
            <div style={{fontSize:10.5,fontWeight:800,letterSpacing:".09em",textTransform:"uppercase",marginTop:2}}>{m.pricing}</div>
          </button>
        ))}
      </div>
    </Step>
  );
};

Object.assign(window, { JobRequestFlow, ServicePicker });
