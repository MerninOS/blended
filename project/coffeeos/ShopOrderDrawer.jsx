// CoRoasted × CoffeeOS — shop order drawer. Everything needed to roast, bag and ship one order.

const soGrams = (lb) => Math.round(lb * 453.592).toLocaleString() + " g";

const SODrawerRow = ({ k, v, mono:m=false }) => (
  <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:16,padding:"10px 0",borderBottom:"1px solid var(--hairline)"}}>
    <span style={CO.over({fontSize:9.5,color:"var(--ink-subtle)",flexShrink:0})}>{k}</span>
    <span style={m ? CO.data({fontSize:13,color:"var(--ink)",textAlign:"right"}) : {fontFamily:"var(--font-sans)",fontSize:13,color:"var(--ink)",textAlign:"right"}}>{v}</span>
  </div>
);

const SOStagePipeline = ({ status }) => {
  const at = soStageIdx(status);
  return (
    <div style={{display:"flex",gap:4}}>
      {SO_STAGES.map((s,i)=>{
        const done = i < at, on = i === at;
        return (
          <div key={s.id} style={{flex:1,minWidth:0}}>
            <div style={{height:4,borderRadius:2,background:on?"var(--brand)":done?"var(--ink)":"var(--surface-sunken)",animation:on&&status==="roasting"?"co-pulse 1.5s ease-in-out infinite":"none"}}/>
            <div style={{marginTop:7,...CO.over({fontSize:8.5,color:on?"var(--brand)":done?"var(--ink-muted)":"var(--ink-subtle)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"})}}>{s.label}</div>
          </div>
        );
      })}
    </div>
  );
};

const SOSectionHead = ({ label, right }) => (
  <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:12,paddingBottom:9,borderBottom:"1px solid var(--hairline-strong)"}}>
    <span style={CO.over({fontSize:10,color:"var(--ink-muted)"})}>{label}</span>
    {right && <span style={CO.data({fontSize:11.5,color:"var(--ink-subtle)"})}>{right}</span>}
  </div>
);

const ShopOrderDrawer = ({ order, onClose, onAdvance }) => {
  if (!order) return null;
  const o = order, q = soQuote(o);
  const at = soStageIdx(o.status);
  const next = SO_STAGES[at+1];
  const action = {roasting:"Start roast", packing:"Move to packing", shipped:"Buy label & mark shipped"}[next && next.id] || null;

  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(36,24,18,.38)",zIndex:400,animation:"co-fade .14s ease"}}/>
      <aside style={{position:"fixed",top:0,right:0,bottom:0,width:"min(560px,94vw)",zIndex:401,background:"var(--surface)",borderLeft:"1px solid var(--hairline)",boxShadow:"var(--shadow-modal)",display:"flex",flexDirection:"column",animation:"co-slide .18s cubic-bezier(.2,.6,.2,1)"}}>
        {/* head */}
        <div style={{padding:"18px 22px 16px",borderBottom:"1px solid var(--hairline)",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
            <SOAvatar name={o.customer.name} size={40}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={CO.over({fontSize:9.5,color:"var(--ink-subtle)"})}>{o.id} · placed {o.placed} · {o.channel}</div>
              <h2 style={CO.display({fontSize:22,lineHeight:1.05,margin:"5px 0 0",color:"var(--ink)"})}>{o.customer.name}</h2>
              <div style={{marginTop:6,fontFamily:"var(--font-sans)",fontSize:13,color:"var(--ink-muted)"}}>{o.customer.email} · {o.customer.city}</div>
            </div>
            <button onClick={onClose} aria-label="Close" style={{width:32,height:32,flexShrink:0,border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",background:"var(--surface)",color:"var(--ink-muted)",cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center"}}><I2 name="x" size={16} stroke={2}/></button>
          </div>
          <div style={{marginTop:18}}><SOStagePipeline status={o.status}/></div>
        </div>

        {/* body */}
        <div style={{flex:1,overflowY:"auto",padding:"18px 22px 24px",display:"flex",flexDirection:"column",gap:24}}>
          {(o.note || o.gift) && (
            <div style={{display:"flex",alignItems:"flex-start",gap:10,padding:"12px 14px",borderRadius:"var(--r-md)",background:o.gift?"var(--brand-soft)":"var(--surface-sunken)",border:`1px solid ${o.gift?"var(--brand)":"var(--hairline)"}`}}>
              <span style={{color:o.gift?"var(--brand)":"var(--ink-subtle)",marginTop:1,flexShrink:0}}><I2 name={o.gift?"alert":"list"} size={15} stroke={2.2}/></span>
              <span style={{fontFamily:"var(--font-sans)",fontSize:12.5,lineHeight:1.5,color:"var(--ink)"}}>{o.note || "Gift order — include the card, leave the invoice out of the box."}</span>
            </div>
          )}

          {/* roast sheet */}
          <section>
            <SOSectionHead label="Roast sheet" right={`${o.items.length} ${o.items.length===1?"item":"items"} · ${q.lbs.toFixed(1)} lb roasted`}/>
            <div style={{display:"flex",flexDirection:"column",gap:14,marginTop:14}}>
            {o.items.map((it,i)=>{
              const roast = soItemRoast(it), lbs = soItemLbs(it), size = soSize(it.sizeId);
              return (
                <div key={i} style={{border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",background:"var(--surface)",overflow:"hidden"}}>
                  {/* what the customer bought */}
                  <div style={{padding:"13px 15px",display:"flex",alignItems:"flex-start",gap:12,borderBottom:it.kind==="blend"?"1px solid var(--hairline)":"none"}}>
                    <span style={{width:26,height:26,flexShrink:0,borderRadius:"var(--r-sm)",background:"var(--surface-sunken)",display:"inline-flex",alignItems:"center",justifyContent:"center",...CO.data({fontSize:11,color:"var(--ink-muted)"})}}>{i+1}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={CO.display({fontSize:15,color:"var(--ink)",lineHeight:1.15})}>{soItemName(it)}</div>
                      <div style={{marginTop:7,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                        {it.kind==="blend"
                          ? <Pill variant="cream">Custom blend · {it.sel.length} coffees</Pill>
                          : <Pill variant="matcha">Our coffee</Pill>}
                        <span style={CO.data({fontSize:12,color:"var(--ink-muted)"})}>{it.qty} × {size.label} · {it.grind.toLowerCase()}</span>
                      </div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={CO.data({fontSize:17,color:"var(--ink)",lineHeight:1})}>{lbs % 1 ? lbs.toFixed(1) : lbs} lb</div>
                      <div style={CO.over({fontSize:9,color:"var(--ink-subtle)",marginTop:4})}>roasted</div>
                    </div>
                  </div>

                  {/* what has to go on the machine */}
                  <div style={{padding:"12px 15px 14px",background:"var(--surface-sunken)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:9,flexWrap:"wrap"}}>
                      <span style={CO.over({fontSize:9.5,color:"var(--ink-muted)"})}>Roast to</span>
                      <span style={{display:"inline-flex",alignItems:"center",gap:7,padding:"3px 9px",borderRadius:"var(--r-pill)",background:"var(--surface)",border:"1px solid var(--hairline)"}}>
                        <span style={{width:9,height:9,borderRadius:"var(--r-sm)",background:plRampColor(roast),boxShadow:"inset 0 0 0 1px rgba(0,0,0,.14)"}}/>
                        <span style={CO.over({fontSize:9.5,color:"var(--ink)"})}>{plRoastName(roast)}</span>
                      </span>
                      <span style={CO.data({fontSize:11.5,color:"var(--ink-subtle)"})}>Agtron {[75,75,67,58,50,42][Math.round(roast)]} · drop {[396,396,407,417,427,436][Math.round(roast)]}°F</span>
                    </div>

                    {it.kind==="blend" ? (
                      <>
                        <div style={{display:"flex",height:7,borderRadius:2,overflow:"hidden",margin:"13px 0 4px"}}>
                          {it.sel.map(s=><span key={s.id} style={{width:s.pct+"%",background:plRampColor(plGreen(s.id).roast)}}/>)}
                        </div>
                        {it.sel.map(s=>{
                          const c = plGreen(s.id), roastedLb = lbs*s.pct/100, greenLb = roastedLb/SO_GREEN_LOSS;
                          return (
                            <div key={s.id} style={{display:"flex",alignItems:"center",gap:11,padding:"10px 0",borderBottom:"1px solid var(--hairline)"}}>
                              <span style={{width:9,height:9,borderRadius:"var(--r-sm)",flexShrink:0,background:plRampColor(c.roast)}}/>
                              <span style={{width:40,flexShrink:0,...CO.data({fontSize:13,color:"var(--ink)"})}}>{s.pct}%</span>
                              <span style={{flex:1,minWidth:0}}>
                                <span style={{display:"block",fontFamily:"var(--font-sans)",fontSize:13,color:"var(--ink)"}}>{c.name}</span>
                                <span style={CO.data({fontSize:11,color:"var(--ink-subtle)"})}>{c.lot} · {soGrams(roastedLb)} out</span>
                              </span>
                              <span style={{textAlign:"right",flexShrink:0}}>
                                <span style={{display:"block",...CO.data({fontSize:13,color:"var(--ink)"})}}>{soGrams(greenLb)}</span>
                                <span style={{display:"block",...CO.over({fontSize:8.5,color:"var(--ink-subtle)",marginTop:2})}}>green in</span>
                              </span>
                            </div>
                          );
                        })}
                        <div style={{display:"flex",alignItems:"center",gap:11,paddingTop:10}}>
                          <span style={{flex:1,...CO.over({fontSize:9.5,color:"var(--ink-muted)"})}}>Total green for this blend</span>
                          <span style={CO.data({fontSize:13,color:"var(--ink)"})}>{soGrams(lbs/SO_GREEN_LOSS)}</span>
                        </div>
                      </>
                    ) : (
                      <div style={{marginTop:11,display:"flex",alignItems:"center",gap:11}}>
                        <span style={{flex:1,minWidth:0,fontFamily:"var(--font-sans)",fontSize:12.5,lineHeight:1.55,color:"var(--ink-muted)"}}>Single coffee, roasted to order.</span>
                        <span style={{textAlign:"right",flexShrink:0}}>
                          <span style={{display:"block",...CO.data({fontSize:13,color:"var(--ink)"})}}>{soGrams(lbs/SO_GREEN_LOSS)}</span>
                          <span style={{display:"block",...CO.over({fontSize:8.5,color:"var(--ink-subtle)",marginTop:2})}}>green in</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            </div>
          </section>

          {/* packing bench */}
          <section>
            <SOSectionHead label="Packing" right={`${q.bags} bags`}/>
            {soPackPlan(o).map((p,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:"1px solid var(--hairline)"}}>
                <span style={{width:30,height:30,borderRadius:"var(--r-md)",background:"var(--surface-sunken)",display:"inline-flex",alignItems:"center",justifyContent:"center",color:"var(--roast-3)",flexShrink:0}}><I name="bag" size={15} stroke={2}/></span>
                <span style={{flex:1,minWidth:0}}>
                  <span style={{display:"block",fontFamily:"var(--font-sans)",fontSize:13,color:"var(--ink)"}}>{p.qty} × {p.size.label} · {p.grind}</span>
                  <span style={CO.data({fontSize:11,color:"var(--ink-subtle)"})}>{p.names.join(" · ")}</span>
                </span>
                {p.grind !== "Whole bean" && <Pill variant="sun">Grind</Pill>}
              </div>
            ))}
            <SODrawerRow k="Bag" v="Kraft pouch, valve, resealable zip"/>
            <SODrawerRow k="Sticker" v="Coffee name, roast date, lot code" />
          </section>

          {/* shipping */}
          <section>
            <SOSectionHead label="Ship to"/>
            <div style={{padding:"14px 0 12px",fontFamily:"var(--font-sans)",fontSize:13.5,lineHeight:1.6,color:"var(--ink)"}}>
              {o.customer.address.map((l,i)=><div key={i}>{l}</div>)}
            </div>
            <SODrawerRow k="Method" v={o.ship.method}/>
            <SODrawerRow k="Ship weight" v={`${(q.lbs*1.08 + 0.4).toFixed(1)} lb est.`} mono/>
            <SODrawerRow k="Tracking" v={o.ship.tracking || "Not bought yet"} mono/>
          </section>

          {/* money */}
          <section>
            <SOSectionHead label="Paid"/>
            {o.items.map((it,i)=>(
              <SODrawerRow key={i} k={`${soItemName(it)} · ${it.qty} × ${soSize(it.sizeId).label}`} v={plMoney(soItemTotal(it))} mono/>
            ))}
            {q.discount>0 && <SODrawerRow k="Subscription discount" v={"−"+plMoney(q.discount)} mono/>}
            <SODrawerRow k="Shipping" v={q.shipping===0?"Free":plMoney(q.shipping)} mono/>
            <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:16,paddingTop:14}}>
              <div>
                <div style={CO.over({fontSize:10,color:"var(--ink-muted)"})}>Order total</div>
                <div style={CO.data({fontSize:12,color:"var(--ink-subtle)",marginTop:4})}>Card charged {o.placed} · {plMoney(q.total/Math.max(1,q.lbs))}/lb out</div>
              </div>
              <div style={CO.display({fontSize:30,lineHeight:1,color:"var(--ink)"})}>{plMoney(q.total)}</div>
            </div>
          </section>
        </div>

        {/* foot */}
        <div style={{padding:"14px 22px",borderTop:"1px solid var(--hairline)",display:"flex",alignItems:"center",gap:10,flexShrink:0,flexWrap:"wrap"}}>
          <Btn size="sm" variant="outline">Print run sheet</Btn>
          <Btn size="sm" variant="ghost">Packing slip</Btn>
          <div style={{flex:1}}/>
          {action
            ? <Btn size="sm" variant="primary" icon={<I name="arrow" size={14}/>} onClick={()=>onAdvance(o)}>{action}</Btn>
            : <Pill variant="matcha">Fulfilled</Pill>}
        </div>
      </aside>
    </>
  );
};

Object.assign(window, { ShopOrderDrawer, SOStagePipeline, SODrawerRow });
