// Roaster Portal × CoffeeOS — Confirm modal + My Bookings / My Shelf / Invoices.
// Worksheet layout. Handles BOTH confirm shapes: timed booking + job request.

const ConfirmModal = ({ payload, onClose, onConfirm }) => {
  if (!payload) return null;
  const isJob = payload.kind === "job";
  const isPL = payload.kind === "pl";
  const svcDot = isPL ? plRampColor(payload.effRoast) : (SVC_DOT[payload.serviceId] || "var(--ink-subtle)");

  // timed-booking local form state (hooks must run unconditionally)
  const [lot, setLot] = React.useState("");
  const [lbs, setLbs] = React.useState(payload.serviceId==="coroast" ? 100 : 0);
  const [profile, setProfile] = React.useState("Med, Full City");
  const [notes, setNotes] = React.useState("");

  // checkout state (private label)
  const [ship, setShip] = React.useState({company:(customerById(ME)||{}).name||"",contact:"Dana Reyes",line1:"1140 Foundry St",line2:"Unit 4",city:"Portland",state:"OR",zip:"97214",phone:"(503) 555-0142"});
  const setS = (k)=>(e)=>setShip(s=>({...s,[k]:e.target.value}));
  const [payMethod, setPayMethod] = React.useState("terms");
  const [card, setCard] = React.useState({num:"",exp:"",cvc:"",zip:""});
  const setC = (k)=>(e)=>setCard(c=>({...c,[k]:e.target.value}));

  let title, sub, body, summary;

  if (isPL) {
    const p = payload, q = p.q;
    title = p.productName;
    sub = <span style={mono}>{p.lbs} lb · {plRoastName(p.effRoast)} · need by {p.needBy}</span>;
    body = (
      <>
        <Row k="Coffee" v={p.isBlend ? p.sel.map(s=>`${plGreen(s.id).name} ${s.pct}%`).join(" · ") : p.productName}/>
        <Row k="Packaging" v={`${q.bags} × ${q.bag.label} · ${q.pack.title}`}/>
        {p.art && <Row k="Artwork" v={`${p.art} · ${p.labelSize}`}/>}
        {q.pack.id==="own" && <Row k="Your bags" v={`${p.ownBags} arriving ${p.ownEta}`}/>}

        <CheckoutHead label="Shipping address"/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:12}}>
          <div style={{gridColumn:"1 / -1"}}><Field label="Company"><input value={ship.company} onChange={setS("company")} style={inp}/></Field></div>
          <Field label="Contact name"><input value={ship.contact} onChange={setS("contact")} style={inp}/></Field>
          <Field label="Phone"><input value={ship.phone} onChange={setS("phone")} style={{...inp,...mono}}/></Field>
          <div style={{gridColumn:"1 / -1"}}><Field label="Street address"><input value={ship.line1} onChange={setS("line1")} style={inp}/></Field></div>
          <div style={{gridColumn:"1 / -1"}}><Field label="Suite, unit (optional)"><input value={ship.line2} onChange={setS("line2")} style={inp}/></Field></div>
          <Field label="City"><input value={ship.city} onChange={setS("city")} style={inp}/></Field>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Field label="State"><input value={ship.state} onChange={setS("state")} style={{...inp,...mono}}/></Field>
            <Field label="ZIP"><input value={ship.zip} onChange={setS("zip")} style={{...inp,...mono}}/></Field>
          </div>
        </div>

        <CheckoutHead label="Payment"/>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[{id:"terms",title:"Invoice on account",sub:"Net 30 · billed after the run ships"},{id:"card",title:"Credit card",sub:"Charged when the run is released to the roaster"}].map(m=>{
            const on = payMethod===m.id;
            return (
              <label key={m.id} style={{display:"flex",alignItems:"flex-start",gap:11,padding:"12px 14px",cursor:"pointer",borderRadius:"var(--r-md)",border:on?"1.5px solid var(--brand)":"1px solid var(--hairline)",background:on?"var(--brand-soft)":"var(--surface)"}}>
                <input type="radio" name="pl-pay" checked={on} onChange={()=>setPayMethod(m.id)} style={{marginTop:2,accentColor:"var(--brand)"}}/>
                <span style={{minWidth:0}}>
                  <span style={{display:"block",fontFamily:"var(--font-sans)",fontSize:13.5,fontWeight:600,color:"var(--ink)"}}>{m.title}</span>
                  <span style={{display:"block",...mono,fontSize:11.5,color:"var(--ink-muted)",marginTop:3}}>{m.sub}</span>
                </span>
              </label>
            );
          })}
        </div>
        {payMethod==="card" && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:12}}>
            <div style={{gridColumn:"1 / -1"}}><Field label="Card number"><input value={card.num} onChange={setC("num")} placeholder="0000 0000 0000 0000" inputMode="numeric" style={{...inp,...mono}}/></Field></div>
            <Field label="Expiry"><input value={card.exp} onChange={setC("exp")} placeholder="MM / YY" style={{...inp,...mono}}/></Field>
            <Field label="CVC"><input value={card.cvc} onChange={setC("cvc")} placeholder="123" style={{...inp,...mono}}/></Field>
            <Field label="Billing ZIP"><input value={card.zip} onChange={setC("zip")} placeholder="97214" style={{...inp,...mono}}/></Field>
          </div>
        )}
        <Field label="Purchase order / reference"><input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Optional — prints on the invoice" style={inp}/></Field>
      </>
    );
    summary = (
      <>
        <SumRow k={`${p.lbs} lb × ${plMoney(p.pricePerLb)}/lb`} v={q.coffee}/>
        {q.material>0 && <SumRow k={`${q.bags} bags · material`} v={q.material}/>}
        {q.perBag>0 && <SumRow k={q.pack.id==="label"?"Label application":"Bag handling"} v={q.perBag}/>}
        {q.setup>0 && <SumRow k="Plate setup" v={q.setup}/>}
        <SumRow k="Fill, seal, date-stamp" v={q.fill}/>
        <TotalRow value={q.total}/>
        <div style={{fontSize:11,color:"var(--ink-subtle)",marginTop:8,fontFamily:"var(--font-sans)"}}>Billed on your account terms after the run ships. {q.pack.id==="label" ? "A printed proof comes back before we run the labels." : "Green price is locked for 60 days."}</div>
      </>
    );
  } else if (isJob) {
    const p = payload.payload;
    title = `Request ${p.label}`;
    sub = <>Need by <span style={mono}>{p.needByLabel}</span> · {p.tier.label}</>;
    body = (
      <>
        <Row k="Quantity" v={`${p.qty} ${p.unit}${p.qty===1?"":"s"}`}/>
        {p.source && <Row k="Source" v={p.source.lot || `Shelf ${p.source.row}-${p.source.num}`}/>}
        {payload.serviceId==="coroast" && <Row k="Roast spec" v={p.profile}/>}
        {payload.serviceId==="pack" && <Row k="Bag spec" v={p.bagSize}/>}
        {p.notes && <Row k="Notes" v={p.notes}/>}
      </>
    );
    summary = (
      <>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"var(--ink-muted)",fontFamily:"var(--font-sans)"}}><span>{p.qty} {p.unit} × ${p.ratePerLb.toFixed(2)}</span><span style={mono}>${p.subtotal.toFixed(0)}</span></div>
        {p.rush>0 && <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"var(--brand)",fontFamily:"var(--font-sans)",marginTop:6}}><span>+{Math.round(p.tier.pct*100)}% rush</span><span style={mono}>${p.rush.toFixed(0)}</span></div>}
        <TotalRow value={p.total}/>
      </>
    );
  } else {
    const { serviceId, resourceId, dayLabel, sel, svc } = payload;
    const resource = RESOURCES.find(r=>r.id===resourceId);
    const durH = sel.end - sel.start;
    const cost = serviceId==="coroast" ? svc.rate*lbs : svc.rate*durH;
    title = `${svc.label} · ${resource.name}`;
    sub = <span style={mono}>{dayLabel} · {fmtTime(sel.start)} – {fmtTime(sel.end)} · {durH} hr</span>;
    body = (
      <>
        {(serviceId==="toll"||serviceId==="coroast"||serviceId==="sample") && <Field label="Green coffee / lot"><input value={lot} onChange={e=>setLot(e.target.value)} placeholder="e.g. Ethiopia Yirg G1 — Shelf A-01" style={inp}/></Field>}
        {serviceId==="coroast" && <Field label="Pounds (green)"><input type="number" value={lbs} onChange={e=>setLbs(+e.target.value||0)} style={inp}/></Field>}
        {(serviceId==="toll"||serviceId==="coroast") && <Field label="Roast profile"><input value={profile} onChange={e=>setProfile(e.target.value)} style={inp}/></Field>}
        <Field label="Notes for the floor"><textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} style={{...inp,resize:"vertical",fontFamily:"var(--font-sans)"}}/></Field>
      </>
    );
    summary = (
      <>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"var(--ink-muted)",fontFamily:"var(--font-sans)"}}><span>{svc.label} · {durH} hr {serviceId==="coroast"?`× ${lbs} lb`:""}</span><span style={mono}>${cost.toFixed(2)}</span></div>
        <TotalRow value={cost}/>
        <div style={{fontSize:11,color:"var(--ink-subtle)",marginTop:8,fontFamily:"var(--font-sans)"}}>Final invoice issued after completion. Cancel free up to 24hr before.</div>
      </>
    );
  }

  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(36,24,18,.45)",zIndex:900,animation:"co-fade .15s ease-out"}}/>
      <div style={{position:"fixed",inset:0,zIndex:901,display:"flex",alignItems:"center",justifyContent:"center",padding:20,pointerEvents:"none"}}>
        <div style={{pointerEvents:"auto",width:isPL?"min(640px,100%)":"min(540px,100%)",maxHeight:"90vh",overflowY:"auto",background:"var(--surface)",border:"1px solid var(--hairline)",borderRadius:"var(--r-lg)",boxShadow:"var(--shadow-modal)"}}>
          <div className="co-modal-head" style={{padding:"18px 22px",borderBottom:"1px solid var(--hairline)",display:"flex",alignItems:"center",gap:13}}>
            <div style={{width:40,height:40,borderRadius:"var(--r-md)",background:"var(--surface-sunken)",display:"flex",alignItems:"center",justifyContent:"center",color:svcDot,flexShrink:0}}><I name={isPL?(payload.isBlend?"flame":"pkg"):isJob?payload.payload.icon:payload.svc.icon} size={19} stroke={2}/></div>
            <div style={{minWidth:0}}>
              <div style={{...over,fontSize:9.5,color:"var(--ink-subtle)"}}>{isPL?"Confirm private label order":isJob?"Confirm request":"Confirm booking"}</div>
              <div style={{...disp,fontSize:22,color:"var(--ink)",lineHeight:1.1,marginTop:3}}>{title}</div>
              <div style={{fontSize:12,color:"var(--ink-muted)",marginTop:5,fontFamily:"var(--font-sans)"}}>{sub}</div>
            </div>
          </div>
          <div className="co-modal-body" style={{padding:22,display:"flex",flexDirection:"column",gap:13}}>
            {body}
            <div style={{padding:14,background:"var(--surface-sunken)",border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",marginTop:4}}>{summary}</div>
          </div>
          <div className="co-modal-foot" style={{padding:"14px 22px",borderTop:"1px solid var(--hairline)",display:"flex",gap:10,justifyContent:"flex-end"}}>
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
            <Btn variant="primary" onClick={onConfirm}>{isPL?"Place order":isJob?"Submit request":"Confirm booking"}</Btn>
          </div>
        </div>
      </div>
    </>
  );
};
const CheckoutHead = ({label}) => (
  <div style={{display:"flex",alignItems:"center",gap:12,marginTop:8}}>
    <span style={{...over,fontSize:10,color:"var(--ink-muted)",whiteSpace:"nowrap"}}>{label}</span>
    <span style={{flex:1,height:1,background:"var(--hairline)"}}/>
  </div>
);
const Row = ({k,v}) => <div style={{display:"flex",justifyContent:"space-between",gap:16,padding:"9px 0",borderBottom:"1px solid var(--hairline)"}}><span style={{fontSize:13,color:"var(--ink-muted)",fontFamily:"var(--font-sans)"}}>{k}</span><span style={{...mono,fontSize:13,color:"var(--ink)",textAlign:"right"}}>{v}</span></div>;
const SumRow = ({k,v}) => <div style={{display:"flex",justifyContent:"space-between",gap:16,fontSize:13,color:"var(--ink-muted)",fontFamily:"var(--font-sans)",marginBottom:6}}><span>{k}</span><span style={mono}>{plMoney(v)}</span></div>;
const TotalRow = ({value}) => (
  <><div style={{borderTop:"1px solid var(--hairline)",margin:"10px 0"}}/>
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{...over,fontSize:11,color:"var(--ink-muted)"}}>Estimated total</span><span style={{...disp,fontSize:28,color:"var(--ink)"}}>${value.toFixed(0)}</span></div></>
);

// ---- My Bookings ----
const MyBookingsView = ({ plOrders }) => (
  <div className="pv-page" style={{maxWidth:"var(--content-max)",margin:"0 auto",padding:"24px 24px 40px",display:"flex",flexDirection:"column",gap:20}}>
    <h1 style={{...disp,fontSize:"clamp(28px,3vw,40px)",lineHeight:1,margin:0,color:"var(--ink)"}}>My bookings</h1>
    <PrivateLabelOrders extra={plOrders}/>
    <Panel title="Upcoming" noPadding>
      {myBookingsAll.map((b,i)=>{
        const r = RESOURCES.find(x=>x.id===b.resource);
        return (
          <div key={b.id} className="co-rowlist-row" style={{display:"flex",alignItems:"center",gap:16,padding:"13px 16px",borderTop:i?"1px solid var(--hairline)":"none"}}>
            <div style={{textAlign:"center",width:52,flexShrink:0}}>
              <div style={{...over,fontSize:9,color:"var(--ink-subtle)"}}>{DOW[WEEK.indexOf(b.day)]}</div>
              <div style={{...mono,fontSize:22,color:"var(--ink)",lineHeight:1.1}}>{b.day.slice(8)}</div>
            </div>
            <div className="co-vrule" style={{width:1,alignSelf:"stretch",background:"var(--hairline)"}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><TypeChip type={b.type}/><span style={{...over,fontSize:9.5,color:"var(--ink-subtle)"}}>{r.name}</span></div>
              <div style={{display:"flex",alignItems:"center",gap:9}}><RoastDot profile={b.profile} showLevel={false} size={9}/><span style={{fontFamily:"var(--font-sans)",fontWeight:600,fontSize:14,color:"var(--ink)"}}>{b.lot}</span></div>
              <div style={{...mono,fontSize:11.5,color:"var(--ink-muted)",marginTop:3}}>{fmtTime(b.start)}–{fmtTime(b.end)} · {b.lbs} lb · {b.profile}</div>
            </div>
            <div className="co-rowlist-end" style={{textAlign:"right",flexShrink:0}}>
              <div style={{...disp,fontSize:20,color:"var(--ink)"}}>${b.total}</div>
              <Pill variant={b.paid?"matcha":"sun"} dot>{b.paid?"Paid":"Bills after"}</Pill>
            </div>
            <Btn size="sm" variant="outline">Manage</Btn>
          </div>
        );
      })}
    </Panel>
  </div>
);

// ---- My Shelf ----
const MyShelfView = () => (
  <div className="pv-page" style={{maxWidth:"var(--content-max)",margin:"0 auto",padding:"24px 24px 40px",display:"flex",flexDirection:"column",gap:20}}>
    <div>
      <h1 style={{...disp,fontSize:"clamp(28px,3vw,40px)",lineHeight:1,margin:0,color:"var(--ink)"}}>My shelf</h1>
      <p className="pv-lede" style={{fontFamily:"var(--font-sans)",fontSize:14,color:"var(--ink-muted)",marginTop:8,maxWidth:560}}>You rent shelf space at {FACILITY.name}. Fit whatever you can — we charge by the shelf, not the pound.</p>
    </div>
    <div>
      <div style={{...over,fontSize:11,color:"var(--ink-muted)",marginBottom:10}}>Active rentals</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
        {myShelves.map(s=>(
          <div key={s.id} style={{padding:16,border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",background:"var(--surface)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{...mono,fontSize:12,padding:"3px 9px",background:"var(--ink)",color:"var(--on-ink)",borderRadius:"var(--r-sm)"}}>Shelf {s.row}-{s.num}</span>
              <Pill variant={s.size==="Full"?"sun":"sky"}>{s.size}</Pill>
            </div>
            <div style={{...disp,fontSize:30,color:"var(--ink)",lineHeight:1.1,marginTop:14}}>${s.rate}<span style={{fontSize:13,color:"var(--ink-subtle)",fontWeight:400}}>/mo</span></div>
            <div style={{...mono,fontSize:11,color:"var(--ink-muted)",marginTop:5}}>Renting since {s.since}</div>
            <div style={{display:"flex",gap:7,marginTop:12}}>
              <Btn size="sm" variant="outline">Schedule pickup</Btn>
              <Btn size="sm" variant="ghost" style={{color:"var(--danger)"}}>End rental</Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
    <Panel title="Need more space?"><div style={{fontSize:13.5,color:"var(--ink)",fontFamily:"var(--font-sans)"}}>Open shelves available: <b>2</b>. <a href="#" style={{color:"var(--brand)",fontWeight:600}}>Request a shelf →</a></div></Panel>
  </div>
);

// ---- Invoices ----
const MyInvoicesView = () => (
  <div className="pv-page" style={{maxWidth:"var(--content-max)",margin:"0 auto",padding:"24px 24px 40px",display:"flex",flexDirection:"column",gap:20}}>
    <h1 style={{...disp,fontSize:"clamp(28px,3vw,40px)",lineHeight:1,margin:0,color:"var(--ink)"}}>Invoices</h1>
    <div className="co-tablewrap" style={{border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",overflow:"hidden",background:"var(--surface)"}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{background:"var(--surface-sunken)",borderBottom:"1px solid var(--hairline)"}}>{["Invoice","Issued","Due","Amount",""].map((h,i)=><th key={i} style={{textAlign:i===3?"right":"left",padding:"9px 14px",...over,fontSize:10,color:"var(--ink-muted)"}}>{h}</th>)}</tr></thead>
        <tbody>{myInvoices.map((inv,i)=>(
          <tr key={inv.id} style={{borderTop:i?"1px solid var(--hairline)":"none"}}>
            <td style={{padding:"11px 14px",...mono,fontSize:13,color:"var(--ink)"}}>{inv.id}</td>
            <td style={{padding:"11px 14px",...mono,fontSize:12.5,color:"var(--ink-muted)"}}>{inv.issued.slice(5)}</td>
            <td style={{padding:"11px 14px"}}>{inv.status==="paid"?<span style={{...mono,fontSize:12.5,color:"var(--success)"}}>Paid</span>:<span style={{...mono,fontSize:12.5,color:"var(--warning)"}}>in {inv.days}d</span>}</td>
            <td style={{padding:"11px 14px",textAlign:"right",...mono,fontSize:13.5,color:"var(--ink)"}}>${inv.amount.toLocaleString()}</td>
            <td style={{padding:"11px 14px",textAlign:"right"}}>{inv.status==="paid"?<Pill variant="matcha">Paid</Pill>:<Btn size="sm" variant="primary">Pay now</Btn>}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  </div>
);

Object.assign(window, { ConfirmModal, SumRow, MyBookingsView, MyShelfView, MyInvoicesView });
