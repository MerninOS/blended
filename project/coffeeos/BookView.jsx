// Roaster Portal × CoffeeOS — Book view (centerpiece).
// Worksheet layout: service picker, roaster picker, ruled schedule grid with
// drag-select, sticky confirm bar. Roast ramp encodes services; red = live
// selection; ink = action. Logic/grid math unchanged from the original.

// over / mono / disp / Step / SVC_DOT come from coffeeos/PortalPrimitives.jsx
const BookView = ({ openConfirm }) => {
  const [serviceId, setServiceId] = React.useState("toll");
  const [resourceId, setResourceId] = React.useState("loring");
  const [dayIdx, setDayIdx] = React.useState(1);
  const [sel, setSel] = React.useState(null);
  const [drag, setDrag] = React.useState(null);
  const narrow = useNarrow();

  const day = WEEK[dayIdx];
  const dayLabel = `${FULL_DOW[dayIdx]} · Apr ${25+dayIdx <= 30 ? 25+dayIdx : (25+dayIdx-30)}${25+dayIdx>30?" · May":""}`;

  const serviceMeta = {
    toll:    { label:"Toll roasting",  desc:"Bring your green. Run your own roast.",       icon:"flame",  res:["loring","probat25","probat12"], minHr:1.0,  rate:75 },
    coroast: { label:"Co-roast",       desc:"We pull from your shelf and roast to spec.",  icon:"coffee", res:["loring","probat25","probat12"], minHr:2.0,  rate:3.5 },
    sample:  { label:"Sample roast",   desc:"Tiny batch on the sample roaster.",           icon:"bolt",   res:["sample"],                        minHr:0.5,  rate:35 },
    coach:   { label:"1:1 with Joel",  desc:"Walk through the curve and the cup.",         icon:"user",   res:["coach"],                          minHr:1.0,  rate:90 },
    pack:    { label:"Packaging line", desc:"Bag, tin-tie, label.",                        icon:"box",    res:["pack"],                           minHr:0.5,  rate:45 },
  };
  const svc = serviceMeta[serviceId];
  React.useEffect(()=>{ if (!svc.res.includes(resourceId)) setResourceId(svc.res[0]); setSel(null); },[serviceId]);
  const resource = RESOURCES.find(r=>r.id===resourceId);

  const SLOT = 0.25, DAY_START = 5, DAY_END = 22;
  const totalSlots = (DAY_END - DAY_START) / SLOT, SLOT_W = 32;
  const occupied = (WEEK_BOOKINGS[day]||[]).filter(b => b.resource === resourceId);

  const slotIsOpen = (h) => h>=FACILITY.hoursStart && h<FACILITY.hoursEnd && !occupied.some(b => h>=b.start && h<b.end);
  const rangeIsOpen = (s,e) => e>s && s>=FACILITY.hoursStart && e<=FACILITY.hoursEnd && !occupied.some(b => !(e<=b.start || s>=b.end));

  const [hover, setHover] = React.useState(null);
  const onSlotDown = (h) => { if (slotIsOpen(h)) setDrag({anchor:h, start:h, end:h+SLOT}); };
  const onSlotEnter = (h) => { setHover(h); if (drag){ const s=Math.min(drag.anchor,h), e=Math.max(drag.anchor,h)+SLOT; if (rangeIsOpen(s,e)) setDrag({...drag,start:s,end:e}); } };
  const onMouseUp = () => { if (drag){ const dur=drag.end-drag.start; if (dur>=svc.minHr && rangeIsOpen(drag.start,drag.end)) setSel({start:drag.start,end:drag.end}); setDrag(null); } };
  React.useEffect(()=>{ window.addEventListener("mouseup", onMouseUp); return ()=>window.removeEventListener("mouseup", onMouseUp); });

  const suggestions = (() => { const out=[]; let h=FACILITY.hoursStart; while (h+svc.minHr<=FACILITY.hoursEnd && out.length<4){ if (rangeIsOpen(h,h+svc.minHr)){ out.push({start:h,end:h+svc.minHr}); h+=svc.minHr; } else h+=SLOT; } return out; })();

  window.__setServiceId = setServiceId;
  if (serviceId === "coroast" || serviceId === "pack") return <JobRequestFlow serviceId={serviceId} openConfirm={openConfirm}/>;

  const dur = sel ? (sel.end - sel.start) : 0;
  const cost = sel ? svc.rate * dur : 0;

  return (
    <div className="pv-page" style={{maxWidth:"var(--content-max)",margin:"0 auto",padding:"24px 24px 96px",display:"flex",flexDirection:"column",gap:24}}>
      {/* Hero */}
      <div>
        <h1 style={{...disp,fontSize:"clamp(28px,3vw,40px)",lineHeight:1,margin:0,color:"var(--ink)"}}>Book time</h1>
        <p className="pv-lede" style={{fontFamily:"var(--font-sans)",fontSize:14,color:"var(--ink-muted)",marginTop:8,maxWidth:560}}>{" "}{narrow?"Pick a service, pick a roaster, tap an open time.":"Pick a service, pick a roaster, drag a window."} Off-hours and other roasters' time are blocked so you can't double-book.</p>
      </div>

      {/* Step 1 — Service */}
      <Step n={1} title="What do you need?">
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",gap:10}}>
          {Object.entries(serviceMeta).map(([k,m])=>{
            const on = serviceId===k;
            return (
              <button key={k} className="opt-card" onClick={()=>setServiceId(k)} style={{
                padding:14,border:on?"1.5px solid var(--brand)":"1px solid var(--hairline)",borderRadius:"var(--r-md)",
                background:on?"var(--brand-soft)":"var(--surface)",color:"var(--ink)",textAlign:"left",cursor:"pointer",
                fontFamily:"var(--font-sans)",display:"flex",flexDirection:"column",gap:7,transition:"all var(--dur) var(--ease)",
              }}>
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  <span className="opt-ico" style={{width:30,height:30,borderRadius:"var(--r-md)",background:on?"var(--surface)":"var(--surface-sunken)",display:"inline-flex",alignItems:"center",justifyContent:"center",color:SVC_DOT[k],flexShrink:0}}><I name={m.icon} size={17} stroke={2}/></span>
                  <span className="opt-title" style={{...disp,fontSize:15,color:"var(--ink)",lineHeight:1.05}}>{m.label}</span>
                </div>
                <div className="opt-desc" style={{fontSize:12,color:"var(--ink-muted)",lineHeight:1.4}}>{m.desc}</div>
                <div className="opt-meta" style={{...over,fontSize:10,color:"var(--ink-subtle)",marginTop:2}}>{k==="coroast"?`$${m.rate}/lb · min 10 lb`:`$${m.rate}/hr · min ${m.minHr<1?`${m.minHr*60}m`:`${m.minHr}hr`}`}</div>
              </button>
            );
          })}
        </div>
      </Step>

      {/* Step 2 — Resource */}
      {svc.res.length > 1 && (
        <Step n={2} title="Which roaster?">
          <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
            {svc.res.map(rid=>{
              const r = RESOURCES.find(x=>x.id===rid), on = rid===resourceId;
              return (
                <button key={rid} onClick={()=>{setResourceId(rid);setSel(null);}} style={{
                  padding:"9px 14px",border:on?"1px solid var(--ink)":"1px solid var(--hairline-strong)",borderRadius:"var(--r-md)",
                  background:on?"var(--ink)":"var(--surface)",color:on?"var(--on-ink)":"var(--ink)",cursor:"pointer",
                  fontFamily:"var(--font-sans)",display:"flex",alignItems:"center",gap:9,
                }}>
                  <span style={{width:11,height:11,borderRadius:"var(--r-sm)",background:SVC_DOT[serviceId],flexShrink:0}}/>
                  <span style={{fontWeight:600,fontSize:13.5}}>{r.name}</span>
                  <span style={{...mono,fontSize:11,opacity:.7}}>{r.capacity}</span>
                </button>
              );
            })}
          </div>
        </Step>
      )}

      {/* Step 3 — Time */}
      <Step n={svc.res.length>1?3:2} title="When?">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:12,flexWrap:"wrap"}}>
          <div className="bv-days" style={{display:"flex",gap:6}}>
            {WEEK.map((d,i)=>{
              const dow=DOW[i], date=25+i<=30?25+i:25+i-30, active=i===dayIdx, isPast=i===0;
              return (
                <button key={d} disabled={isPast} onClick={()=>{setDayIdx(i);setSel(null);}} style={{
                  padding:"7px 11px",border:"1px solid",borderColor:active?"var(--ink)":"var(--hairline)",borderRadius:"var(--r-md)",
                  background:active?"var(--ink)":isPast?"var(--surface-sunken)":"var(--surface)",
                  color:active?"var(--on-ink)":isPast?"var(--ink-subtle)":"var(--ink)",
                  cursor:isPast?"not-allowed":"pointer",fontFamily:"var(--font-sans)",textAlign:"center",minWidth:52,opacity:isPast?.6:1,
                }}>
                  <div style={{...over,fontSize:9,opacity:.8,lineHeight:1.2}}>{dow}</div>
                  <div style={{...mono,fontSize:17,lineHeight:1.2,marginTop:3}}>{date}</div>
                </button>
              );
            })}
          </div>
          <div style={{fontSize:12,color:"var(--ink-muted)",fontFamily:"var(--font-sans)"}}>{dayLabel} · Hours <span style={mono}>{fmtTime(FACILITY.hoursStart)}–{fmtTime(FACILITY.hoursEnd)}</span></div>
        </div>

        {suggestions.length > 0 && !narrow && (
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,flexWrap:"wrap"}}>
            <span style={{...over,fontSize:10,color:"var(--ink-subtle)"}}>Suggested</span>
            {suggestions.map((s,i)=>{
              const on = sel && sel.start===s.start;
              return <button key={i} onClick={()=>setSel(s)} style={{padding:"5px 11px",borderRadius:"var(--r-pill)",border:on?"1px solid var(--brand)":"1px solid var(--hairline-strong)",background:on?"var(--brand-soft)":"var(--surface)",color:on?"var(--brand)":"var(--ink)",cursor:"pointer",...mono,fontSize:11.5,whiteSpace:"nowrap"}}>{fmtTime(s.start)} – {fmtTime(s.end)}</button>;
            })}
          </div>
        )}

        {/* Grid — desktop drag-select; phones get the tap picker below */}
        {narrow ? (
          <TapTimePicker svc={svc} sel={sel} setSel={setSel} occupied={occupied} rangeIsOpen={rangeIsOpen} SLOT={SLOT}/>
        ) : (
        <div style={{border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",background:"var(--surface)",overflow:"hidden",userSelect:"none"}}>
          <div style={{display:"flex",borderBottom:"1px solid var(--hairline)",background:"var(--surface-sunken)"}}>
            <div className="bv-reslabel" style={{width:132,padding:"9px 12px",borderRight:"1px solid var(--hairline)",...over,fontSize:10,color:"var(--ink-muted)"}}>{resource.name}</div>
            <div style={{flex:1,position:"relative",height:32,overflowX:"auto"}}>
              <div style={{position:"relative",height:"100%",width: SLOT_W * totalSlots}}>
                {Array.from({length: DAY_END - DAY_START + 1}).map((_,i)=>{
                  const h=DAY_START+i, isOpen=h>=FACILITY.hoursStart && h<FACILITY.hoursEnd;
                  return <div key={i} style={{position:"absolute",left:i*(SLOT_W*4),top:0,bottom:0,borderLeft:i>0?"1px solid var(--hairline)":"none",paddingLeft:5,display:"flex",alignItems:"center",...mono,fontSize:10,color:isOpen?"var(--ink-muted)":"var(--ink-subtle)",width:SLOT_W*4}}>{fmtTime(h)}</div>;
                })}
              </div>
            </div>
          </div>
          <div style={{display:"flex"}}>
            <div className="bv-reslabel" style={{width:132,padding:"14px 12px",borderRight:"1px solid var(--hairline)",background:"var(--surface-sunken)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <span style={{width:12,height:12,background:SVC_DOT[serviceId],borderRadius:"var(--r-sm)",flexShrink:0}}/>
                <span style={{...disp,fontSize:14,color:"var(--ink)",lineHeight:1.1}}>{resource.name}</span>
              </div>
              <div style={{...mono,fontSize:11,color:"var(--ink-muted)"}}>{resource.capacity}</div>
              <div style={{...mono,fontSize:12,color:"var(--ink)",marginTop:7}}>${resource.rate}/hr</div>
            </div>
            <div style={{flex:1,overflowX:"auto"}}>
              <div style={{position:"relative",height:120,width:SLOT_W*totalSlots,backgroundImage:"repeating-linear-gradient(90deg, transparent 0, transparent "+(SLOT_W-1)+"px, var(--hairline) "+(SLOT_W-1)+"px, var(--hairline) "+SLOT_W+"px)"}}>
                <OffHoursBand left={0} width={(FACILITY.hoursStart-DAY_START)*4*SLOT_W} label="Closed"/>
                <OffHoursBand left={(FACILITY.hoursEnd-DAY_START)*4*SLOT_W} width={(DAY_END-FACILITY.hoursEnd)*4*SLOT_W} label="Closed"/>
                {occupied.map(b=>{
                  const isMine=b.customer===ME, left=(b.start-DAY_START)*4*SLOT_W, width=(b.end-b.start)*4*SLOT_W;
                  const lvl = roastLevel(b.profile||"");
                  return (
                    <div key={b.id} style={{position:"absolute",top:8,bottom:8,left,width,
                      background:isMine?"var(--brand-soft)":"var(--surface-sunken)",
                      border:isMine?"1px solid var(--brand)":"1px solid var(--hairline-strong)",borderRadius:"var(--r-sm)",
                      backgroundImage:!isMine?"repeating-linear-gradient(135deg, transparent 0, transparent 5px, rgba(36,24,18,.06) 5px, rgba(36,24,18,.06) 8px)":null,
                      padding:"5px 8px",overflow:"hidden",display:"flex",flexDirection:"column",justifyContent:"center",gap:2,pointerEvents:"none"}}>
                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                        {isMine && <span style={{width:6,height:6,borderRadius:"var(--r-sm)",background:roastColor(lvl),flexShrink:0}}/>}
                        <span style={{...over,fontSize:9,color:isMine?"var(--brand)":"var(--ink-muted)",whiteSpace:"nowrap"}}>{isMine?"Your booking":"Reserved"}</span>
                      </div>
                      <div style={{...mono,fontSize:9.5,color:"var(--ink-muted)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{fmtTime(b.start)}–{fmtTime(b.end)}{isMine?` · ${b.lot}`:""}</div>
                    </div>
                  );
                })}
                {(drag || sel) && (() => {
                  const s=drag?drag.start:sel.start, e=drag?drag.end:sel.end;
                  const left=(s-DAY_START)*4*SLOT_W, width=(e-s)*4*SLOT_W, ok=rangeIsOpen(s,e)&&(e-s)>=svc.minHr;
                  return (
                    <div style={{position:"absolute",top:6,bottom:6,left,width,background:"var(--brand-soft)",border:"1.5px solid var(--brand)",borderRadius:"var(--r-md)",display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",opacity:ok?1:.5}}>
                      <div style={{textAlign:"center",lineHeight:1.2}}>
                        <div style={{...mono,fontSize:13,color:"var(--brand)",fontWeight:600}}>{fmtTime(s)} – {fmtTime(e)}</div>
                        <div style={{...over,fontSize:9,color:"var(--brand)",marginTop:2}}>{(e-s).toFixed(2).replace(/\.00$/,"")} hr · {svc.label}</div>
                      </div>
                    </div>
                  );
                })()}
                {Array.from({length: totalSlots}).map((_,i)=>{
                  const h=DAY_START+i*SLOT, open=slotIsOpen(h);
                  return <div key={i} onMouseDown={()=>onSlotDown(h)} onMouseEnter={()=>onSlotEnter(h)} onClick={()=>{ if (rangeIsOpen(h,h+svc.minHr)) setSel({start:h,end:h+svc.minHr}); }} style={{position:"absolute",top:0,bottom:0,left:i*SLOT_W,width:SLOT_W,cursor:open?"crosshair":"not-allowed",background:hover===h&&open&&!drag?"var(--brand-soft)":"transparent"}}/>;
                })}
              </div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:16,padding:"9px 14px",borderTop:"1px solid var(--hairline)",background:"var(--surface-sunken)"}}>
            <Legend swatch={<span style={{width:13,height:13,background:"var(--surface-sunken)",border:"1px solid var(--hairline-strong)",borderRadius:"var(--r-sm)",backgroundImage:"repeating-linear-gradient(135deg, transparent 0, transparent 3px, rgba(36,24,18,.1) 3px, rgba(36,24,18,.1) 5px)"}}/>} label="Reserved"/>
            <Legend swatch={<span style={{width:13,height:13,background:"var(--surface-sunken)",border:"1px solid var(--hairline-strong)",borderRadius:"var(--r-sm)",backgroundImage:"repeating-linear-gradient(135deg, transparent 0, transparent 3px, rgba(36,24,18,.18) 3px, rgba(36,24,18,.18) 5px)"}}/>} label="Closed"/>
            <Legend swatch={<span style={{width:13,height:13,background:"var(--brand-soft)",border:"1px solid var(--brand)",borderRadius:"var(--r-sm)"}}/>} label="Your bookings"/>
            <Legend swatch={<span style={{width:13,height:13,background:"var(--surface)",border:"1px dashed var(--ink-subtle)",borderRadius:"var(--r-sm)"}}/>} label="Drag to select"/>
          </div>
        </div>
        )}
      </Step>

      {/* Confirm bar */}
      <div className="co-confirmbar" style={{position:"sticky",bottom:16,background:"var(--surface)",border:"1px solid var(--hairline)",borderRadius:"var(--r-lg)",boxShadow:"var(--shadow-pop)",padding:"14px 18px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div style={{flex:1,display:"flex",alignItems:"center",gap:14,minWidth:0}}>
          <div className="cb-icon" style={{width:44,height:44,background:"var(--surface-sunken)",borderRadius:"var(--r-md)",display:"flex",alignItems:"center",justifyContent:"center",color:SVC_DOT[serviceId],flexShrink:0}}><I name={svc.icon} size={20} stroke={2}/></div>
          <div style={{minWidth:0}}>
            <div className="cb-title" style={{...disp,fontSize:18,color:"var(--ink)",lineHeight:1.1}}>{svc.label} · {resource.name}</div>
            <div className="cb-meta" style={{fontSize:12.5,color:"var(--ink-muted)",fontFamily:"var(--font-sans)",marginTop:4}}>{sel?<span style={mono}>{dayLabel} · {fmtTime(sel.start)} – {fmtTime(sel.end)} · {(sel.end-sel.start).toFixed(2).replace(/\.00$/,"")} hr</span>:"Pick a time on the schedule above."}</div>
          </div>
        </div>
        {sel && (
          <div className="cb-price" style={{textAlign:"right",flexShrink:0}}>
            <div className="cb-figure" style={{...disp,fontSize:28,color:"var(--ink)",lineHeight:1}}>{serviceId==="coroast"?`$${svc.rate.toFixed(2)}/lb`:`$${cost.toFixed(0)}`}</div>
            <div style={{...over,fontSize:9,color:"var(--ink-subtle)",marginTop:3}}>{serviceId==="coroast"?"billed by weight":"est. total"}</div>
          </div>
        )}
        <Btn variant="primary" size="lg" disabled={!sel} icon={<I name="arrow" size={15} stroke={2}/>} onClick={()=>openConfirm({serviceId, resourceId, day, dayLabel, sel, svc})}>{sel?"Continue":"Pick a time"}</Btn>
      </div>
    </div>
  );
};

// Phones can't drag-select. Duration stepper + a tappable list of legal start
// times gives the same reach in two taps, with no horizontal scrolling.
const useNarrow = () => {
  const [n, setN] = React.useState(() => window.matchMedia("(max-width:860px)").matches);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width:860px)");
    const on = e => setN(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return n;
};

const PARTS = [{key:"Morning",from:0,to:12},{key:"Afternoon",from:12,to:17},{key:"Evening",from:17,to:24}];

const TapTimePicker = ({ svc, sel, setSel, occupied, rangeIsOpen, SLOT }) => {
  const step = svc.minHr;
  const [dur, setDur] = React.useState(step);
  React.useEffect(()=>{ setDur(step); },[step]);
  React.useEffect(()=>{ if (sel && Math.abs((sel.end-sel.start)-dur) > 1e-9) setSel(null); },[dur]);

  const maxDur = 8;
  const starts = [];
  for (let h=FACILITY.hoursStart; h+dur<=FACILITY.hoursEnd; h+=SLOT*2) starts.push(h);
  const legal = starts.filter(h => rangeIsOpen(h, h+dur));

  const pill = (label, active, disabled, onClick) => (
    <button key={label} disabled={disabled} onClick={onClick} style={{
      padding:"11px 6px",minHeight:46,borderRadius:"var(--r-md)",cursor:disabled?"not-allowed":"pointer",
      border:active?"1.5px solid var(--brand)":"1px solid var(--hairline-strong)",
      background:active?"var(--brand-soft)":disabled?"var(--surface-sunken)":"var(--surface)",
      color:active?"var(--brand)":disabled?"var(--ink-subtle)":"var(--ink)",
      ...mono,fontSize:13,whiteSpace:"nowrap",opacity:disabled?.55:1,transition:"all var(--dur) var(--ease)",
    }}>{label}</button>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Duration */}
      <div style={{border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",background:"var(--surface)",padding:"13px 14px",display:"flex",alignItems:"center",gap:12}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{...over,fontSize:9.5,color:"var(--ink-subtle)"}}>How long</div>
          <div style={{...disp,fontSize:19,color:"var(--ink)",lineHeight:1.1,marginTop:3}}>{dur<1?`${Math.round(dur*60)} min`:`${(+dur.toFixed(2)+"").replace(/\.00$/,"")} hr`}</div>
        </div>
        <div style={{display:"flex",gap:8,flexShrink:0}}>
          {[["−",()=>setDur(d=>Math.max(step,+(d-step).toFixed(2))),dur<=step],["+",()=>setDur(d=>Math.min(maxDur,+(d+step).toFixed(2))),dur>=maxDur]].map(([lbl,fn,off])=>(
            <button key={lbl} disabled={off} onClick={fn} style={{width:44,height:44,borderRadius:"var(--r-md)",border:"1px solid var(--hairline-strong)",background:off?"var(--surface-sunken)":"var(--surface)",color:off?"var(--ink-subtle)":"var(--ink)",cursor:off?"not-allowed":"pointer",...disp,fontSize:20,lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center"}}>{lbl}</button>
          ))}
        </div>
      </div>

      {/* Start times */}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{...over,fontSize:9.5,color:"var(--ink-subtle)"}}>Start time · {legal.length} open</div>
        <div style={{fontFamily:"var(--font-sans)",fontSize:12,color:"var(--ink-muted)",lineHeight:1.5,marginTop:-8}}>Greyed times are reserved or too close to closing.</div>
        {PARTS.map(p=>{
          const inPart = starts.filter(h=>h>=p.from && h<p.to);
          if (!inPart.length) return null;
          return (
            <div key={p.key} style={{display:"flex",flexDirection:"column",gap:8}}>
              <div style={{fontFamily:"var(--font-sans)",fontSize:12,fontWeight:600,color:"var(--ink-muted)"}}>{p.key}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(84px,1fr))",gap:8}}>
                {inPart.map(h=>pill(fmtTime(h), sel&&Math.abs(sel.start-h)<1e-9, !rangeIsOpen(h,h+dur), ()=>setSel({start:h,end:h+dur})))}
              </div>
            </div>
          );
        })}
        {!legal.length && <div style={{fontFamily:"var(--font-sans)",fontSize:13,color:"var(--ink-muted)",lineHeight:1.5}}>No {dur<1?`${Math.round(dur*60)}-minute`:`${dur}-hour`} window left on this day. Try a shorter run or another day.</div>}
      </div>

      {/* Booked, for context */}
      {occupied.length > 0 && (
        <div style={{border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",background:"var(--surface-sunken)",padding:"11px 13px",display:"flex",flexDirection:"column",gap:7}}>
          <div style={{...over,fontSize:9.5,color:"var(--ink-subtle)"}}>Already booked</div>
          {occupied.slice().sort((a,b)=>a.start-b.start).map(b=>(
            <div key={b.id} style={{display:"flex",alignItems:"center",gap:9,fontFamily:"var(--font-sans)",fontSize:12,color:"var(--ink-muted)"}}>
              <span style={{width:7,height:7,borderRadius:"var(--r-sm)",background:b.customer===ME?"var(--brand)":"var(--ink-subtle)",flexShrink:0}}/>
              <span style={{...mono,color:"var(--ink)"}}>{fmtTime(b.start)}–{fmtTime(b.end)}</span>
              <span>{b.customer===ME?"Your booking":"Reserved"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const OffHoursBand = ({left, width, label}) => width > 0 && (
  <div style={{position:"absolute",top:0,bottom:0,left,width,background:"var(--surface-sunken)",backgroundImage:"repeating-linear-gradient(135deg, transparent 0, transparent 4px, rgba(36,24,18,.07) 4px, rgba(36,24,18,.07) 7px)",borderRight:"1px dashed var(--hairline-strong)",display:"flex",alignItems:"center",justifyContent:"center",...over,fontSize:9,color:"var(--ink-subtle)",pointerEvents:"none"}}>{width>60?label:""}</div>
);
const Legend = ({swatch,label}) => <span style={{display:"inline-flex",alignItems:"center",gap:6,fontFamily:"var(--font-sans)",fontSize:12,color:"var(--ink-muted)"}}>{swatch}{label}</span>;

Object.assign(window, { BookView, OffHoursBand, Legend, TapTimePicker, useNarrow });
