// Roaster Portal — Book view (the centerpiece)
// Schedule grid with blocked off-hours, occupied slots, and a draggable selection.

const BookView = ({ openConfirm }) => {
  const [serviceId, setServiceId] = React.useState("toll");
  const [resourceId, setResourceId] = React.useState("loring");
  const [dayIdx, setDayIdx] = React.useState(1); // tomorrow
  const [sel, setSel] = React.useState(null); // {start, end} in hours
  const [drag, setDrag] = React.useState(null);

  const day = WEEK[dayIdx];
  const dayLabel = `${FULL_DOW[dayIdx]} · Apr ${25+dayIdx <= 30 ? 25+dayIdx : (25+dayIdx-30)}${25+dayIdx>30?" · May":""}`;

  // Service → which resources are bookable
  const serviceMeta = {
    toll:    { label:"Toll Roasting",  desc:"Bring your green. Run your own roast.",       icon:"flame", color:"tomato", res:["loring","probat25","probat12"], minHr:1.0,  rate:75 },
    coroast: { label:"Co-Roast",       desc:"We pull from your shelf and roast to spec.",  icon:"coffee",color:"honey",  res:["loring","probat25","probat12"], minHr:2.0,  rate:3.5 },
    sample:  { label:"Sample Roast",   desc:"Tiny batch on the sample roaster.",           icon:"bolt",  color:"sky",    res:["sample"],                        minHr:0.5,  rate:35 },
    coach:   { label:"1:1 with Joel",  desc:"Walk through the curve and the cup.",         icon:"user",  color:"sky",    res:["coach"],                          minHr:1.0,  rate:90 },
    pack:    { label:"Packaging Line", desc:"Bag, tin-tie, label.",                        icon:"box",   color:"matcha", res:["pack"],                           minHr:0.5,  rate:45 },
  };
  const svc = serviceMeta[serviceId];
  React.useEffect(()=>{
    if (!svc.res.includes(resourceId)) setResourceId(svc.res[0]);
    setSel(null);
  },[serviceId]);

  const resource = RESOURCES.find(r=>r.id===resourceId);

  // ── Grid math ──
  const SLOT = 0.25; // 15-min slots so the dashes feel intentional
  const DAY_START = 5, DAY_END = 22; // we *display* 5a–10p so off-hours are visible
  const totalSlots = (DAY_END - DAY_START) / SLOT;
  const SLOT_W = 32;

  const occupied = (WEEK_BOOKINGS[day]||[]).filter(b => b.resource === resourceId);
  const myThatDay = (WEEK_BOOKINGS[day]||[]).filter(b => b.customer === ME);

  const slotIsOpen = (h) => {
    if (h < FACILITY.hoursStart || h >= FACILITY.hoursEnd) return false;
    return !occupied.some(b => h >= b.start && h < b.end);
  };
  const rangeIsOpen = (s,e) => {
    if (e <= s) return false;
    if (s < FACILITY.hoursStart || e > FACILITY.hoursEnd) return false;
    if (occupied.some(b => !(e <= b.start || s >= b.end))) return false;
    return true;
  };

  // Hover & drag select
  const [hover, setHover] = React.useState(null);
  const onSlotDown = (h) => {
    if (!slotIsOpen(h)) return;
    setDrag({anchor:h, start:h, end:h+SLOT});
  };
  const onSlotEnter = (h) => {
    setHover(h);
    if (drag) {
      const s = Math.min(drag.anchor, h);
      const e = Math.max(drag.anchor, h) + SLOT;
      // Don't extend through an occupied block
      if (rangeIsOpen(s,e)) setDrag({...drag, start:s, end:e});
    }
  };
  const onMouseUp = () => {
    if (drag) {
      const dur = drag.end - drag.start;
      if (dur >= svc.minHr && rangeIsOpen(drag.start, drag.end)) {
        setSel({start:drag.start, end:drag.end});
      }
      setDrag(null);
    }
  };
  React.useEffect(()=>{
    window.addEventListener("mouseup", onMouseUp);
    return ()=>window.removeEventListener("mouseup", onMouseUp);
  });

  // Quick-pick suggested slots: first N open windows of svc.minHr length
  const suggestions = (() => {
    const out = [];
    let h = FACILITY.hoursStart;
    while (h + svc.minHr <= FACILITY.hoursEnd && out.length < 4) {
      if (rangeIsOpen(h, h+svc.minHr)) {
        out.push({start:h, end:h+svc.minHr});
        h += svc.minHr;
      } else {
        h += SLOT;
      }
    }
    return out;
  })();

  // Expose setter so the shared ServicePicker (used in JobRequestFlow) can switch service IDs
  window.__setServiceId = setServiceId;

  // ── Branch: services that don't reserve a machine-block use the Job Request flow ──
  if (serviceId === "coroast" || serviceId === "pack") {
    return <JobRequestFlow serviceId={serviceId} openConfirm={openConfirm}/>;
  }

  // ── Render ──
  const dur = sel ? (sel.end - sel.start) : 0;
  const cost = sel ? svc.rate * dur : 0;

  return (
    <div style={{padding:"24px 28px 80px",display:"flex",flexDirection:"column",gap:18}}>
      {/* Hero */}
      <div style={{display:"flex",alignItems:"flex-end",gap:14}}>
        <h1 style={{fontFamily:"var(--font-display)",fontSize:54,lineHeight:1.2,textTransform:"uppercase",margin:0,letterSpacing:"-.005em"}}>Book Your Time</h1>
        <div style={{fontSize:13,color:"var(--fg2)",fontWeight:600,paddingBottom:8,maxWidth:420}}>
          Pick a service, pick a roaster, drag a window. We block off-hours and other roasters' time so you can't double-book.
        </div>
      </div>

      {/* Step 1 — Service */}
      <Step n={1} title="What do you need?">
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(190px, 1fr))",gap:10}}>
          {Object.entries(serviceMeta).map(([k,m])=>(
            <button key={k} onClick={()=>setServiceId(k)} style={{
              padding:14,border:"3px solid var(--color-espresso)",borderRadius:14,
              background:serviceId===k?`var(--color-${m.color})`:"var(--color-cream)",
              color:serviceId===k && m.color==="tomato"?"var(--color-cream)":"var(--color-espresso)",
              boxShadow:serviceId===k?"4px 4px 0 var(--color-espresso)":"2px 2px 0 var(--color-espresso)",
              transform:serviceId===k?"translate(-1.5px,-1.5px)":"none",
              textAlign:"left",cursor:"pointer",fontFamily:"var(--font-body)",
              transition:"all .12s var(--ease-snap)",display:"flex",flexDirection:"column",gap:6,
            }}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <I name={m.icon} size={18}/>
                <span style={{fontFamily:"var(--font-display)",fontSize:18,textTransform:"uppercase",lineHeight:1.2}}>{m.label}</span>
              </div>
              <div style={{fontSize:11.5,fontWeight:600,opacity:.85,lineHeight:1.35}}>{m.desc}</div>
              <div style={{fontSize:10.5,fontWeight:800,letterSpacing:".09em",textTransform:"uppercase",marginTop:2}}>
                {k==="coroast"?`$${m.rate}/lb`:`$${m.rate}/hr`} · min {m.minHr<1?`${m.minHr*60}m`:`${m.minHr}hr`}
              </div>
            </button>
          ))}
        </div>
      </Step>

      {/* Step 2 — Resource (skip if only one option) */}
      {svc.res.length > 1 && (
        <Step n={2} title="Which roaster?">
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {svc.res.map(rid=>{
              const r = RESOURCES.find(x=>x.id===rid);
              const active = rid===resourceId;
              return (
                <button key={rid} onClick={()=>{setResourceId(rid);setSel(null);}} style={{
                  padding:"11px 16px",border:"2.5px solid var(--color-espresso)",borderRadius:11,
                  background:active?"var(--color-espresso)":"var(--color-cream)",
                  color:active?"var(--color-cream)":"var(--color-espresso)",
                  boxShadow:active?"3px 3px 0 var(--color-tomato)":"2px 2px 0 var(--color-espresso)",
                  cursor:"pointer",fontFamily:"var(--font-body)",display:"flex",alignItems:"center",gap:9,
                }}>
                  <span style={{width:14,height:14,background:`var(--color-${r.color})`,border:"2px solid var(--color-espresso)",borderRadius:4}}/>
                  <span style={{fontFamily:"var(--font-display)",fontSize:18,textTransform:"uppercase",lineHeight:1.2}}>{r.name}</span>
                  <span style={{fontSize:10.5,fontWeight:800,letterSpacing:".07em",textTransform:"uppercase",opacity:.8}}>{r.capacity}</span>
                </button>
              );
            })}
          </div>
        </Step>
      )}

      {/* Step 3 — Time slot */}
      <Step n={svc.res.length>1?3:2} title="When?">
        {/* Day pager */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div style={{display:"flex",gap:6}}>
            {WEEK.map((d,i)=>{
              const dow = DOW[i];
              const date = 25+i <= 30 ? 25+i : 25+i-30;
              const active = i===dayIdx;
              const isPast = i===0; // today is "today" but we soft-disallow same-day for prototype
              return (
                <button key={d} disabled={isPast} onClick={()=>{setDayIdx(i);setSel(null);}} style={{
                  padding:"8px 12px",border:"2.5px solid var(--color-espresso)",borderRadius:9,
                  background:active?"var(--color-tomato)":isPast?"var(--color-fog)":"var(--color-cream)",
                  color:active?"var(--color-cream)":isPast?"var(--fg2)":"var(--color-espresso)",
                  cursor:isPast?"not-allowed":"pointer",fontFamily:"var(--font-body)",textAlign:"center",
                  boxShadow:active?"3px 3px 0 var(--color-espresso)":"none",
                  opacity:isPast?.55:1,minWidth:54,
                }}>
                  <div style={{fontSize:9.5,fontWeight:800,letterSpacing:".11em",textTransform:"uppercase",lineHeight:1.2}}>{dow}</div>
                  <div style={{fontFamily:"var(--font-display)",fontSize:20,lineHeight:1.2,marginTop:3}}>{date}</div>
                </button>
              );
            })}
          </div>
          <div style={{fontSize:11.5,fontWeight:700,color:"var(--fg2)",letterSpacing:".05em"}}>
            {dayLabel} · Hours {fmtTime(FACILITY.hoursStart)}–{fmtTime(FACILITY.hoursEnd)}
          </div>
        </div>

        {/* Quick suggestions */}
        {suggestions.length > 0 && (
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,flexWrap:"wrap"}}>
            <span style={{fontSize:10.5,fontWeight:800,letterSpacing:".11em",textTransform:"uppercase",color:"var(--fg2)"}}>Suggested:</span>
            {suggestions.map((s,i)=>(
              <button key={i} onClick={()=>setSel(s)} style={{
                padding:"5px 11px",borderRadius:9999,border:"2px solid var(--color-espresso)",
                background:sel && sel.start===s.start?"var(--color-sun)":"var(--color-cream)",
                cursor:"pointer",fontFamily:"var(--font-mono)",fontSize:11.5,fontWeight:800,letterSpacing:".02em",
                whiteSpace:"nowrap",lineHeight:1.4,
              }}>{fmtTime(s.start)} – {fmtTime(s.end)}</button>
            ))}
          </div>
        )}

        {/* Schedule grid */}
        <div style={{
          border:"3px solid var(--color-espresso)",borderRadius:14,background:"var(--color-cream)",
          boxShadow:"3px 3px 0 var(--color-espresso)",overflow:"hidden",userSelect:"none",
        }}>
          {/* Hour ruler */}
          <div style={{display:"flex",borderBottom:"2.5px solid var(--color-espresso)",background:"var(--color-chalk)"}}>
            <div style={{width:120,padding:"8px 10px",borderRight:"2.5px solid var(--color-espresso)",fontSize:10.5,fontWeight:800,letterSpacing:".11em",textTransform:"uppercase",color:"var(--fg2)"}}>{resource.name}</div>
            <div style={{flex:1,position:"relative",height:32,overflowX:"auto"}}>
              <div style={{position:"relative",height:"100%",width: SLOT_W * totalSlots}}>
                {Array.from({length: DAY_END - DAY_START + 1}).map((_,i)=>{
                  const h = DAY_START + i;
                  const isOpen = h >= FACILITY.hoursStart && h < FACILITY.hoursEnd;
                  return (
                    <div key={i} style={{
                      position:"absolute", left: i * (SLOT_W*4), top:0, bottom:0,
                      borderLeft: i>0?"1.5px solid var(--color-fog)":"none",
                      paddingLeft:5, display:"flex",alignItems:"center",
                      fontSize:10.5,fontWeight:800,letterSpacing:".05em",
                      color:isOpen?"var(--color-espresso)":"var(--fg2)",
                      width: SLOT_W*4,
                    }}>{fmtTime(h)}</div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Track */}
          <div style={{display:"flex"}}>
            <div style={{width:120,padding:"14px 10px",borderRight:"2.5px solid var(--color-espresso)",background:"var(--color-chalk)"}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                <span style={{width:12,height:12,background:`var(--color-${resource.color})`,border:"2px solid var(--color-espresso)",borderRadius:3}}/>
                <span style={{fontFamily:"var(--font-display)",fontSize:16,textTransform:"uppercase",lineHeight:1.2}}>{resource.name}</span>
              </div>
              <div style={{fontSize:10.5,fontWeight:700,color:"var(--fg2)",letterSpacing:".03em"}}>{resource.capacity}</div>
              <div style={{fontSize:10.5,fontWeight:800,color:"var(--color-tomato)",marginTop:6}}>${resource.rate}/hr</div>
            </div>
            <div style={{flex:1,overflowX:"auto"}}>
              <div style={{position:"relative",height:120,width: SLOT_W * totalSlots,background:"repeating-linear-gradient(90deg, transparent 0, transparent " + (SLOT_W-1) + "px, var(--color-fog) " + (SLOT_W-1) + "px, var(--color-fog) " + SLOT_W + "px)"}}>
                {/* Off-hours overlay (5a-7a, 7p-10p) */}
                <OffHoursBand left={0} width={(FACILITY.hoursStart - DAY_START) * 4 * SLOT_W} label="Closed"/>
                <OffHoursBand left={(FACILITY.hoursEnd - DAY_START) * 4 * SLOT_W} width={(DAY_END - FACILITY.hoursEnd) * 4 * SLOT_W} label="Closed"/>

                {/* Existing bookings (other roasters) */}
                {occupied.map(b=>{
                  const isMine = b.customer === ME;
                  const left = (b.start - DAY_START) * 4 * SLOT_W;
                  const width = (b.end - b.start) * 4 * SLOT_W;
                  return (
                    <div key={b.id} style={{
                      position:"absolute", top:8, bottom:8, left, width,
                      background: isMine ? "var(--color-tomato)" : "var(--color-fog)",
                      border:"2.5px solid var(--color-espresso)", borderRadius:8,
                      backgroundImage: !isMine ? "repeating-linear-gradient(135deg, transparent 0, transparent 6px, rgba(28,15,5,.18) 6px, rgba(28,15,5,.18) 9px)" : null,
                      padding:"6px 8px", color: isMine?"var(--color-cream)":"var(--fg1)", overflow:"hidden",
                      display:"flex",flexDirection:"column",justifyContent:"center",pointerEvents:"none",
                    }}>
                      <div style={{fontSize:10.5,fontWeight:800,letterSpacing:".05em",textTransform:"uppercase",lineHeight:1.2}}>
                        {isMine ? "Your booking" : "Reserved"}
                      </div>
                      <div style={{fontSize:9.5,fontWeight:700,opacity:.85,marginTop:2,whiteSpace:"nowrap",textOverflow:"ellipsis",overflow:"hidden"}}>
                        {fmtTime(b.start)}–{fmtTime(b.end)}{isMine?` · ${b.lot}`:""}
                      </div>
                    </div>
                  );
                })}

                {/* Selection / drag */}
                {(drag || sel) && (() => {
                  const s = drag ? drag.start : sel.start;
                  const e = drag ? drag.end   : sel.end;
                  const left = (s - DAY_START) * 4 * SLOT_W;
                  const width = (e - s) * 4 * SLOT_W;
                  const ok = rangeIsOpen(s,e) && (e-s) >= svc.minHr;
                  return (
                    <div style={{
                      position:"absolute", top:6, bottom:6, left, width,
                      background:`var(--color-${svc.color})`, border:"3px solid var(--color-espresso)", borderRadius:10,
                      boxShadow:"3px 3px 0 var(--color-espresso)",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      color: svc.color==="tomato" ? "var(--color-cream)" : "var(--color-espresso)",
                      pointerEvents:"none", opacity: ok?1:.5,
                    }}>
                      <div style={{textAlign:"center",lineHeight:1.2}}>
                        <div style={{fontFamily:"var(--font-display)",fontSize:15,textTransform:"uppercase"}}>{fmtTime(s)} – {fmtTime(e)}</div>
                        <div style={{fontSize:10,fontWeight:800,letterSpacing:".09em",textTransform:"uppercase",opacity:.85,marginTop:2}}>
                          {(e-s).toFixed(2).replace(/\.00$/,"")} hr · {svc.label}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Click-targets — 15-min slots */}
                {Array.from({length: totalSlots}).map((_,i)=>{
                  const h = DAY_START + i*SLOT;
                  const open = slotIsOpen(h);
                  return (
                    <div key={i}
                      onMouseDown={()=>onSlotDown(h)}
                      onMouseEnter={()=>onSlotEnter(h)}
                      style={{
                        position:"absolute", top:0, bottom:0,
                        left: i*SLOT_W, width: SLOT_W,
                        cursor: open ? "crosshair" : "not-allowed",
                        background: hover===h && open && !drag ? "rgba(232,68,42,.12)" : "transparent",
                      }}/>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div style={{display:"flex",alignItems:"center",gap:14,padding:"8px 14px",borderTop:"2px solid var(--color-fog)",background:"var(--color-chalk)",fontSize:11,fontWeight:700}}>
            <Legend swatch={<span style={{width:14,height:14,background:"var(--color-fog)",border:"2px solid var(--color-espresso)",borderRadius:3,backgroundImage:"repeating-linear-gradient(135deg, transparent 0, transparent 4px, rgba(28,15,5,.18) 4px, rgba(28,15,5,.18) 6px)"}}/>} label="Reserved"/>
            <Legend swatch={<span style={{width:14,height:14,background:"#1c0f05",border:"2px solid var(--color-espresso)",borderRadius:3,backgroundImage:"repeating-linear-gradient(135deg, transparent 0, transparent 4px, rgba(255,255,255,.08) 4px, rgba(255,255,255,.08) 6px)"}}/>} label="Closed (off-hours)"/>
            <Legend swatch={<span style={{width:14,height:14,background:"var(--color-tomato)",border:"2px solid var(--color-espresso)",borderRadius:3}}/>} label="Your bookings"/>
            <Legend swatch={<span style={{width:14,height:14,background:"var(--color-cream)",border:"2px dashed var(--color-espresso)",borderRadius:3}}/>} label="Drag to select"/>
          </div>
        </div>
      </Step>

      {/* Confirm bar */}
      <div style={{
        position:"sticky",bottom:14,background:"var(--color-cream)",border:"3px solid var(--color-espresso)",borderRadius:14,
        boxShadow:"4px 4px 0 var(--color-espresso)",padding:"14px 18px",display:"flex",alignItems:"center",gap:14,
      }}>
        <div style={{flex:1,display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:46,height:46,background:`var(--color-${svc.color})`,border:"2.5px solid var(--color-espresso)",borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",color:svc.color==="tomato"?"var(--color-cream)":"var(--color-espresso)"}}>
            <I name={svc.icon} size={20}/>
          </div>
          <div>
            <div style={{fontFamily:"var(--font-display)",fontSize:22,textTransform:"uppercase",lineHeight:1.2}}>
              {svc.label} · {resource.name}
            </div>
            <div style={{fontSize:12,fontWeight:700,color:"var(--fg2)",marginTop:5}}>
              {sel
                ? `${dayLabel} · ${fmtTime(sel.start)} – ${fmtTime(sel.end)} · ${(sel.end-sel.start).toFixed(2).replace(/\.00$/,"")} hr`
                : "Pick a time on the schedule above."}
            </div>
          </div>
        </div>
        {sel && serviceId !== "coroast" && (
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"var(--font-display)",fontSize:30,color:"var(--color-tomato)",lineHeight:1.2}}>${cost.toFixed(0)}</div>
            <div style={{fontSize:9.5,fontWeight:800,letterSpacing:".11em",textTransform:"uppercase",color:"var(--fg2)"}}>est. total</div>
          </div>
        )}
        {sel && serviceId === "coroast" && (
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"var(--font-display)",fontSize:24,color:"var(--color-tomato)",lineHeight:1.2}}>${svc.rate.toFixed(2)}/lb</div>
            <div style={{fontSize:9.5,fontWeight:800,letterSpacing:".11em",textTransform:"uppercase",color:"var(--fg2)"}}>billed by weight</div>
          </div>
        )}
        <Btn variant="primary" disabled={!sel} onClick={()=>openConfirm({serviceId, resourceId, day, dayLabel, sel, svc})}>
          {sel ? "Continue →" : "Pick a time"}
        </Btn>
      </div>
    </div>
  );
};

const Step = ({n, title, children}) => (
  <section>
    <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:11}}>
      <span style={{width:26,height:26,borderRadius:9999,background:"var(--color-espresso)",color:"var(--color-cream)",display:"inline-flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--font-display)",fontSize:15}}>{n}</span>
      <h2 style={{fontFamily:"var(--font-display)",fontSize:24,textTransform:"uppercase",margin:0,lineHeight:1.2}}>{title}</h2>
    </div>
    {children}
  </section>
);

const OffHoursBand = ({left, width, label}) => width > 0 && (
  <div style={{
    position:"absolute", top:0, bottom:0, left, width,
    background:"#1c0f05",
    backgroundImage:"repeating-linear-gradient(135deg, transparent 0, transparent 5px, rgba(255,255,255,.08) 5px, rgba(255,255,255,.08) 8px)",
    borderRight:"2px dashed var(--color-cream)",
    display:"flex",alignItems:"center",justifyContent:"center",
    color:"var(--color-cream)",fontSize:10,fontWeight:800,letterSpacing:".15em",textTransform:"uppercase",
    pointerEvents:"none",
  }}>{width>60?label:""}</div>
);

const Legend = ({swatch,label}) => (
  <span style={{display:"inline-flex",alignItems:"center",gap:6}}>{swatch}<span>{label}</span></span>
);

Object.assign(window, { BookView });
