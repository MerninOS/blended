// CoRoasted × CoffeeOS — Private Label order drawer (facility side).
// Slides over the chrome (z 401, matching BookingDrawer).

const PLDrawerRow = ({ k, v, mono:m=false }) => (
  <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:16,padding:"10px 0",borderBottom:"1px solid var(--hairline)"}}>
    <span style={CO.over({fontSize:9.5,color:"var(--ink-subtle)",flexShrink:0})}>{k}</span>
    <span style={m ? CO.data({fontSize:13,color:"var(--ink)",textAlign:"right"}) : {fontFamily:"var(--font-sans)",fontSize:13,color:"var(--ink)",textAlign:"right"}}>{v}</span>
  </div>
);

const PLStagePipeline = ({ stage }) => {
  const at = plaStageIdx(stage);
  return (
    <div style={{display:"flex",gap:4}}>
      {PLA_STAGES.map((s,i)=>{
        const done = i < at, on = i === at;
        return (
          <div key={s.id} style={{flex:1,minWidth:0}}>
            <div style={{height:4,borderRadius:2,background:on?"var(--brand)":done?"var(--ink)":"var(--surface-sunken)",animation:on&&stage==="roasting"?"co-pulse 1.5s ease-in-out infinite":"none"}}/>
            <div style={{marginTop:7,...CO.over({fontSize:8.5,color:on?"var(--brand)":done?"var(--ink-muted)":"var(--ink-subtle)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"})}}>{s.label}</div>
          </div>
        );
      })}
    </div>
  );
};

const PLOrderDrawer = ({ order, onClose }) => {
  if (!order) return null;
  const o = order, q = plaQuote(o), pack = q.pack, bag = q.bag;
  const price = plaPriceOf(o);
  const at = plaStageIdx(o.stage);
  const next = PLA_STAGES[at+1];
  const nextAction = {proof:"Send proof", green:"Allocate green", roasting:"Start batch", packing:"Send to packing", shipped:"Mark shipped"}[next && next.id] || null;

  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(36,24,18,.38)",zIndex:400,animation:"co-fade .14s ease"}}/>
      <aside style={{position:"fixed",top:0,right:0,bottom:0,width:"min(520px,94vw)",zIndex:401,background:"var(--surface)",borderLeft:"1px solid var(--hairline)",boxShadow:"var(--shadow-modal)",display:"flex",flexDirection:"column",animation:"co-slide .18s cubic-bezier(.2,.6,.2,1)"}}>
        {/* head */}
        <div style={{padding:"18px 22px 16px",borderBottom:"1px solid var(--hairline)",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
            <span style={{width:40,height:40,flexShrink:0,borderRadius:"var(--r-md)",background:"var(--surface-sunken)",display:"inline-flex",alignItems:"center",justifyContent:"center",color:plRampColor(o.roast)}}><I name={o.kind==="blend"?"flame":"pkg"} size={19} stroke={2}/></span>
            <div style={{flex:1,minWidth:0}}>
              <div style={CO.over({fontSize:9.5,color:"var(--ink-subtle)"})}>{o.id} · placed {o.placed}</div>
              <h2 style={CO.display({fontSize:22,lineHeight:1.05,margin:"5px 0 0",color:"var(--ink)"})}>{o.product}</h2>
              <div style={{marginTop:6,fontFamily:"var(--font-sans)",fontSize:13,color:"var(--ink-muted)"}}>{o.roaster} · {o.tier}</div>
            </div>
            <button onClick={onClose} aria-label="Close" style={{width:32,height:32,flexShrink:0,border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",background:"var(--surface)",color:"var(--ink-muted)",cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center"}}><I2 name="x" size={16} stroke={2}/></button>
          </div>
          <div style={{marginTop:18}}><PLStagePipeline stage={o.stage}/></div>
        </div>

        {/* body */}
        <div style={{flex:1,overflowY:"auto",padding:"18px 22px 24px",display:"flex",flexDirection:"column",gap:24}}>
          {o.flag && (
            <div style={{display:"flex",alignItems:"flex-start",gap:10,padding:"12px 14px",borderRadius:"var(--r-md)",background:"var(--brand-soft)",border:"1px solid var(--brand)"}}>
              <span style={{color:"var(--brand)",marginTop:1,flexShrink:0}}><I2 name="alert" size={16} stroke={2.2}/></span>
              <span style={{fontFamily:"var(--font-sans)",fontSize:12.5,lineHeight:1.5,color:"var(--ink)"}}>
                {o.flag==="proof" && <>Artwork <span style={CO.data({fontSize:12})}>{o.art}</span> is waiting on a printed proof. Nothing runs until the roaster signs off.</>}
                {o.flag==="green" && <>Green is short for this run. {(plGreen("straw")||{}).avail} lb of the limited lot left — confirm the allocation before scheduling.</>}
                {o.flag==="bags" && <>Roaster bags haven't landed. {o.ownReceived||0} of {q.bags} received, expected {o.ownEta}.</>}
              </span>
            </div>
          )}

          {/* composition */}
          <section>
            <div style={{paddingBottom:9,borderBottom:"1px solid var(--hairline-strong)"}}><span style={CO.over({fontSize:10,color:"var(--ink-muted)"})}>{o.kind==="blend"?"Blend sheet":"Coffee"}</span></div>
            {o.kind==="blend" ? (
              <>
                <div style={{display:"flex",height:8,borderRadius:2,overflow:"hidden",margin:"14px 0 12px"}}>
                  {o.sel.map(s=><span key={s.id} style={{width:s.pct+"%",background:plRampColor(plGreen(s.id).roast)}}/>)}
                </div>
                {o.sel.map(s=>{
                  const c = plGreen(s.id);
                  return (
                    <div key={s.id} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 0",borderBottom:"1px solid var(--hairline)"}}>
                      <span style={{width:10,height:10,borderRadius:"var(--r-sm)",flexShrink:0,background:plRampColor(c.roast)}}/>
                      <span style={{flex:1,minWidth:0}}>
                        <span style={{display:"block",fontFamily:"var(--font-sans)",fontSize:13,color:"var(--ink)"}}>{c.name}</span>
                        <span style={CO.data({fontSize:11,color:"var(--ink-subtle)"})}>{c.lot} · {(o.lbs*s.pct/100).toFixed(0)} lb · {c.avail.toLocaleString()} on hand</span>
                      </span>
                      <span style={CO.data({fontSize:13,color:"var(--ink)"})}>{s.pct}%</span>
                    </div>
                  );
                })}
              </>
            ) : (
              <div style={{padding:"14px 0 4px",fontFamily:"var(--font-sans)",fontSize:13,lineHeight:1.55,color:"var(--ink-muted)"}}>{(PL_STOCK.find(s=>s.id===o.skuId)||{}).blurb}</div>
            )}
            <PLDrawerRow k="Roast" v={`${plRoastName(o.roast)} · Agtron ${[75,75,67,58,50,42][Math.round(o.roast)]} · drop ${[396,396,407,417,427,436][Math.round(o.roast)]}°F`} mono/>
            <PLDrawerRow k="Run size" v={`${o.lbs} lb roasted · need by ${o.needBy}`} mono/>
          </section>

          {/* packaging */}
          <section>
            <div style={{paddingBottom:9,borderBottom:"1px solid var(--hairline-strong)"}}><span style={CO.over({fontSize:10,color:"var(--ink-muted)"})}>Packaging</span></div>
            <PLDrawerRow k="Method" v={pack.title}/>
            <PLDrawerRow k="Bags" v={`${q.bags} × ${bag.label}`} mono/>
            {o.packId==="label" && <><PLDrawerRow k="Artwork" v={o.art} mono/><PLDrawerRow k="Label size" v={o.labelSize} mono/></>}
            {o.packId==="own" && <><PLDrawerRow k="Roaster bags" v={`${o.ownReceived||0} received of ${q.bags}`} mono/><PLDrawerRow k="Arriving" v={o.ownEta} mono/></>}
            {o.packId==="stock" && <PLDrawerRow k="Sticker" v="Name, roast date, lot code" />}
          </section>

          {/* money */}
          <section>
            <div style={{paddingBottom:9,borderBottom:"1px solid var(--hairline-strong)"}}><span style={CO.over({fontSize:10,color:"var(--ink-muted)"})}>Invoice lines</span></div>
            <PLDrawerRow k={`Coffee · ${o.lbs} lb`} v={plMoney(q.coffee)} mono/>
            {q.material>0 && <PLDrawerRow k="Bag material" v={plMoney(q.material)} mono/>}
            {q.perBag>0 && <PLDrawerRow k={o.packId==="label"?"Label application":"Bag handling"} v={plMoney(q.perBag)} mono/>}
            {q.setup>0 && <PLDrawerRow k="Plate setup" v={plMoney(q.setup)} mono/>}
            <PLDrawerRow k="Fill, seal, stamp" v={plMoney(q.fill)} mono/>
            <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:16,paddingTop:14}}>
              <div>
                <div style={CO.over({fontSize:10,color:"var(--ink-muted)"})}>Order total</div>
                <div style={CO.data({fontSize:12,color:"var(--ink-subtle)",marginTop:4})}>{plMoney(price)}/lb green-in · {plMoney(q.unit)}/bag out</div>
              </div>
              <div style={CO.display({fontSize:30,lineHeight:1,color:"var(--ink)"})}>{plMoney0(q.total)}</div>
            </div>
          </section>
        </div>

        {/* foot */}
        <div style={{padding:"14px 22px",borderTop:"1px solid var(--hairline)",display:"flex",alignItems:"center",gap:10,flexShrink:0,flexWrap:"wrap"}}>
          <Btn size="sm" variant="outline">Message roaster</Btn>
          <Btn size="sm" variant="ghost">Print run sheet</Btn>
          <div style={{flex:1}}/>
          {nextAction && <Btn size="sm" variant="primary" icon={<I name="arrow" size={14}/>}>{nextAction}</Btn>}
        </div>
      </aside>
    </>
  );
};

Object.assign(window, { PLOrderDrawer, PLStagePipeline, PLDrawerRow });
