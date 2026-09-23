// CoRoasted × CoffeeOS — Private Label, facility side.
// Worksheet: order queue, proof desk, catalog levers, packaging stock.

const plaPriceOf = (o) => o.kind === "blend" ? plPriceOf(o.sel) : (PL_STOCK.find(s=>s.id===o.skuId)||{price:0}).price;
const plaQuote = (o) => plQuote({ pricePerLb: plaPriceOf(o), lbs:o.lbs, bagId:o.bagId, packId:o.packId, ownBagCount:o.ownReceived||0 });

const plaCell = { padding:"11px 14px", verticalAlign:"middle" };

const Mono = ({ name, size=30 }) => {
  const ini = name.replace(/[^\p{L}\p{N}\s]/gu,"").trim().split(/\s+/).slice(0,2).map(s=>s[0]).join("").toUpperCase() || "—";
  return <span style={{width:size,height:size,flexShrink:0,borderRadius:"var(--r-md)",background:"var(--surface-sunken)",border:"1px solid var(--hairline)",display:"inline-flex",alignItems:"center",justifyContent:"center",...CO.data({fontSize:size*0.38,color:"var(--ink-muted)"})}}>{ini}</span>;
};

const StageChip = ({ stage }) => {
  const m = {
    submitted:{fg:"var(--warning)",bg:"rgba(178,107,0,.10)",dot:"var(--warning)"},
    proof:    {fg:"var(--info)",   bg:"rgba(47,95,168,.10)", dot:"var(--info)"},
    green:    {fg:"var(--ink-muted)",bg:"var(--surface-sunken)",dot:"var(--roast-0)"},
    roasting: {fg:"var(--brand)",  bg:"var(--brand-soft)",   dot:"var(--brand)", pulse:true},
    packing:  {fg:"var(--ink)",    bg:"var(--surface-sunken)",dot:"var(--roast-3)"},
    shipped:  {fg:"var(--success)",bg:"rgba(30,122,74,.10)", dot:"var(--success)"},
  }[stage] || {fg:"var(--ink-muted)",bg:"var(--surface-sunken)",dot:"var(--ink-subtle)"};
  const label = (PLA_STAGES.find(s=>s.id===stage)||{label:stage}).label;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:6,padding:"3px 10px",borderRadius:"var(--r-pill)",background:m.bg,color:m.fg,whiteSpace:"nowrap",...CO.over({fontSize:10,letterSpacing:".05em"})}}>
      <span style={{width:6,height:6,borderRadius:"50%",background:m.dot,flexShrink:0,animation:m.pulse?"co-pulse 1.5s ease-in-out infinite":"none"}}/>{label}
    </span>
  );
};

const FlagChip = ({ flag }) => {
  if (!flag) return <span style={CO.data({fontSize:12,color:"var(--ink-subtle)"})}>—</span>;
  const m = {
    proof: {label:"Proof due",   fg:"var(--info)"},
    green: {label:"Green short", fg:"var(--danger)"},
    bags:  {label:"Bags short",  fg:"var(--danger)"},
  }[flag];
  return <span style={{display:"inline-flex",alignItems:"center",gap:6,color:m.fg,...CO.over({fontSize:10})}}><I2 name="alert" size={13} stroke={2.2}/>{m.label}</span>;
};

const PackGlyph = ({ packId }) => {
  const m = {stock:"Stock bag", label:"Their label", own:"Their bag"}[packId] || packId;
  return <span style={CO.data({fontSize:12,color:"var(--ink-muted)",whiteSpace:"nowrap"})}>{m}</span>;
};

// ---------- orders table ----------
const PLOrdersTable = ({ rows, onOpen }) => (
  <div style={{border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",overflow:"hidden",background:"var(--surface)"}}>
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",minWidth:1180}}>
        <thead>
          <tr style={{background:"var(--surface-sunken)",borderBottom:"1px solid var(--hairline)"}}>
            {[["chk","left"],["Order","left"],["Roaster","left"],["Product","left"],["Lbs","right"],["Bags","right"],["Packaging","left"],["Stage","left"],["Need by","right"],["Total","right"]].map(([h,al],i)=>(
              <th key={i} style={{textAlign:al,padding:"9px 14px",whiteSpace:"nowrap",...CO.over({fontSize:10,color:"var(--ink-muted)"})}}>
                {h==="chk" ? <input type="checkbox" style={{accentColor:"var(--ink)"}}/> : h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(o=>{
            const q = plaQuote(o);
            return (
              <tr key={o.id} onClick={()=>onOpen(o)} style={{borderBottom:"1px solid var(--hairline)",cursor:"pointer",transition:"background var(--dur) var(--ease)"}}
                onMouseOver={e=>e.currentTarget.style.background="var(--surface-hover)"}
                onMouseOut={e=>e.currentTarget.style.background="transparent"}>
                <td style={plaCell}><input type="checkbox" onClick={e=>e.stopPropagation()} style={{accentColor:"var(--ink)"}}/></td>
                <td style={plaCell}>
                  <div style={CO.data({fontSize:13,color:"var(--ink)",whiteSpace:"nowrap"})}>{o.id}</div>
                  <div style={{fontSize:11,color:"var(--ink-subtle)",fontFamily:"var(--font-sans)",whiteSpace:"nowrap"}}>Placed {o.placed}</div>
                </td>
                <td style={plaCell}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <Mono name={o.roaster}/>
                    <div style={{minWidth:0}}>
                      <div style={{fontFamily:"var(--font-sans)",fontSize:13,fontWeight:600,color:"var(--ink)",whiteSpace:"nowrap"}}>{o.roaster}</div>
                      <div style={CO.over({fontSize:9.5,color:"var(--ink-subtle)",whiteSpace:"nowrap"})}>{o.tier}</div>
                    </div>
                  </div>
                </td>
                <td style={plaCell}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{width:11,height:11,borderRadius:"var(--r-sm)",flexShrink:0,background:plRampColor(o.roast),boxShadow:"inset 0 0 0 1px rgba(0,0,0,.14)"}}/>
                    <div style={{minWidth:0}}>
                      <div style={{fontFamily:"var(--font-sans)",fontSize:13,color:"var(--ink)",whiteSpace:"nowrap"}}>{o.product}</div>
                      <div style={CO.over({fontSize:9.5,color:"var(--ink-subtle)",whiteSpace:"nowrap"})}>{o.kind==="blend"?`Blend · ${o.sel.length} lots`:"Stocked"} · {plRoastName(o.roast)}</div>
                    </div>
                  </div>
                </td>
                <td style={{...plaCell,textAlign:"right"}}><span style={CO.data({fontSize:13,color:"var(--ink)"})}>{o.lbs}</span></td>
                <td style={{...plaCell,textAlign:"right",whiteSpace:"nowrap"}}><span style={CO.data({fontSize:13,color:"var(--ink)"})}>{q.bags}</span><span style={CO.data({fontSize:11,color:"var(--ink-subtle)"})}> × {q.bag.label}</span></td>
                <td style={plaCell}><PackGlyph packId={o.packId}/></td>
                <td style={plaCell}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:5}}>
                    <StageChip stage={o.stage}/>
                    {o.flag && <FlagChip flag={o.flag}/>}
                  </div>
                </td>
                <td style={{...plaCell,textAlign:"right"}}><span style={CO.data({fontSize:12.5,color:"var(--ink-muted)",whiteSpace:"nowrap"})}>{o.needBy}</span></td>
                <td style={{...plaCell,textAlign:"right"}}><span style={CO.data({fontSize:13,color:"var(--ink)"})}>{plMoney0(q.total)}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,padding:"10px 14px",borderTop:"1px solid var(--hairline)"}}>
      <span style={{fontSize:12,color:"var(--ink-muted)",fontFamily:"var(--font-sans)"}}>{rows.length} orders · <Kbd>⌘K</Kbd> to jump</span>
      <div style={{display:"flex",gap:8}}><Btn size="sm" variant="outline">Export CSV</Btn></div>
    </div>
  </div>
);

// ---------- proof desk ----------
const PLProofDesk = () => {
  const state = {
    "needs-review":     {label:"Needs review",     fg:"var(--warning)"},
    "awaiting-roaster": {label:"Awaiting roaster", fg:"var(--info)"},
    "changes":          {label:"Changes requested",fg:"var(--danger)"},
  };
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:14}}>
      {PLA_PROOFS.map(p=>{
        const s = state[p.state];
        return (
          <div key={p.id} style={{border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",background:"var(--surface)",overflow:"hidden",display:"flex",flexDirection:"column"}}>
            <div style={{aspectRatio:"5 / 4",maxHeight:260,background:"var(--surface-sunken)",borderBottom:"1px solid var(--hairline)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,color:"var(--ink-subtle)"}}>
              <I name="pkg" size={22} stroke={1.6}/>
              <span style={CO.data({fontSize:11.5,color:"var(--ink-muted)"})}>{p.file}</span>
              <span style={CO.over({fontSize:9,color:"var(--ink-subtle)"})}>rev {p.rev} · {p.colors}</span>
            </div>
            <div style={{padding:14,display:"flex",flexDirection:"column",gap:10,flex:1}}>
              <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:10}}>
                <span style={{fontFamily:"var(--font-sans)",fontSize:13.5,fontWeight:600,color:"var(--ink)"}}>{p.roaster}</span>
                <span style={CO.data({fontSize:11.5,color:"var(--ink-subtle)"})}>{p.orderId}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                <span style={{...CO.over({fontSize:9.5}),color:s.fg}}>{s.label}</span>
                <span style={CO.data({fontSize:11,color:"var(--ink-subtle)"})}>{p.size} · in {p.submitted}</span>
              </div>
              <p style={{margin:0,fontFamily:"var(--font-sans)",fontSize:12.5,lineHeight:1.5,color:"var(--ink-muted)",flex:1}}>{p.note}</p>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {p.state==="awaiting-roaster"
                  ? <><Btn size="sm" variant="outline">Nudge roaster</Btn><Btn size="sm" variant="ghost">View order</Btn></>
                  : <><Btn size="sm" variant="primary">Send proof</Btn><Btn size="sm" variant="outline">Request changes</Btn></>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---------- catalog levers ----------
const PLCatalog = () => {
  const [pub, setPub] = React.useState(()=>{ const o={}; for(const k in PLA_SKU_STATE) o[k]=PLA_SKU_STATE[k].published; return o; });
  return (
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      <section>
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:12,paddingBottom:10,borderBottom:"1px solid var(--hairline-strong)"}}>
          <span style={CO.over({fontSize:10.5,color:"var(--ink-muted)"})}>Ready to ship</span>
          <span style={{fontFamily:"var(--font-sans)",fontSize:12,color:"var(--ink-subtle)"}}>What roasters can buy roasted, priced per pound</span>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:780}}>
            <thead>
              <tr>{["Coffee","Roast","$ / lb","On hand","Par","Weekly out","Live"].map((h,i)=>(
                <th key={i} style={{textAlign:i>1&&i<6?"right":"left",padding:"9px 14px 9px 0",...CO.over({fontSize:10,color:"var(--ink-muted)"})}}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {PL_STOCK.map(s=>{
                const st = PLA_SKU_STATE[s.id], low = st.par>0 && st.onHand < st.par;
                return (
                  <tr key={s.id} style={{borderTop:"1px solid var(--hairline)"}}>
                    <td style={{padding:"12px 14px 12px 0"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{width:11,height:11,borderRadius:"var(--r-sm)",flexShrink:0,background:plRampColor(s.roast),boxShadow:"inset 0 0 0 1px rgba(0,0,0,.14)"}}/>
                        <div style={{minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{fontFamily:"var(--font-sans)",fontSize:13.5,fontWeight:600,color:"var(--ink)"}}>{s.name}</span>
                            {s.tag && <Pill variant="tomato">{s.tag}</Pill>}
                          </div>
                          <div style={{fontFamily:"var(--font-sans)",fontSize:11.5,color:"var(--ink-subtle)",marginTop:2}}>{s.sub}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{padding:"12px 14px 12px 0"}}><span style={CO.over({fontSize:9.5,color:"var(--ink-muted)"})}>{plRoastName(s.roast)}</span></td>
                    <td style={{padding:"12px 14px 12px 0",textAlign:"right"}}><span style={CO.data({fontSize:13,color:"var(--ink)"})}>{plMoney(s.price)}</span></td>
                    <td style={{padding:"12px 14px 12px 0",textAlign:"right"}}><span style={CO.data({fontSize:13,color:low?"var(--danger)":"var(--ink)"})}>{st.onHand.toLocaleString()}</span></td>
                    <td style={{padding:"12px 14px 12px 0",textAlign:"right"}}><span style={CO.data({fontSize:12.5,color:"var(--ink-subtle)"})}>{st.par ? st.par.toLocaleString() : "—"}</span></td>
                    <td style={{padding:"12px 14px 12px 0",textAlign:"right"}}><span style={CO.data({fontSize:12.5,color:"var(--ink-muted)"})}>{st.weekly}</span></td>
                    <td style={{padding:"12px 0"}}>
                      <button onClick={()=>setPub(p=>({...p,[s.id]:!p[s.id]}))} aria-label="Toggle listing" style={{width:38,height:22,borderRadius:11,border:"1px solid var(--hairline-strong)",background:pub[s.id]?"var(--ink)":"var(--surface-sunken)",cursor:"pointer",padding:2,display:"flex",justifyContent:pub[s.id]?"flex-end":"flex-start",transition:"all var(--dur) var(--ease)"}}>
                        <span style={{width:16,height:16,borderRadius:"50%",background:pub[s.id]?"var(--on-ink)":"var(--surface)",boxShadow:"var(--shadow-sm)"}}/>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:12,paddingBottom:10,borderBottom:"1px solid var(--hairline-strong)"}}>
          <span style={CO.over({fontSize:10.5,color:"var(--ink-muted)"})}>Green in the blend builder</span>
          <span style={{fontFamily:"var(--font-sans)",fontSize:12,color:"var(--ink-subtle)"}}>Lots roasters can combine themselves</span>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:720}}>
            <thead>
              <tr>{["Lot","Origin","Process","$ / lb green","On hand","Status"].map((h,i)=>(
                <th key={i} style={{textAlign:i>2&&i<5?"right":"left",padding:"9px 14px 9px 0",...CO.over({fontSize:10,color:"var(--ink-muted)"})}}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {PL_GREEN.map(c=>(
                <tr key={c.id} style={{borderTop:"1px solid var(--hairline)"}}>
                  <td style={{padding:"12px 14px 12px 0"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{width:11,height:11,borderRadius:"var(--r-sm)",flexShrink:0,background:plRampColor(c.roast)}}/>
                      <div>
                        <div style={{fontFamily:"var(--font-sans)",fontSize:13.5,fontWeight:600,color:"var(--ink)"}}>{c.name}</div>
                        <div style={CO.data({fontSize:11,color:"var(--ink-subtle)",marginTop:2})}>{c.lot}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{padding:"12px 14px 12px 0",fontFamily:"var(--font-sans)",fontSize:12.5,color:"var(--ink-muted)"}}>{c.origin}</td>
                  <td style={{padding:"12px 14px 12px 0"}}><span style={CO.over({fontSize:9.5,color:"var(--ink-muted)"})}>{c.process}</span></td>
                  <td style={{padding:"12px 14px 12px 0",textAlign:"right"}}><span style={CO.data({fontSize:13,color:"var(--ink)"})}>{plMoney(c.price)}</span></td>
                  <td style={{padding:"12px 14px 12px 0",textAlign:"right"}}><span style={CO.data({fontSize:13,color:c.avail===0?"var(--danger)":c.avail<500?"var(--warning)":"var(--ink)"})}>{c.avail ? c.avail.toLocaleString() : "0"}</span></td>
                  <td style={{padding:"12px 0"}}>
                    {c.avail===0 ? <Pill variant="cream">Hidden · out</Pill> : c.kind==="limited" ? <Pill variant="tomato" dot pulse>Limited</Pill> : <Pill variant="matcha">Listed</Pill>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

// ---------- packaging ----------
const PLPackaging = () => (
  <div style={{display:"flex",flexDirection:"column",gap:24}}>
    <section>
      <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:12,paddingBottom:10,borderBottom:"1px solid var(--hairline-strong)"}}>
        <span style={CO.over({fontSize:10.5,color:"var(--ink-muted)"})}>Our bag stock</span>
        <Btn size="sm" variant="outline" icon={<I name="plus" size={14}/>}>Reorder bags</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:14,marginTop:14}}>
        {PLA_BAGSTOCK.map(b=>{
          const free = b.onHand - b.committed, low = free < b.par;
          const pct = Math.min(100, Math.round(free / Math.max(1,b.par) * 100));
          return (
            <div key={b.id} style={{border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",background:"var(--surface)",padding:16}}>
              <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:10}}>
                <span style={{fontFamily:"var(--font-sans)",fontSize:13.5,fontWeight:600,color:"var(--ink)"}}>{b.label}</span>
                <span style={CO.data({fontSize:12,color:"var(--ink-subtle)"})}>{plMoney(b.cost)}</span>
              </div>
              <div style={{display:"flex",alignItems:"flex-end",gap:8,marginTop:10}}>
                <span style={CO.data({fontSize:30,lineHeight:1,color:low?"var(--danger)":"var(--ink)"})}>{free.toLocaleString()}</span>
                <span style={CO.over({fontSize:9.5,color:"var(--ink-subtle)",marginBottom:4})}>free of {b.onHand.toLocaleString()}</span>
              </div>
              <div style={{height:4,borderRadius:2,background:"var(--surface-sunken)",marginTop:12,overflow:"hidden"}}>
                <div style={{height:"100%",width:pct+"%",background:low?"var(--danger)":"var(--roast-3)"}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",gap:10,marginTop:8,...CO.data({fontSize:11,color:"var(--ink-subtle)"})}}>
                <span>{b.committed} committed · par {b.par.toLocaleString()}</span><span>lead {b.lead}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>

    <section>
      <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:12,paddingBottom:10,borderBottom:"1px solid var(--hairline-strong)"}}>
        <span style={CO.over({fontSize:10.5,color:"var(--ink-muted)"})}>Roaster-supplied bags</span>
        <span style={{fontFamily:"var(--font-sans)",fontSize:12,color:"var(--ink-subtle)"}}>Log them in against the order before the run</span>
      </div>
      {PLA_INBOUND.map(b=>{
        const short = b.bags < b.need, received = b.state==="received";
        return (
          <div key={b.orderId} style={{display:"flex",alignItems:"center",gap:16,padding:"14px 0",borderBottom:"1px solid var(--hairline)",flexWrap:"wrap"}}>
            <Mono name={b.roaster}/>
            <div style={{flex:"1 1 200px",minWidth:0}}>
              <div style={{fontFamily:"var(--font-sans)",fontSize:13.5,fontWeight:600,color:"var(--ink)"}}>{b.roaster}</div>
              <div style={CO.data({fontSize:11.5,color:"var(--ink-subtle)",marginTop:2})}>{b.orderId} · needs {b.need}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={CO.data({fontSize:18,color:short?"var(--danger)":"var(--ink)"})}>{b.bags}</div>
              <div style={CO.over({fontSize:9,color:"var(--ink-subtle)",marginTop:2})}>{received?"received":"expected "+b.arrived}</div>
            </div>
            {received ? <Pill variant="matcha">Logged in</Pill> : <Btn size="sm" variant="outline">Receive</Btn>}
          </div>
        );
      })}
    </section>

    <section>
      <div style={{paddingBottom:10,borderBottom:"1px solid var(--hairline-strong)"}}><span style={CO.over({fontSize:10.5,color:"var(--ink-muted)"})}>What we charge</span></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:14,marginTop:14}}>
        {PL_PACK.map(p=>(
          <div key={p.id} style={{border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",background:"var(--surface)",padding:16,display:"flex",flexDirection:"column",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{width:30,height:30,borderRadius:"var(--r-md)",background:"var(--surface-sunken)",display:"inline-flex",alignItems:"center",justifyContent:"center",color:"var(--roast-3)",flexShrink:0}}><I name={p.icon} size={16} stroke={2}/></span>
              <span style={CO.display({fontSize:14,color:"var(--ink)",lineHeight:1.1})}>{p.title}</span>
            </div>
            <div style={{fontFamily:"var(--font-sans)",fontSize:12,lineHeight:1.5,color:"var(--ink-muted)",flex:1}}>{p.desc}</div>
            <div style={CO.over({fontSize:9.5,color:"var(--ink-subtle)"})}>{p.rate}</div>
          </div>
        ))}
      </div>
      <p style={{margin:"12px 0 0",fontFamily:"var(--font-sans)",fontSize:12.5,color:"var(--ink-subtle)",lineHeight:1.55}}>Fill, seal and date-stamp is {plMoney(PL_FILL)} a bag on every run. Minimum private label order is {PL_MIN} lb.</p>
    </section>
  </div>
);

// ---------- the view ----------
const PrivateLabelAdminView = ({ openOrder }) => {
  const [tab, setTab] = React.useState("queue");
  const [seg, setSeg] = React.useState("all");

  const live = PLA_ORDERS.filter(o=>o.stage!=="shipped");
  const flagged = PLA_ORDERS.filter(o=>o.flag);
  const lbsQueued = live.reduce((s,o)=>s+o.lbs,0);
  const value = live.reduce((s,o)=>s+plaQuote(o).total,0);
  const bagsQueued = live.reduce((s,o)=>s+plaQuote(o).bags,0);

  const base = tab==="queue" ? live : tab==="all" ? PLA_ORDERS : flagged;
  const rows = base.filter(o=>seg==="all"?true:seg==="blend"?o.kind==="blend":o.kind==="stock");

  return (
    <div style={{display:"flex",flexDirection:"column",gap:24,padding:"20px 24px 40px",maxWidth:"var(--content-max)"}}>
      <div style={{display:"flex",flexDirection:"column",gap:18}}>
        <HeroMetric label="Private label in flight" value={live.length} delta="+2" deltaDir="up"
          caption={`${lbsQueued.toLocaleString()} lb queued · ${bagsQueued.toLocaleString()} bags to fill · ${flagged.length} need something from us`}/>
        <StatStrip items={[
          { label:"Committed value", value:plMoney0(value) },
          { label:"Proofs open",     value:PLA_PROOFS.length, live:true },
          { label:"Roasting now",    value:live.filter(o=>o.stage==="roasting").length, live:true },
          { label:"Avg run",         value:Math.round(lbsQueued/Math.max(1,live.length)), unit:"lb" },
        ]}/>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <Tabs active={tab} onChange={setTab} tabs={[
          { id:"queue",     label:"Queue",     count:live.length },
          { id:"attention", label:"Needs us",  count:flagged.length },
          { id:"all",       label:"All orders",count:PLA_ORDERS.length },
          { id:"proofs",    label:"Proofs",    count:PLA_PROOFS.length },
          { id:"catalog",   label:"Catalog" },
          { id:"packaging", label:"Packaging" },
        ]}/>

        {(tab==="queue"||tab==="attention"||tab==="all") && <>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:10,background:"var(--surface-sunken)",border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",flexWrap:"wrap"}}>
            <div style={{maxWidth:320,flex:1,display:"flex",minWidth:200}}><SearchInput placeholder="Roaster, order #, or blend"/></div>
            <Segmented value={seg} onChange={setSeg} options={[{id:"all",label:"All"},{id:"stock",label:"Stocked"},{id:"blend",label:"Blends"}]}/>
            <Select>Any stage</Select>
            <div style={{flex:1}}/>
            <Btn size="sm" variant="outline" icon={<I2 name="filter" size={14} stroke={2}/>}>More filters</Btn>
          </div>
          {rows.length===0
            ? <div style={{padding:"48px 16px",textAlign:"center",border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",background:"var(--surface)"}}>
                <div style={CO.display({fontSize:20,color:"var(--ink)",textTransform:"uppercase"})}>Nothing waiting</div>
                <div style={{fontSize:13,color:"var(--ink-muted)",marginTop:8,fontFamily:"var(--font-sans)"}}>No private label orders need you right now. Switch to All orders to see the history.</div>
              </div>
            : <PLOrdersTable rows={rows} onOpen={openOrder}/>}
        </>}

        {tab==="proofs"    && <PLProofDesk/>}
        {tab==="catalog"   && <PLCatalog/>}
        {tab==="packaging" && <PLPackaging/>}
      </div>
    </div>
  );
};

Object.assign(window, { PrivateLabelAdminView, PLOrdersTable, PLProofDesk, PLCatalog, PLPackaging, StageChip, Mono, plaQuote, plaPriceOf });
