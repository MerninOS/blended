// Roaster Portal — Confirm modal + remaining views (My Bookings, My Shelf, Invoices)

const ConfirmModal = ({ payload, onClose, onConfirm }) => {
  if (!payload) return null;
  const { serviceId, resourceId, day, dayLabel, sel, svc } = payload;
  const resource = RESOURCES.find(r=>r.id===resourceId);
  const [lot, setLot] = React.useState("");
  const [lbs, setLbs] = React.useState(serviceId==="coroast" ? 100 : 0);
  const [profile, setProfile] = React.useState("Med, Full City");
  const [notes, setNotes] = React.useState("");
  const dur = sel.end - sel.start;
  const cost = serviceId==="coroast" ? svc.rate*lbs : svc.rate*dur;

  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(28,15,5,.5)",zIndex:60}}/>
      <div style={{position:"fixed",inset:0,zIndex:61,display:"flex",alignItems:"center",justifyContent:"center",padding:20,pointerEvents:"none"}}>
        <div style={{pointerEvents:"auto",width:"min(560px,100%)",maxHeight:"90vh",overflowY:"auto",background:"var(--color-cream)",border:"4px solid var(--color-espresso)",borderRadius:18,boxShadow:"8px 8px 0 var(--color-espresso)"}}>
          <div style={{padding:"18px 22px",background:`var(--color-${svc.color})`,color:svc.color==="tomato"?"var(--color-cream)":"var(--color-espresso)",borderBottom:"3px solid var(--color-espresso)"}}>
            <div style={{fontSize:10.5,fontWeight:900,letterSpacing:".14em",textTransform:"uppercase",opacity:.85}}>Confirm Booking</div>
            <div style={{fontFamily:"var(--font-display)",fontSize:30,textTransform:"uppercase",lineHeight:1.2,marginTop:5}}>{svc.label} · {resource.name}</div>
            <div style={{fontSize:12,fontWeight:700,marginTop:6}}>{dayLabel} · {fmtTime(sel.start)} – {fmtTime(sel.end)} · {dur} hr</div>
          </div>
          <div style={{padding:22,display:"flex",flexDirection:"column",gap:13}}>
            {(serviceId==="toll"||serviceId==="coroast"||serviceId==="sample") && <Field label="Green coffee / lot">
              <input value={lot} onChange={e=>setLot(e.target.value)} placeholder="e.g. Ethiopia Yirg G1 — Shelf A-01" style={inp}/>
            </Field>}
            {serviceId==="coroast" && <Field label="Pounds (green)">
              <input type="number" value={lbs} onChange={e=>setLbs(+e.target.value||0)} style={inp}/>
            </Field>}
            {(serviceId==="toll"||serviceId==="coroast") && <Field label="Roast profile">
              <input value={profile} onChange={e=>setProfile(e.target.value)} style={inp}/>
            </Field>}
            <Field label="Notes for the floor"><textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} style={{...inp,resize:"vertical",fontFamily:"var(--font-body)"}}/></Field>

            <div style={{padding:14,background:"var(--color-chalk)",border:"2.5px solid var(--color-espresso)",borderRadius:12,marginTop:4}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:700}}><span>{svc.label} · {dur} hr {serviceId==="coroast"?`× ${lbs} lb`:""}</span><span style={{fontFamily:"var(--font-mono)"}}>${cost.toFixed(2)}</span></div>
              <div style={{borderTop:"1.5px dashed var(--color-fog)",margin:"9px 0"}}/>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontFamily:"var(--font-display)",fontSize:22,textTransform:"uppercase"}}>Estimated total</span>
                <span style={{fontFamily:"var(--font-display)",fontSize:32,color:"var(--color-tomato)"}}>${cost.toFixed(0)}</span>
              </div>
              <div style={{fontSize:10.5,color:"var(--fg2)",marginTop:5}}>Final invoice issued after completion. Cancel free up to 24hr before.</div>
            </div>
          </div>
          <div style={{padding:"14px 22px",borderTop:"2.5px solid var(--color-espresso)",background:"var(--color-chalk)",display:"flex",gap:10,justifyContent:"flex-end"}}>
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
            <Btn variant="primary" onClick={()=>onConfirm()}>Confirm Booking</Btn>
          </div>
        </div>
      </div>
    </>
  );
};
const Field = ({label,children}) => <label style={{display:"flex",flexDirection:"column",gap:5}}><span style={{fontSize:10.5,fontWeight:800,letterSpacing:".11em",textTransform:"uppercase",color:"var(--fg2)"}}>{label}</span>{children}</label>;
const inp = {padding:"9px 11px",border:"2.5px solid var(--color-espresso)",borderRadius:9,background:"var(--color-cream)",fontFamily:"var(--font-body)",fontSize:13,fontWeight:600,outline:"none"};

const MyBookingsView = () => (
  <div style={{padding:"24px 28px",display:"flex",flexDirection:"column",gap:14}}>
    <h1 style={{fontFamily:"var(--font-display)",fontSize:46,textTransform:"uppercase",margin:0}}>My Bookings</h1>
    <Panel title="Upcoming">
      <div style={{display:"flex",flexDirection:"column",gap:9}}>
        {myBookingsAll.map(b=>{
          const r = RESOURCES.find(x=>x.id===b.resource);
          return (
            <div key={b.id} style={{padding:13,border:"2.5px solid var(--color-espresso)",borderRadius:12,background:"var(--color-cream)",boxShadow:"2px 2px 0 var(--color-espresso)",display:"flex",alignItems:"center",gap:14}}>
              <div style={{textAlign:"center",width:60}}>
                <div style={{fontSize:9.5,fontWeight:800,letterSpacing:".1em",textTransform:"uppercase",color:"var(--fg2)"}}>{DOW[WEEK.indexOf(b.day)]}</div>
                <div style={{fontFamily:"var(--font-display)",fontSize:26,lineHeight:1.2}}>{b.day.slice(8)}</div>
              </div>
              <div style={{width:2,height:38,background:"var(--color-espresso)"}}/>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}><TypeChip type={b.type}/><span style={{fontSize:11,color:"var(--fg2)",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em"}}>{r.name}</span></div>
                <div style={{fontWeight:800,fontSize:14}}>{b.lot}</div>
                <div style={{fontSize:11.5,color:"var(--fg2)",marginTop:2}}>{fmtTime(b.start)}–{fmtTime(b.end)} · {b.lbs} lb · {b.profile}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"var(--font-display)",fontSize:22,color:"var(--color-tomato)"}}>${b.total}</div>
                <Pill variant={b.paid?"matcha":"sun"}>{b.paid?"Paid":"Bills after"}</Pill>
              </div>
              <Btn size="sm" variant="outline">Manage</Btn>
            </div>
          );
        })}
      </div>
    </Panel>
  </div>
);

const MyShelfView = () => (
  <div style={{padding:"24px 28px",display:"flex",flexDirection:"column",gap:14}}>
    <h1 style={{fontFamily:"var(--font-display)",fontSize:46,textTransform:"uppercase",margin:0}}>My Shelf</h1>
    <div style={{fontSize:13,color:"var(--fg2)",fontWeight:600,maxWidth:540}}>You rent shelf space at {FACILITY.name}. Fit whatever you can — we charge by the shelf, not the pound.</div>
    <Panel title="Active Rentals">
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
        {myShelves.map(s=>(
          <div key={s.id} style={{padding:14,border:"3px solid var(--color-espresso)",borderRadius:14,background:"var(--color-chalk)",boxShadow:"3px 3px 0 var(--color-espresso)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontFamily:"var(--font-mono)",fontWeight:800,fontSize:13,padding:"3px 9px",background:"var(--color-espresso)",color:"var(--color-cream)",borderRadius:6}}>Shelf {s.row}-{s.num}</span>
              <Pill variant={s.size==="Full"?"sun":"sky"}>{s.size}</Pill>
            </div>
            <div style={{fontFamily:"var(--font-display)",fontSize:30,color:"var(--color-tomato)",lineHeight:1.2,marginTop:14}}>${s.rate}<span style={{fontSize:14,color:"var(--fg2)"}}>/mo</span></div>
            <div style={{fontSize:11,color:"var(--fg2)",fontWeight:700,marginTop:5}}>Renting since {s.since}</div>
            <div style={{display:"flex",gap:7,marginTop:10}}>
              <Btn size="sm" variant="outline">Schedule pickup</Btn>
              <Btn size="sm" variant="ghost" style={{color:"var(--color-tomato)"}}>End rental</Btn>
            </div>
          </div>
        ))}
      </div>
    </Panel>
    <Panel title="Need More Space?"><div style={{padding:"6px 2px",fontSize:13,fontWeight:700}}>Open shelves available: <b>2</b>. <a href="#" style={{color:"var(--color-tomato)",fontWeight:800}}>Request a shelf →</a></div></Panel>
  </div>
);

const MyInvoicesView = () => (
  <div style={{padding:"24px 28px",display:"flex",flexDirection:"column",gap:14}}>
    <h1 style={{fontFamily:"var(--font-display)",fontSize:46,textTransform:"uppercase",margin:0}}>Invoices</h1>
    <Panel title="My Invoices">
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
        <thead><tr style={{borderBottom:"2px solid var(--color-espresso)"}}>{["Invoice","Issued","Due","Amount",""].map((h,i)=><th key={i} style={{textAlign:i===3?"right":"left",padding:"8px 10px",fontSize:10,letterSpacing:".11em",textTransform:"uppercase",color:"var(--fg2)",fontWeight:800}}>{h}</th>)}</tr></thead>
        <tbody>{myInvoices.map(inv=>(
          <tr key={inv.id} style={{borderBottom:"1px dashed var(--color-fog)"}}>
            <td style={{padding:"10px",fontFamily:"var(--font-mono)",fontWeight:800}}>{inv.id}</td>
            <td style={{padding:"10px",color:"var(--fg2)"}}>{inv.issued.slice(5)}</td>
            <td style={{padding:"10px"}}>{inv.status==="paid"?<span style={{color:"var(--color-matcha)",fontWeight:800}}>Paid</span>:<span style={{color:"var(--color-honey)",fontWeight:800}}>in {inv.days}d</span>}</td>
            <td style={{padding:"10px",textAlign:"right",fontFamily:"var(--font-mono)",fontWeight:800,fontSize:14}}>${inv.amount.toLocaleString()}</td>
            <td style={{padding:"10px",textAlign:"right"}}>{inv.status==="paid"?<Pill variant="matcha">Paid</Pill>:<Btn size="sm" variant="primary">Pay now</Btn>}</td>
          </tr>
        ))}</tbody>
      </table>
    </Panel>
  </div>
);

Object.assign(window, { ConfirmModal, MyBookingsView, MyShelfView, MyInvoicesView });
