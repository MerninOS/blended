// CoRoasted — Customers, Storage, Services, Payments

const CustomersView = ({ openCustomer }) => {
  const [filter, setFilter] = React.useState("all");
  const filtered = CUSTOMERS.filter(c => filter==="all" ? true : filter==="overdue" ? c.status==="overdue" : c.tier.toLowerCase()===filter);

  return (
    <div style={{padding:"16px 24px 32px",display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        <Stat label="Active Roasters" value={CUSTOMERS.length}/>
        <Stat label="Lbs Roasted · MTD" value={CUSTOMERS.reduce((s,c)=>s+c.lbsThisMonth,0).toLocaleString()}/>
        <Stat label="Outstanding A/R" value={"$"+CUSTOMERS.reduce((s,c)=>s+c.owed,0).toLocaleString()}/>
        <Stat label="New This Month" value={CUSTOMERS.filter(c=>c.tier==="New").length}/>
      </div>

      <Panel title="Roasters" actions={
        <div style={{display:"flex",gap:6}}>
          {[["all","All"],["pro","Pro"],["standard","Standard"],["new","New"],["overdue","Overdue"]].map(([k,l])=>(
            <button key={k} onClick={()=>setFilter(k)} style={{
              padding:"5px 11px",borderRadius:11999,border:"1px solid var(--color-border)",
              background:filter===k?"var(--color-espresso)":"var(--color-cream)",
              color:filter===k?"var(--color-cream)":"var(--color-espresso)",
              fontWeight:800,fontSize:10.5,letterSpacing:".09em",cursor:"pointer",
            }}>{l}</button>
          ))}
        </div>
      }>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{borderBottom:"1px solid var(--color-border)"}}>
            {["Roaster","Tier","Since","Lbs · MTD","Owed","Status",""].map((h,i)=>(
              <th key={i} style={{textAlign: i>=3&&i<=4 ? "right" : "left", padding:"8px 10px", fontSize:10, letterSpacing:".11em",  color:"var(--fg2)", fontWeight:800}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map(c=>(
              <tr key={c.id} style={{borderBottom:"1px dashed var(--color-fog)",cursor:"pointer"}} onClick={()=>openCustomer&&openCustomer(c)}>
                <td style={{padding:"10px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <Avatar customer={c.id} size={32}/>
                    <div>
                      <div style={{fontWeight:800,fontSize:13}}>{c.name}</div>
                      <div style={{fontSize:11,color:"var(--fg2)"}}>{c.contact}</div>
                    </div>
                  </div>
                </td>
                <td style={{padding:"10px"}}>
                  <Pill variant={c.tier==="Pro"?"tomato":c.tier==="New"?"sun":"fog"}>{c.tier}</Pill>
                </td>
                <td style={{padding:"10px",fontSize:12,color:"var(--fg2)"}}>{c.since}</td>
                <td style={{padding:"10px",textAlign:"right",fontFamily:"var(--font-mono)",fontWeight:700}}>{c.lbsThisMonth} lb</td>
                <td style={{padding:"10px",textAlign:"right",fontFamily:"var(--font-mono)",fontWeight:800,color:c.owed>0?"var(--color-tomato)":"var(--fg2)"}}>${c.owed.toLocaleString()}</td>
                <td style={{padding:"10px"}}>
                  {c.status==="overdue" ? <Pill variant="tomato">Overdue</Pill> : c.status==="new" ? <Pill variant="sun">New</Pill> : <Pill variant="matcha">Good</Pill>}
                </td>
                <td style={{padding:"10px",textAlign:"right",color:"var(--fg2)"}}><I2 name="chevR" size={16}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
};

const StorageView = () => {
  const active = SHELVES.filter(s=>s.customer);
  const open = SHELVES.filter(s=>!s.customer);
  const overdue = SHELVES.filter(s=>s.status==="overdue");
  const monthlyRev = active.reduce((s,sh)=>s+sh.rate,0);

  // Group shelves by row for the map
  const rows = [...new Set(SHELVES.map(s=>s.row))].sort();

  return (
    <div style={{padding:"16px 24px 32px",display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        <Stat label="Shelves Rented" value={`${active.length}/${SHELVES.length}`}/>
        <Stat label="Open Shelves" value={open.length}/>
        <Stat label="Storage Revenue · MTD" value={"$"+monthlyRev.toLocaleString()}/>
        <Stat label="Past Due Rentals" value={overdue.length}/>
      </div>

      <Panel title="Shelf Map" actions={<div style={{display:"flex",gap:10,fontSize:11,fontWeight:700}}>
        <span style={{display:"inline-flex",alignItems:"center",gap:5}}><span style={{width:12,height:12,background:"var(--color-matcha)",border:"1px solid var(--color-border)",borderRadius:3}}/>Active</span>
        <span style={{display:"inline-flex",alignItems:"center",gap:5}}><span style={{width:12,height:12,background:"var(--color-tomato)",border:"1px solid var(--color-border)",borderRadius:3}}/>Past due</span>
        <span style={{display:"inline-flex",alignItems:"center",gap:5}}><span style={{width:12,height:12,background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:3}}/>Open</span>
      </div>}>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {rows.map(r=>(
            <div key={r} style={{display:"flex",alignItems:"stretch",gap:10}}>
              <div style={{width:54,display:"flex",alignItems:"center",justifyContent:"center",background:"var(--color-rail)",color:"var(--color-cream)",border:"1px solid var(--color-border)",borderRadius:12,fontFamily:"var(--font-display)",fontSize:30,lineHeight:1}}>{r}</div>
              <div style={{flex:1,display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))",gap:8}}>
                {SHELVES.filter(s=>s.row===r).map(s=>{
                  const c = s.customer ? customerById(s.customer) : null;
                  const bg = s.status==="overdue" ? "#FBE4D8" : s.status==="open" ? "var(--color-cream)" : "var(--color-chalk)";
                  return (
                    <div key={s.id} style={{padding:10,border:"1px solid var(--color-border)",borderRadius:12,background:bg,boxShadow:"var(--shadow-sm)",display:"flex",flexDirection:"column",gap:6,minHeight:88}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <span style={{fontFamily:"var(--font-mono)",fontWeight:800,fontSize:11,padding:"2px 6px",background:"var(--color-rail)",color:"var(--color-cream)",borderRadius:5}}>{s.row}-{s.num}</span>
                        <Pill variant={s.size==="Full"?"sun":"sky"} style={{fontSize:9,padding:"1px 7px"}}>{s.size}</Pill>
                      </div>
                      {c ? <>
                        <div style={{display:"flex",alignItems:"center",gap:7}}>
                          <Avatar customer={s.customer} size={22}/>
                          <div style={{fontSize:11.5,fontWeight:800,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                        </div>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:10,fontWeight:700,color:"var(--fg2)",letterSpacing:".05em",marginTop:"auto"}}>
                          <span>${s.rate}/mo</span>
                          {s.status==="overdue" ? <span style={{color:"var(--color-tomato)",fontWeight:800}}>Past Due</span> : <span>Since {s.since.slice(0,7)}</span>}
                        </div>
                      </> : <>
                        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,letterSpacing:".1em",color:"var(--fg2)"}}>Open</div>
                        <Btn size="sm" variant="primary" style={{width:"100%",justifyContent:"center"}}>Assign</Btn>
                      </>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Active Rentals">
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{borderBottom:"1px solid var(--color-border)"}}>
            {["Shelf","Roaster","Size","Renting Since","Rate","Status",""].map((h,i)=>(
              <th key={i} style={{textAlign:i===4?"right":"left",padding:"8px 10px",fontSize:10,letterSpacing:".11em",color:"var(--fg2)",fontWeight:800}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {active.map(s=>{
              const c = customerById(s.customer);
              return (
                <tr key={s.id} style={{borderBottom:"1px dashed var(--color-fog)"}}>
                  <td style={{padding:"9px 10px"}}><span style={{fontFamily:"var(--font-mono)",fontWeight:800,fontSize:12,padding:"3px 8px",background:"var(--color-rail)",color:"var(--color-cream)",borderRadius:5}}>{s.row}-{s.num}</span></td>
                  <td style={{padding:"9px 10px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:9}}>
                      <Avatar customer={s.customer} size={26}/>
                      <span style={{fontWeight:700}}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{padding:"9px 10px"}}><Pill variant={s.size==="Full"?"sun":"sky"}>{s.size}</Pill></td>
                  <td style={{padding:"9px 10px",color:"var(--fg2)",fontSize:12}}>{s.since}</td>
                  <td style={{padding:"9px 10px",textAlign:"right",fontFamily:"var(--font-mono)",fontWeight:800}}>${s.rate}/mo</td>
                  <td style={{padding:"9px 10px"}}>
                    {s.status==="overdue" ? <Pill variant="tomato">Past due</Pill> : <Pill variant="matcha">Active</Pill>}
                  </td>
                  <td style={{padding:"9px 10px",textAlign:"right"}}>
                    {s.status==="overdue" ? <Btn size="sm" variant="primary">Charge</Btn> : <Btn size="sm" variant="outline">Manage</Btn>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
    </div>
  );
};

const ServicesView = ({ tweaks, setTweak }) => (
  <div style={{padding:"16px 24px 32px",display:"flex",flexDirection:"column",gap:14}}>
    <Panel title="What We Offer" actions={<Btn size="sm" variant="primary" icon={<I name="plus" size={14}/>}>Add Service</Btn>}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(310px, 1fr))",gap:12}}>
        {SERVICES.map(s=>(
          <div key={s.id} style={{padding:14,border:"1px solid var(--color-border)",borderRadius:16,background:"var(--color-surface)",boxShadow:"var(--shadow-sm)",display:"flex",flexDirection:"column",gap:8}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
              <div style={{fontFamily:"var(--font-display)",fontSize:22,lineHeight:1}}>{s.label}</div>
              <Pill variant={s.enabled?"matcha":"fog"}>{s.enabled?"Active":"Off"}</Pill>
            </div>
            <div style={{fontSize:12.5,color:"var(--fg2)",lineHeight:1.4}}>{s.desc}</div>
            <div style={{display:"flex",alignItems:"baseline",gap:8,marginTop:4}}>
              <div style={{fontFamily:"var(--font-display)",fontSize:30,color:"var(--color-tomato)",lineHeight:1}}>${s.rate}</div>
              <div style={{fontSize:11,fontWeight:800,letterSpacing:".09em",color:"var(--fg2)"}}>per {s.unit}</div>
            </div>
            <div style={{display:"flex",gap:6,marginTop:6}}>
              <Btn size="sm" variant="outline" icon={<I2 name="edit" size={12}/>}>Edit</Btn>
              <Btn size="sm" variant="ghost">Pricing rules</Btn>
            </div>
          </div>
        ))}
      </div>
    </Panel>

    <Panel title="Booking Rules">
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        <RuleRow label="Business hours" value={`${FACILITY.hoursStart}:00a – ${FACILITY.hoursEnd-12}:00p`} hint="Roasters can't book outside these."/>
        <RuleRow label="Minimum booking" value={`${tweaks.minBookingMin} min`} hint="Toggle in Tweaks panel."/>
        <RuleRow label="Slot resolution" value={`${FACILITY.slotMin} min`} hint="Half-hour grid."/>
        <RuleRow label="Buffer between roasts" value="15 min" hint="Auto-block on the schedule."/>
        <RuleRow label="Cancellation window" value="24 hr" hint="Inside window = 50% charge."/>
        <RuleRow label="Co-roast lead time" value="48 hr" hint="So we can prep the curve."/>
      </div>
    </Panel>
  </div>
);

const RuleRow = ({label,value,hint}) => (
  <div style={{padding:12,border:"1px solid var(--color-border)",borderRadius:12,background:"var(--color-surface)"}}>
    <div style={{fontSize:10,fontWeight:800,letterSpacing:".11em",color:"var(--fg2)"}}>{label}</div>
    <div style={{fontFamily:"var(--font-display)",fontSize:22,lineHeight:1,marginTop:5}}>{value}</div>
    <div style={{fontSize:11,color:"var(--fg2)",marginTop:4}}>{hint}</div>
  </div>
);

const PaymentsView = () => {
  const open = INVOICES.filter(i=>i.status!=="paid");
  const overdue = INVOICES.filter(i=>i.status==="overdue");
  const paidMtd = INVOICES.filter(i=>i.status==="paid").reduce((s,i)=>s+i.amount,0);
  const openTotal = open.reduce((s,i)=>s+i.amount,0);

  // Sync state per invoice (deterministic from id so it doesn't reshuffle)
  const syncState = (inv) => {
    if (inv.status==="paid") return "paid-stripe";
    const n = parseInt(inv.id.replace(/\D/g,""),10);
    if (inv.status==="overdue") return n%2 ? "qb-unsent" : "qb-synced";
    if (inv.status==="due") return n%3===0 ? "qb-unsent" : "qb-synced";
    return "draft";
  };
  const draftCount = INVOICES.filter(i=>syncState(i)==="draft" || syncState(i)==="qb-unsent").length;

  const grouped = [
    { key:"overdue", label:"Overdue", items: open.filter(i=>i.status==="overdue") },
    { key:"due",     label:"Due This Week", items: open.filter(i=>i.status==="due") },
    { key:"open",    label:"Open", items: open.filter(i=>i.status==="open") },
    { key:"paid",    label:"Recently Paid", items: INVOICES.filter(i=>i.status==="paid") },
  ];

  return (
    <div style={{padding:"16px 24px 32px",display:"flex",flexDirection:"column",gap:14}}>
      <IntegrationsBar draftCount={draftCount}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        <Stat label="Overdue" value={"$"+overdue.reduce((s,i)=>s+i.amount,0).toLocaleString()} delta={overdue.length+" invoices"}/>
        <Stat label="Open A/R" value={"$"+openTotal.toLocaleString()}/>
        <Stat label="Collected · MTD" value={"$"+paidMtd.toLocaleString()} delta="+18% MoM"/>
        <Stat label="Avg Days To Pay" value="11"/>
      </div>

      {grouped.map(g => g.items.length===0 ? null : (
        <Panel key={g.key} title={g.label} actions={
          g.key==="overdue" ? <div style={{display:"flex",gap:8}}>
            <Btn size="sm" variant="outline" icon={<QBLogo size={12}/>}>Sync all to QuickBooks</Btn>
            <Btn size="sm" variant="primary" icon={<StripeLogo size={12}/>}>Charge all via Stripe</Btn>
          </div> :
          g.key==="paid" ? <Btn size="sm" variant="outline" icon={<I2 name="download" size={13}/>}>Export</Btn> : null
        }>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{borderBottom:"1px solid var(--color-border)"}}>
              {["Invoice","Roaster","Issued","Due","Sync","Amount",""].map((h,i)=>(
                <th key={i} style={{textAlign:i>=5&&i<=5?"right":"left",padding:"7px 10px",fontSize:10,letterSpacing:".11em",color:"var(--fg2)",fontWeight:800}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {g.items.map(inv=>{
                const c = customerById(inv.customer);
                const sync = syncState(inv);
                return (
                  <tr key={inv.id} style={{borderBottom:"1px dashed var(--color-fog)"}}>
                    <td style={{padding:"9px 10px",fontFamily:"var(--font-mono)",fontWeight:800}}>{inv.id}</td>
                    <td style={{padding:"9px 10px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:9}}>
                        <Avatar customer={inv.customer} size={26}/>
                        <span style={{fontWeight:700}}>{c.name}</span>
                      </div>
                    </td>
                    <td style={{padding:"9px 10px",color:"var(--fg2)",fontSize:12}}>{inv.issued.slice(5)}</td>
                    <td style={{padding:"9px 10px",fontSize:12}}>
                      {inv.status==="overdue" ? <span style={{color:"var(--color-tomato)",fontWeight:800}}>{inv.days}d late</span> :
                       inv.status==="due"     ? <span style={{color:"var(--color-honey)",fontWeight:800}}>in {inv.days}d</span> :
                       inv.status==="paid"    ? <span style={{color:"var(--color-matcha)",fontWeight:800}}>Paid</span> :
                                                 <span style={{color:"var(--fg2)"}}>in {inv.days}d</span>}
                    </td>
                    <td style={{padding:"9px 10px"}}><SyncChip state={sync}/></td>
                    <td style={{padding:"9px 10px",textAlign:"right",fontFamily:"var(--font-mono)",fontWeight:800,fontSize:14}}>${inv.amount.toLocaleString()}</td>
                    <td style={{padding:"9px 10px",textAlign:"right"}}>
                      {inv.status==="paid" ? <Pill variant="matcha">Paid</Pill> :
                       sync==="qb-unsent" ? <Btn size="sm" variant="primary" icon={<QBLogo size={11}/>}>Send to QuickBooks</Btn> :
                       inv.status==="overdue" ? <Btn size="sm" variant="primary" icon={<StripeLogo size={11}/>}>Charge via Stripe</Btn> :
                       <Btn size="sm" variant="outline">View</Btn>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
      ))}
    </div>
  );
};

Object.assign(window, { CustomersView, StorageView, ServicesView, PaymentsView });

// ─────────── Payments helpers ───────────

const QBLogo = ({size=14}) => (
  <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:size+4,height:size+4,borderRadius:11999,background:"#2CA01C",color:"#fff",fontFamily:"var(--font-display)",fontSize:size-2,fontWeight:900,letterSpacing:"-.03em"}}>qb</span>
);
const StripeLogo = ({size=14}) => (
  <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:size+4,height:size+4,borderRadius:5,background:"#635BFF",color:"#fff",fontFamily:"var(--font-display)",fontSize:size-1,fontWeight:900,letterSpacing:"-.04em"}}>S</span>
);

const SyncChip = ({state}) => {
  const map = {
    "paid-stripe": { label:"Paid via Stripe", logo:<StripeLogo size={11}/>, fg:"var(--color-matcha)" },
    "qb-synced":   { label:"In QuickBooks",   logo:<QBLogo size={11}/>,    fg:"var(--fg)" },
    "qb-unsent":   { label:"Not in QuickBooks", logo:<QBLogo size={11}/>,  fg:"var(--color-tomato)" },
    "draft":       { label:"Draft",           logo:null,                  fg:"var(--fg2)" },
  };
  const m = map[state]||map.draft;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:11,fontWeight:700,color:m.fg}}>
      {m.logo}<span>{m.label}</span>
    </span>
  );
};

const IntegrationsBar = ({draftCount}) => (
  <div style={{padding:"12px 16px",background:"var(--color-rail)",color:"var(--color-cream)",border:"1px solid var(--color-border)",borderRadius:16,boxShadow:"0 8px 24px rgba(184,98,58,0.18), var(--shadow-sm)",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
    <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",flex:1,minWidth:0}}>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",background:"var(--color-surface)",color:"var(--color-espresso)",borderRadius:10,whiteSpace:"nowrap"}}>
        <QBLogo size={14}/>
        <div style={{lineHeight:1.15,whiteSpace:"nowrap"}}>
          <div style={{fontSize:11.5,fontWeight:800,whiteSpace:"nowrap"}}>QuickBooks Online</div>
          <div style={{fontSize:9.5,opacity:.7,letterSpacing:".06em",whiteSpace:"nowrap"}}>Synced 14m ago</div>
        </div>
        <span style={{width:8,height:8,borderRadius:11999,background:"var(--color-matcha)",marginLeft:4,flexShrink:0}}/>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",background:"var(--color-surface)",color:"var(--color-espresso)",borderRadius:10,whiteSpace:"nowrap"}}>
        <StripeLogo size={14}/>
        <div style={{lineHeight:1.15,whiteSpace:"nowrap"}}>
          <div style={{fontSize:11.5,fontWeight:800,whiteSpace:"nowrap"}}>Stripe</div>
          <div style={{fontSize:9.5,opacity:.7,letterSpacing:".06em",whiteSpace:"nowrap"}}>Live · acct_1Q…7sN</div>
        </div>
        <span style={{width:8,height:8,borderRadius:11999,background:"var(--color-matcha)",marginLeft:4,flexShrink:0}}/>
      </div>
    </div>
    {draftCount>0 && (
      <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        <div style={{fontSize:11.5,fontWeight:700,textAlign:"right",lineHeight:1.25,whiteSpace:"nowrap"}}>
          <div style={{whiteSpace:"nowrap"}}><b>{draftCount}</b> invoice{draftCount===1?"":"s"} not in QuickBooks</div>
          <div style={{opacity:.65,fontSize:10,letterSpacing:".06em",whiteSpace:"nowrap"}}>From completed sessions</div>
        </div>
        <button style={{padding:"8px 14px",border:"1px solid var(--color-surface)",background:"var(--color-surface)",color:"var(--color-espresso)",borderRadius:11,fontWeight:800,fontSize:12,fontFamily:"var(--font-body)",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:6,letterSpacing:".02em",whiteSpace:"nowrap"}}>
          <QBLogo size={12}/> Sync all now
        </button>
      </div>
    )}
  </div>
);
