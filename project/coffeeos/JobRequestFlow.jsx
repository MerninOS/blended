// Roaster Portal × CoffeeOS — Job Request flow (Co-Roast / Packaging).
// Worksheet steps: quantity, source, spec, need-by tier, notes, sticky confirm.
// Reuses Step + type helpers from BookView. Logic unchanged.

const JobRequestFlow = ({ serviceId, openConfirm }) => {
  const meta = {
    coroast: { label:"Co-roast", icon:"coffee", desc:"We pull green from your shelf, roast to your spec, and stage the output.", ratePerLb:3.5, qtyLabel:"Pounds (green)", qtyUnit:"lb", qtyDefault:120, qtyChips:[40,80,120,200,300], sourcePicker:"green" },
    pack:    { label:"Packaging", icon:"box", desc:"Bag, tin-tie, label, and stage for pickup.", ratePerLb:1.4, qtyLabel:"Bags", qtyUnit:"bag", qtyDefault:200, qtyChips:[50,100,200,500,1000], sourcePicker:"roasted" },
  }[serviceId];
  const dot = SVC_DOT[serviceId];

  const TIERS = [
    { id:"standard", label:"Standard", hint:"Next available slot",       days:7, pct:0,    queue:"~ 5–7 days out" },
    { id:"priority", label:"Priority", hint:"We'll fit it in this week", days:3, pct:0.20, queue:"In ~3 business days" },
    { id:"express",  label:"Express",  hint:"Bumped to the front",        days:1, pct:0.45, queue:"Tomorrow if green is on shelf" },
    { id:"sameday",  label:"Same-day", hint:"Walk it on the floor today", days:0, pct:0.85, queue:"Floor confirms by 11a" },
  ];

  const [qty, setQty] = React.useState(meta.qtyDefault);
  const [tierId, setTier] = React.useState("standard");
  const [profile, setProfile] = React.useState(serviceId==="coroast"?"Med · Full City":"");
  const [bagSize, setBagSize] = React.useState("12 oz");
  const [sourceId, setSourceId] = React.useState(myShelves[0]?.id || null);
  const [notes, setNotes] = React.useState("");

  const tier = TIERS.find(t=>t.id===tierId);
  const subtotal = qty * meta.ratePerLb, rush = subtotal * tier.pct, total = subtotal + rush;
  const today = new Date(2026, 3, 25);
  const needBy = new Date(today.getTime() + tier.days*86400000);
  const needByLabel = `${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][needBy.getDay()]} · ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][needBy.getMonth()]} ${needBy.getDate()}`;

  const capacityNote = (() => {
    if (serviceId==="coroast") { if (qty<=80) return "1 batch on the Probat 12kg."; if (qty<=160) return "2 batches on the Probat 25kg."; if (qty<=300) return "3–4 batches on the Loring S15."; return "Multi-day run on the Loring S15."; }
    if (qty<=100) return "Half-shift on the line."; if (qty<=300) return "1 shift on the line."; return "1.5–2 shifts on the line.";
  })();

  const sources = serviceId === "coroast"
    ? (myShelves.length ? myShelves : [{id:"shelf-stub",row:"A",num:"01",size:"Full"}])
    : [ {id:"roast-1", lot:"Ethiopia Yirgacheffe G1", lbs:42, ready:"Apr 22"}, {id:"roast-2", lot:"Brazil Daterra Sweet", lbs:88, ready:"Apr 24"}, {id:"roast-3", lot:"Decaf Sumatra (CO₂ method)", lbs:30, ready:"Apr 24"} ];
  React.useEffect(()=>{ if (!sources.find(s=>s.id===sourceId)) setSourceId(sources[0]?.id || null); },[serviceId]);

  const chipStyle = (on) => ({padding:"8px 13px",border:on?"1px solid var(--ink)":"1px solid var(--hairline-strong)",borderRadius:"var(--r-md)",background:on?"var(--ink)":"var(--surface)",color:on?"var(--on-ink)":"var(--ink)",fontFamily:"var(--font-sans)",fontWeight:on?600:500,fontSize:12.5,cursor:"pointer",whiteSpace:"nowrap"});

  return (
    <div className="pv-page" style={{maxWidth:"var(--content-max)",margin:"0 auto",padding:"24px 24px 96px",display:"flex",flexDirection:"column",gap:24}}>
      <div>
        <h1 style={{...disp,fontSize:"clamp(28px,3vw,40px)",lineHeight:1,margin:0,color:"var(--ink)"}}>Request {meta.label}</h1>
        <p style={{fontFamily:"var(--font-sans)",fontSize:14,color:"var(--ink-muted)",marginTop:8,maxWidth:580}}>{meta.desc} You don't book the machine — we slot it into the queue based on how soon you need it.</p>
      </div>

      <ServicePicker serviceId={serviceId}/>

      {/* Step 2 — How much */}
      <Step n={2} title="How much?">
        <div style={{display:"flex",alignItems:"center",gap:24,flexWrap:"wrap",padding:"18px 20px",background:"var(--surface)",border:"1px solid var(--hairline)",borderRadius:"var(--r-md)"}}>
          <div style={{flex:"0 0 auto",display:"flex",alignItems:"baseline",gap:9}}>
            <input type="number" min="1" value={qty} onChange={e=>setQty(Math.max(1,+e.target.value||1))} style={{width:160,...disp,fontSize:60,lineHeight:1,border:"none",background:"transparent",color:"var(--ink)",outline:"none",padding:0}}/>
            <span style={{...disp,fontSize:22,color:"var(--ink-subtle)"}}>{meta.qtyUnit}{qty===1?"":"s"}</span>
          </div>
          <div style={{flex:"1 1 280px",display:"flex",flexDirection:"column",gap:8}}>
            <div style={{...over,fontSize:10,color:"var(--ink-subtle)"}}>Quick-set</div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {meta.qtyChips.map(n=>{ const on=qty===n; return <button key={n} onClick={()=>setQty(n)} style={{padding:"6px 12px",borderRadius:"var(--r-pill)",border:on?"1px solid var(--ink)":"1px solid var(--hairline-strong)",background:on?"var(--ink)":"var(--surface)",color:on?"var(--on-ink)":"var(--ink)",...mono,fontSize:12,cursor:"pointer",whiteSpace:"nowrap"}}>{n} {meta.qtyUnit}</button>; })}
            </div>
            <div style={{fontSize:12,color:"var(--ink-muted)",fontFamily:"var(--font-sans)",marginTop:4,display:"flex",alignItems:"center",gap:6}}><I2 name="info" size={13} stroke={2}/> {capacityNote}</div>
          </div>
        </div>
      </Step>

      {/* Step 3 — Source */}
      <Step n={3} title={meta.sourcePicker==="green" ? "Which green coffee?" : "Which roasted lot?"}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:9}}>
          {sources.map(s=>{
            const on=s.id===sourceId;
            const label = meta.sourcePicker==="green" ? (s.lot ? s.lot : `Shelf ${s.row}-${s.num}`) : s.lot;
            const sub = meta.sourcePicker==="green" ? `Shelf ${s.row}-${s.num} · ${s.size||"Full"}` : `${s.lbs} lb available · roasted ${s.ready}`;
            return (
              <button key={s.id} onClick={()=>setSourceId(s.id)} style={{padding:12,border:on?"1.5px solid var(--brand)":"1px solid var(--hairline)",borderRadius:"var(--r-md)",background:on?"var(--brand-soft)":"var(--surface)",color:"var(--ink)",cursor:"pointer",textAlign:"left",fontFamily:"var(--font-sans)"}}>
                <div style={{fontWeight:600,fontSize:13.5,lineHeight:1.25}}>{label}</div>
                <div style={{fontSize:11.5,color:"var(--ink-muted)",marginTop:3}}>{sub}</div>
              </button>
            );
          })}
          <button style={{padding:12,border:"1px dashed var(--hairline-strong)",borderRadius:"var(--r-md)",background:"transparent",color:"var(--ink-muted)",cursor:"pointer",fontFamily:"var(--font-sans)",fontWeight:500,fontSize:13}}>+ Bring something new</button>
        </div>
      </Step>

      {/* Step 4 — spec */}
      {serviceId === "coroast" && (
        <Step n={4} title="Roast spec">
          <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>{["Light · City","Med · Full City","Med-Dark · Vienna","Dark · French","Custom curve"].map(p=><button key={p} onClick={()=>setProfile(p)} style={chipStyle(profile===p)}>{p}</button>)}</div>
        </Step>
      )}
      {serviceId === "pack" && (
        <Step n={4} title="Bag spec">
          <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>{["8 oz","12 oz","16 oz","2 lb","5 lb"].map(b=><button key={b} onClick={()=>setBagSize(b)} style={chipStyle(bagSize===b)}>{b}</button>)}</div>
        </Step>
      )}

      {/* Step 5 — When */}
      <Step n={5} title="When do you need it by?">
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:10}}>
          {TIERS.map(t=>{
            const on=t.id===tierId, date=new Date(today.getTime()+t.days*86400000);
            const dLabel = t.days===0?"Today":`${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][date.getDay()]} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][date.getMonth()]} ${date.getDate()}`;
            const surcharge = t.pct===0?"No rush fee":`+${Math.round(t.pct*100)}% rush fee`;
            return (
              <button key={t.id} onClick={()=>setTier(t.id)} style={{padding:14,border:on?"1.5px solid var(--brand)":"1px solid var(--hairline)",borderRadius:"var(--r-md)",textAlign:"left",background:on?"var(--brand-soft)":"var(--surface)",color:"var(--ink)",cursor:"pointer",fontFamily:"var(--font-sans)",display:"flex",flexDirection:"column",gap:6,position:"relative"}}>
                {t.id==="express" && <span style={{position:"absolute",top:-8,right:12,padding:"2px 8px",background:"var(--brand)",borderRadius:"var(--r-pill)",...over,fontSize:9,color:"#fff"}}>Most picked</span>}
                <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:8}}>
                  <span style={{...disp,fontSize:18,color:"var(--ink)",lineHeight:1.1}}>{t.label}</span>
                  <span style={{...mono,fontSize:12,color:"var(--ink-muted)"}}>{dLabel}</span>
                </div>
                <div style={{fontSize:12.5,color:"var(--ink-muted)"}}>{t.hint}</div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4,...over,fontSize:9.5,color:t.pct===0?"var(--ink-subtle)":"var(--brand)"}}><I2 name="bolt" size={11} stroke={2}/>{surcharge}</div>
              </button>
            );
          })}
        </div>
        <div style={{marginTop:10,padding:"9px 14px",background:"var(--surface-sunken)",border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",fontSize:12,color:"var(--ink-muted)",fontFamily:"var(--font-sans)",display:"flex",alignItems:"center",gap:8}}><I2 name="info" size={13} stroke={2}/>{tier.queue} · {FACILITY.name} confirms within 4 working hours.</div>
      </Step>

      {/* Step 6 — Notes */}
      <Step n={6} title="Anything else?">
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder={serviceId==="coroast" ? "First-crack target, drop temp, special handling..." : "Label artwork dropbox link, lot codes, sticker placement..."} rows={2} style={{...inp,resize:"vertical",fontFamily:"var(--font-sans)"}}/>
      </Step>

      {/* Confirm bar */}
      <div className="co-confirmbar" style={{position:"sticky",bottom:16,background:"var(--surface)",border:"1px solid var(--hairline)",borderRadius:"var(--r-lg)",boxShadow:"var(--shadow-pop)",padding:"14px 18px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div style={{flex:"1 1 320px",display:"flex",alignItems:"center",gap:14,minWidth:0}}>
          <div className="cb-icon" style={{width:44,height:44,background:"var(--surface-sunken)",borderRadius:"var(--r-md)",display:"flex",alignItems:"center",justifyContent:"center",color:dot,flexShrink:0}}><I name={meta.icon} size={20} stroke={2}/></div>
          <div style={{minWidth:0}}>
            <div className="cb-title" style={{...disp,fontSize:18,color:"var(--ink)",lineHeight:1.1}}>{qty} {meta.qtyUnit}{qty===1?"":"s"} · {tier.label}</div>
            <div className="cb-meta" style={{fontSize:12.5,color:"var(--ink-muted)",fontFamily:"var(--font-sans)",marginTop:4}}>Need by <span style={mono}>{needByLabel}</span> · <span style={mono}>${meta.ratePerLb.toFixed(2)}/{meta.qtyUnit}</span>{tier.pct>0 && <> · <span style={{color:"var(--brand)",fontWeight:600}}>+{Math.round(tier.pct*100)}% rush</span></>}</div>
          </div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{...mono,fontSize:11,color:"var(--ink-muted)"}}>{qty}×${meta.ratePerLb.toFixed(2)} = ${subtotal.toFixed(0)}{rush>0 && <> + ${rush.toFixed(0)} rush</>}</div>
          <div style={{...disp,fontSize:28,color:"var(--ink)",lineHeight:1,marginTop:2}}>${total.toFixed(0)}</div>
          <div style={{...over,fontSize:9,color:"var(--ink-subtle)",marginTop:2}}>est. total</div>
        </div>
        <Btn variant="primary" size="lg" icon={<I name="arrow" size={15} stroke={2}/>} onClick={()=>openConfirm({serviceId, kind:"job", payload:{ qty, unit:meta.qtyUnit, tier, needByLabel, profile, bagSize, sourceId, source:sources.find(s=>s.id===sourceId), notes, ratePerLb:meta.ratePerLb, subtotal, rush, total, label:meta.label, icon:meta.icon }})}>Submit request</Btn>
      </div>
    </div>
  );
};

const ServicePicker = ({serviceId}) => {
  const setServiceId = window.__setServiceId;
  const items = [
    { id:"toll",    label:"Toll roasting", desc:"Bring your green. Run your own roast.",      icon:"flame",  pricing:"$75/hr · book a slot" },
    { id:"coroast", label:"Co-roast",      desc:"We pull from your shelf and roast to spec.", icon:"coffee", pricing:"$3.50/lb · job request" },
    { id:"sample",  label:"Sample roast",  desc:"Tiny batch on the sample roaster.",          icon:"bolt",   pricing:"$35/hr · book a slot" },
    { id:"coach",   label:"1:1 with Joel", desc:"Walk through the curve and the cup.",         icon:"user",   pricing:"$90/hr · book a slot" },
    { id:"pack",    label:"Packaging",     desc:"Bag, tin-tie, label, stage for pickup.",     icon:"box",    pricing:"$1.40/bag · job request" },
  ];
  return (
    <Step n={1} title="What do you need?">
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",gap:10}}>
        {items.map(m=>{
          const on=serviceId===m.id;
          return (
            <button key={m.id} onClick={()=>setServiceId(m.id)} style={{padding:14,border:on?"1.5px solid var(--brand)":"1px solid var(--hairline)",borderRadius:"var(--r-md)",background:on?"var(--brand-soft)":"var(--surface)",color:"var(--ink)",textAlign:"left",cursor:"pointer",fontFamily:"var(--font-sans)",display:"flex",flexDirection:"column",gap:7}}>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <span style={{width:30,height:30,borderRadius:"var(--r-md)",background:on?"var(--surface)":"var(--surface-sunken)",display:"inline-flex",alignItems:"center",justifyContent:"center",color:SVC_DOT[m.id],flexShrink:0}}><I name={m.icon} size={17} stroke={2}/></span>
                <span style={{...disp,fontSize:15,color:"var(--ink)",lineHeight:1.05}}>{m.label}</span>
              </div>
              <div style={{fontSize:12,color:"var(--ink-muted)",lineHeight:1.4}}>{m.desc}</div>
              <div style={{...over,fontSize:10,color:"var(--ink-subtle)",marginTop:2}}>{m.pricing}</div>
            </button>
          );
        })}
      </div>
    </Step>
  );
};

Object.assign(window, { JobRequestFlow, ServicePicker });
