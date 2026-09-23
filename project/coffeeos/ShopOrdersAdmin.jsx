// CoRoasted × CoffeeOS — Orders (D2C). What the shop sold and what it takes to fulfil it.
// Table → drawer for one order; Roast list aggregates the whole unshipped queue.

const soCell = { padding:"11px 14px", verticalAlign:"middle" };

// initials chip (own copy so this page stands alone without the PL admin bundle)
const SOAvatar = ({ name, size=30 }) => {
  const ini = name.replace(/[^\p{L}\p{N}\s]/gu,"").trim().split(/\s+/).slice(0,2).map(s=>s[0]).join("").toUpperCase() || "—";
  return <span style={{width:size,height:size,flexShrink:0,borderRadius:"var(--r-md)",background:"var(--surface-sunken)",border:"1px solid var(--hairline)",display:"inline-flex",alignItems:"center",justifyContent:"center",...CO.data({fontSize:size*0.38,color:"var(--ink-muted)"})}}>{ini}</span>;
};

const SOStatusChip = ({ status }) => {
  const m = {
    paid:     {fg:"var(--warning)", bg:"rgba(178,107,0,.10)", dot:"var(--warning)"},
    roasting: {fg:"var(--brand)",   bg:"var(--brand-soft)",   dot:"var(--brand)", pulse:true},
    packing:  {fg:"var(--ink)",     bg:"var(--surface-sunken)",dot:"var(--roast-3)"},
    shipped:  {fg:"var(--success)", bg:"rgba(30,122,74,.10)", dot:"var(--success)"},
  }[status] || {fg:"var(--ink-muted)",bg:"var(--surface-sunken)",dot:"var(--ink-subtle)"};
  const label = (SO_STAGES.find(s=>s.id===status)||{label:status}).label;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:6,padding:"3px 10px",borderRadius:"var(--r-pill)",background:m.bg,color:m.fg,whiteSpace:"nowrap",...CO.over({fontSize:10,letterSpacing:".05em"})}}>
      <span style={{width:6,height:6,borderRadius:"50%",background:m.dot,flexShrink:0,animation:m.pulse?"co-pulse 1.5s ease-in-out infinite":"none"}}/>{label}
    </span>
  );
};

// ---------- orders table ----------
const SOOrdersTable = ({ rows, onOpen }) => (
  <div style={{border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",overflow:"hidden",background:"var(--surface)"}}>
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",minWidth:1080}}>
        <thead>
          <tr style={{background:"var(--surface-sunken)",borderBottom:"1px solid var(--hairline)"}}>
            {[["chk","left"],["Order","left"],["Customer","left"],["What they bought","left"],["Lbs","right"],["Bags","right"],["Grind","left"],["Status","left"],["Total","right"]].map(([h,al],i)=>(
              <th key={i} style={{textAlign:al,padding:"9px 14px",whiteSpace:"nowrap",...CO.over({fontSize:10,color:"var(--ink-muted)"})}}>
                {h==="chk" ? <input type="checkbox" style={{accentColor:"var(--ink)"}}/> : h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(o=>{
            const q = soQuote(o);
            const grinds = [...new Set(o.items.map(i=>i.grind))];
            return (
              <tr key={o.id} onClick={()=>onOpen(o)} style={{borderBottom:"1px solid var(--hairline)",cursor:"pointer",transition:"background var(--dur) var(--ease)"}}
                onMouseOver={e=>e.currentTarget.style.background="var(--surface-hover)"}
                onMouseOut={e=>e.currentTarget.style.background="transparent"}>
                <td style={soCell}><input type="checkbox" onClick={e=>e.stopPropagation()} style={{accentColor:"var(--ink)"}}/></td>
                <td style={soCell}>
                  <div style={CO.data({fontSize:13,color:"var(--ink)",whiteSpace:"nowrap"})}>{o.id}</div>
                  <div style={{fontSize:11,color:"var(--ink-subtle)",fontFamily:"var(--font-sans)",whiteSpace:"nowrap"}}>Placed {o.placed}</div>
                </td>
                <td style={soCell}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <SOAvatar name={o.customer.name}/>
                    <div style={{minWidth:0}}>
                      <div style={{fontFamily:"var(--font-sans)",fontSize:13,fontWeight:600,color:"var(--ink)",whiteSpace:"nowrap"}}>{o.customer.name}</div>
                      <div style={CO.over({fontSize:9.5,color:"var(--ink-subtle)",whiteSpace:"nowrap"})}>{o.customer.city} · {o.channel}</div>
                    </div>
                  </div>
                </td>
                <td style={soCell}>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {o.items.map((it,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:9}}>
                        <span style={{width:10,height:10,borderRadius:"var(--r-sm)",flexShrink:0,background:plRampColor(soItemRoast(it)),boxShadow:"inset 0 0 0 1px rgba(0,0,0,.14)"}}/>
                        <span style={{fontFamily:"var(--font-sans)",fontSize:13,color:"var(--ink)",whiteSpace:"nowrap"}}>{soItemName(it)}</span>
                        <span style={CO.data({fontSize:11.5,color:"var(--ink-subtle)",whiteSpace:"nowrap"})}>{it.qty} × {soSize(it.sizeId).label}</span>
                        {it.kind==="blend" && <Pill variant="cream">Blend</Pill>}
                      </div>
                    ))}
                  </div>
                </td>
                <td style={{...soCell,textAlign:"right"}}><span style={CO.data({fontSize:13,color:"var(--ink)"})}>{q.lbs % 1 ? q.lbs.toFixed(1) : q.lbs}</span></td>
                <td style={{...soCell,textAlign:"right"}}><span style={CO.data({fontSize:13,color:"var(--ink)"})}>{q.bags}</span></td>
                <td style={soCell}><span style={CO.data({fontSize:12,color:"var(--ink-muted)",whiteSpace:"nowrap"})}>{grinds.length>1?`${grinds.length} grinds`:grinds[0]}</span></td>
                <td style={soCell}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:5}}>
                    <SOStatusChip status={o.status}/>
                    {o.gift && <span style={CO.over({fontSize:9.5,color:"var(--info)"})}>Gift note</span>}
                  </div>
                </td>
                <td style={{...soCell,textAlign:"right"}}><span style={CO.data({fontSize:13,color:"var(--ink)"})}>{plMoney(soQuote(o).total)}</span></td>
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

// ---------- roast list: the whole queue, as poundage ----------
const SORoastList = ({ orders }) => {
  const plan = soRoastPlan(orders);
  const totalLbs = plan.roasted.reduce((a,r)=>a+r.lbs,0);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      <section>
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:12,paddingBottom:10,borderBottom:"1px solid var(--hairline-strong)"}}>
          <span style={CO.over({fontSize:10.5,color:"var(--ink-muted)"})}>Roast this batch</span>
          <span style={{fontFamily:"var(--font-sans)",fontSize:12,color:"var(--ink-subtle)"}}>{totalLbs.toFixed(1)} lb roasted across {orders.length} unshipped orders</span>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:720}}>
            <thead>
              <tr>{["Coffee","Roast","Roasted lb","Green lb","Orders"].map((h,i)=>(
                <th key={i} style={{textAlign:i>1?"right":"left",padding:"9px 14px 9px 0",...CO.over({fontSize:10,color:"var(--ink-muted)"})}}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {plan.roasted.map(r=>(
                  <tr key={r.key} style={{borderTop:"1px solid var(--hairline)"}}>
                    <td style={{padding:"12px 14px 12px 0"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{width:11,height:11,borderRadius:"var(--r-sm)",flexShrink:0,background:plRampColor(r.roast),boxShadow:"inset 0 0 0 1px rgba(0,0,0,.14)"}}/>
                        <div style={{minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{fontFamily:"var(--font-sans)",fontSize:13.5,fontWeight:600,color:"var(--ink)"}}>{r.name}</span>
                            {r.kind==="blend" && <Pill variant="cream">Blend</Pill>}
                          </div>
                          {r.kind==="blend" && <div style={CO.data({fontSize:11,color:"var(--ink-subtle)",marginTop:3})}>{r.sel.map(s=>`${plGreen(s.id).name} ${s.pct}%`).join(" · ")}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{padding:"12px 14px 12px 0"}}><span style={CO.over({fontSize:9.5,color:"var(--ink-muted)"})}>{plRoastName(r.roast)}</span></td>
                    <td style={{padding:"12px 14px 12px 0",textAlign:"right"}}><span style={CO.data({fontSize:13,color:"var(--ink)"})}>{r.lbs.toFixed(1)}</span></td>
                    <td style={{padding:"12px 14px 12px 0",textAlign:"right"}}><span style={CO.data({fontSize:12.5,color:"var(--ink-muted)"})}>{(r.lbs/SO_GREEN_LOSS).toFixed(1)}</span></td>
                    <td style={{padding:"12px 0",textAlign:"right"}}><span style={CO.data({fontSize:12.5,color:"var(--ink-muted)"})}>{r.orders}</span></td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:12,paddingBottom:10,borderBottom:"1px solid var(--hairline-strong)"}}>
          <span style={CO.over({fontSize:10.5,color:"var(--ink-muted)"})}>Green to pull</span>
          <span style={{fontFamily:"var(--font-sans)",fontSize:12,color:"var(--ink-subtle)"}}>Blend components · 16% roast loss included</span>
        </div>
        {plan.green.length === 0
          ? <p style={{margin:"14px 0 0",fontFamily:"var(--font-sans)",fontSize:13,color:"var(--ink-muted)"}}>No blends in this queue — every line is a single coffee.</p>
          : plan.green.map(g=>{
              const c = plGreen(g.id), need = g.lbs/SO_GREEN_LOSS;
              return (
                <div key={g.id} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 0",borderBottom:"1px solid var(--hairline)",flexWrap:"wrap"}}>
                  <span style={{width:11,height:11,borderRadius:"var(--r-sm)",flexShrink:0,background:plRampColor(c.roast)}}/>
                  <div style={{flex:"1 1 200px",minWidth:0}}>
                    <div style={{fontFamily:"var(--font-sans)",fontSize:13.5,fontWeight:600,color:"var(--ink)"}}>{c.name}</div>
                    <div style={CO.data({fontSize:11.5,color:"var(--ink-subtle)",marginTop:2})}>{c.lot} · {c.origin}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={CO.data({fontSize:18,color:"var(--ink)"})}>{need.toFixed(1)}</div>
                    <div style={CO.over({fontSize:9,color:"var(--ink-subtle)",marginTop:2})}>green lb</div>
                  </div>
                  <span style={CO.data({fontSize:12,color:"var(--ink-muted)",width:120,textAlign:"right"})}>{g.lbs.toFixed(1)} lb roasted</span>
                </div>
              );
            })}
      </section>
    </div>
  );
};

// ---------- the view ----------
const ShopOrdersView = () => {
  const [tab, setTab] = React.useState("queue");
  const [seg, setSeg] = React.useState("all");
  const [stages, setStages] = React.useState({});
  const [open, setOpen] = React.useState(null);

  const all = SO_ORDERS.map(o=>({ ...o, status: stages[o.id] || o.status }));
  const live = all.filter(o=>o.status!=="shipped");
  const toRoast = live.filter(o=>o.status==="paid");
  const shipReady = live.filter(o=>o.status==="packing");

  const base = tab==="queue" ? live : tab==="all" ? all : live;
  const rows = base.filter(o=>seg==="all"?true:seg==="sub"?o.channel==="Subscription":o.items.some(i=>i.kind==="blend"));

  const lbs = live.reduce((s,o)=>s+soQuote(o).lbs, 0);
  const bags = live.reduce((s,o)=>s+soQuote(o).bags, 0);
  const value = live.reduce((s,o)=>s+soQuote(o).total, 0);

  const advance = (o) => {
    const next = SO_STAGES[soStageIdx(o.status)+1];
    if (!next) return;
    setStages(s=>({...s, [o.id]: next.id}));
    setOpen(p=>p && p.id===o.id ? {...p, status:next.id} : p);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:24,padding:"20px 24px 40px",maxWidth:"var(--content-max)"}}>
      <div style={{display:"flex",flexDirection:"column",gap:18}}>
        <HeroMetric label="Shop orders to fulfil" value={live.length} delta="+3" deltaDir="up"
          caption={`${lbs.toFixed(1)} lb to roast · ${bags} bags to fill · ${toRoast.length} not started`}/>
        <StatStrip items={[
          { label:"Unshipped value", value:plMoney0(value) },
          { label:"Waiting to roast", value:toRoast.length, live:true },
          { label:"Ready to ship",    value:shipReady.length },
          { label:"Subscriptions",    value:all.filter(o=>o.channel==="Subscription").length },
        ]}/>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <Tabs active={tab} onChange={setTab} tabs={[
          { id:"queue",     label:"To fulfil",  count:live.length },
          { id:"roastlist", label:"Roast list" },
          { id:"all",       label:"All orders", count:all.length },
        ]}/>

        {(tab==="queue"||tab==="all") && <>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:10,background:"var(--surface-sunken)",border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",flexWrap:"wrap"}}>
            <div style={{maxWidth:320,flex:1,display:"flex",minWidth:200}}><SearchInput placeholder="Customer, order #, or coffee"/></div>
            <Segmented value={seg} onChange={setSeg} options={[{id:"all",label:"All"},{id:"sub",label:"Subscriptions"},{id:"blend",label:"Custom blends"}]}/>
            <Select>Any status</Select>
            <div style={{flex:1}}/>
            <Btn size="sm" variant="outline" icon={<I2 name="filter" size={14} stroke={2}/>}>More filters</Btn>
          </div>
          {rows.length===0
            ? <div style={{padding:"48px 16px",textAlign:"center",border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",background:"var(--surface)"}}>
                <div style={CO.display({fontSize:20,color:"var(--ink)",textTransform:"uppercase"})}>Nothing to fulfil</div>
                <div style={{fontSize:13,color:"var(--ink-muted)",marginTop:8,fontFamily:"var(--font-sans)"}}>Every shop order is out the door. Switch to All orders for the history.</div>
              </div>
            : <SOOrdersTable rows={rows} onOpen={setOpen}/>}
        </>}

        {tab==="roastlist" && <SORoastList orders={live}/>}
      </div>

      <ShopOrderDrawer order={open} onClose={()=>setOpen(null)} onAdvance={advance}/>
    </div>
  );
};

Object.assign(window, { ShopOrdersView, SOOrdersTable, SORoastList, SOStatusChip, SOAvatar });
