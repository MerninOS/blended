// CoRoasted — Schedule view (resource/timeline)
// Rows are bookable resources (machines, packaging, coaching).
// Columns are 30-min time slots between business hours.
// Bookings render as colored blocks; clicking opens the booking drawer.

const ScheduleView = ({ tweaks, openBooking, dayKey, setDayKey }) => {
  const SLOT_W = tweaks.density === "compact" ? 60 : tweaks.density === "comfy" ? 88 : 74;
  const ROW_H  = tweaks.density === "compact" ? 64 : tweaks.density === "comfy" ? 84 : 74;
  const LABEL_W = 184;

  const hours = [];
  for (let h = FACILITY.hoursStart; h <= FACILITY.hoursEnd; h += 0.5) hours.push(h);
  const totalSlots = (FACILITY.hoursEnd - FACILITY.hoursStart) * 2;

  const dayBookings = BOOKINGS[dayKey] || [];
  const dayLabel = ({
    "2026-04-25":"Today · Sat Apr 25",
    "2026-04-26":"Tomorrow · Sun Apr 26",
    "2026-04-27":"Mon · Apr 27",
  })[dayKey] || dayKey;

  // Now indicator (faked at 10:18a today)
  const NOW_HR = 10.3;
  const showNow = dayKey === TODAY;

  const days = ["2026-04-25","2026-04-26","2026-04-27"];
  const dayIdx = days.indexOf(dayKey);

  const blockStyle = (b, res) => {
    const meta = BOOKING_TYPES[b.type];
    const left = (b.start - FACILITY.hoursStart) * 2 * SLOT_W;
    const w = (b.end - b.start) * 2 * SLOT_W;
    const isDone = b.status === "completed";
    return {
      position:"absolute",left:left+3, top:6, width:w-6, height:ROW_H-12,
      background: isDone ? "var(--color-fog)" : `var(--color-${meta.color})`,
      color: isDone ? "var(--color-espresso)" : `var(--color-${meta.fg})`,
      border:"1px solid var(--color-border)",
      borderRadius:12,
      boxShadow: b.status==="inprogress" ? "var(--shadow-md), 0 0 0 3px var(--color-sun)" : "var(--shadow-md)",
      padding:"6px 9px",cursor:"pointer",overflow:"hidden",
      display:"flex",flexDirection:"column",justifyContent:"space-between",
      transition:"all .12s var(--ease-snap)",
      textAlign:"left", fontFamily:"var(--font-body)",
      opacity: isDone ? 0.65 : 1,
    };
  };

  return (
    <div style={{padding:"16px 24px 32px",display:"flex",flexDirection:"column",gap:14}}>
      {/* Day picker + filters */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setDayKey(days[Math.max(0,dayIdx-1)])} disabled={dayIdx<=0} style={navArrow(dayIdx<=0)}><I2 name="chevL" size={16}/></button>
          <div style={{fontFamily:"var(--font-display)",fontSize:26,lineHeight:1,minWidth:280}}>{dayLabel}</div>
          <button onClick={()=>setDayKey(days[Math.min(days.length-1,dayIdx+1)])} disabled={dayIdx>=days.length-1} style={navArrow(dayIdx>=days.length-1)}><I2 name="chevR" size={16}/></button>
          <Btn size="sm" variant="outline" icon={<I2 name="today" size={14}/>} onClick={()=>setDayKey(TODAY)}>Today</Btn>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          {Object.entries(BOOKING_TYPES).filter(([k])=>k!=="storage").map(([k,m])=>(
            <span key={k} style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:11,fontWeight:700,letterSpacing:".05em"}}>
              <span style={{width:14,height:14,background:`var(--color-${m.color})`,border:"1px solid var(--color-border)",borderRadius:4}}/>
              {m.label}
            </span>
          ))}
          <div style={{width:1,height:18,background:"var(--color-fog)",margin:"0 4px"}}/>
          <Btn size="sm" variant="primary" icon={<I name="plus" size={14}/>}>New Booking</Btn>
        </div>
      </div>

      {/* Schedule grid */}
      <Panel noPadding>
        <div style={{display:"flex",fontFamily:"var(--font-body)",position:"relative"}}>
          {/* Resource label column (sticky-ish) */}
          <div style={{flexShrink:0,width:LABEL_W,borderRight:"1px solid var(--color-border)",background:"var(--color-surface)"}}>
            {/* header spacer */}
            <div style={{height:36,borderBottom:"1px solid var(--color-border)",display:"flex",alignItems:"center",padding:"0 14px",fontSize:10,fontWeight:800,letterSpacing:".12em",color:"var(--fg2)",background:"var(--color-surface)"}}>Resource</div>
            {RESOURCES.map(r=>(
              <div key={r.id} style={{height:ROW_H,borderBottom:"1px solid var(--color-fog)",padding:"0 14px",display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:32,height:32,background:`var(--color-${r.color})`,border:"1px solid var(--color-border)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",color: (r.color==="sun"||r.color==="sky"||r.color==="cream") ? "var(--color-espresso)" : "var(--color-cream)",flexShrink:0}}>
                  <I name={r.kind==="machine"?"flame":r.kind==="staff"?"users":"pkg"} size={15}/>
                </div>
                <div style={{minWidth:0}}>
                  <div style={{fontWeight:800,fontSize:12.5,lineHeight:1.1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.name}</div>
                  <div style={{fontSize:10,color:"var(--fg2)",letterSpacing:".06em",fontWeight:700,marginTop:2}}>{r.capacity} · ${r.rate}/hr</div>
                </div>
              </div>
            ))}
          </div>

          {/* Scrollable grid */}
          <div style={{flex:1,overflowX:"auto",position:"relative"}}>
            <div style={{position:"relative",width:totalSlots*SLOT_W,minWidth:"100%"}}>
              {/* Header: hours */}
              <div style={{display:"flex",height:36,borderBottom:"1px solid var(--color-border)",background:"var(--color-surface)"}}>
                {hours.slice(0,-1).map((h,i)=>{
                  const isHour = h === Math.floor(h);
                  return (
                    <div key={i} style={{
                      width:SLOT_W,height:36,display:"flex",alignItems:"center",justifyContent:"flex-start",
                      borderRight: isHour ? "1.5px solid var(--color-espresso)" : "1px dashed var(--color-fog)",
                      paddingLeft:6, fontFamily:"var(--font-mono)",
                      fontSize: isHour ? 11.5 : 9.5, fontWeight: isHour?800:600,
                      color: isHour ? "var(--color-espresso)" : "var(--fg2)",
                    }}>{isHour && fmtTime(h)}</div>
                  );
                })}
              </div>

              {/* Rows */}
              {RESOURCES.map(r=>(
                <div key={r.id} style={{
                  position:"relative",height:ROW_H,borderBottom:"1px solid var(--color-fog)",
                  backgroundImage:`repeating-linear-gradient(to right, transparent 0 ${SLOT_W*2-1}px, var(--color-fog) ${SLOT_W*2-1}px ${SLOT_W*2}px)`,
                }}>
                  {/* Sub-slot dashed lines */}
                  <div style={{position:"absolute",inset:0,backgroundImage:`repeating-linear-gradient(to right, transparent 0 ${SLOT_W-1}px, rgba(28,15,5,0.06) ${SLOT_W-1}px ${SLOT_W}px)`,pointerEvents:"none"}}/>
                  {/* Bookings */}
                  {dayBookings.filter(b=>b.resource===r.id).map(b=>{
                    const meta = BOOKING_TYPES[b.type];
                    const cust = customerById(b.customer);
                    const w = (b.end-b.start)*2*SLOT_W;
                    const showProfile = w >= 130 && tweaks.density!=="compact";
                    return (
                      <button key={b.id} onClick={()=>openBooking(b)} style={blockStyle(b,r)}
                        onMouseOver={e=>{e.currentTarget.style.transform="translate(-1.5px,-1.5px)";e.currentTarget.style.boxShadow="var(--shadow-md)"+(b.status==="inprogress"?", 0 0 0 3px var(--color-sun)":"")}}
                        onMouseOut={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="var(--shadow-md)"+(b.status==="inprogress"?", 0 0 0 3px var(--color-sun)":"")}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0}}>
                          <span style={{fontSize:9,fontWeight:900,letterSpacing:".12em",padding:"1px 5px",background:"rgba(28,15,5,0.18)",borderRadius:4}}>{meta.label}</span>
                          {b.status==="inprogress" && <Dot color="cream" pulse size={7}/>}
                          {b.recurring && <I2 name="repeat" size={11}/>}
                          {!b.paid && b.status!=="completed" && <span title="unpaid" style={{fontSize:9,fontWeight:900,letterSpacing:".08em",background:"var(--color-rail)",color:"var(--color-cream)",padding:"1px 4px",borderRadius:3}}>$</span>}
                        </div>
                        <div style={{minWidth:0}}>
                          <div style={{fontWeight:800,fontSize:12.5,lineHeight:1.05,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{cust.name}</div>
                          {showProfile && <div style={{fontSize:10.5,opacity:.85,marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{b.lot}</div>}
                        </div>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:9.5,fontWeight:700,letterSpacing:".05em"}}>
                          <span style={{fontFamily:"var(--font-mono)"}}>{fmtTime(b.start)}–{fmtTime(b.end)}</span>
                          {tweaks.showPricing && <span style={{fontFamily:"var(--font-mono)",fontWeight:800}}>${b.total}</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}

              {/* Now indicator */}
              {showNow && (
                <div style={{
                  position:"absolute", top:36, bottom:0,
                  left:(NOW_HR-FACILITY.hoursStart)*2*SLOT_W,
                  width:2, background:"var(--color-tomato)", pointerEvents:"none", zIndex:3,
                }}>
                  <div style={{position:"absolute",top:-6,left:-7,width:16,height:16,background:"var(--color-tomato)",border:"1px solid var(--color-border)",borderRadius:11999}}/>
                  <div style={{position:"absolute",top:-22,left:6,fontSize:10,fontWeight:800,letterSpacing:".12em",color:"var(--color-tomato)",fontFamily:"var(--font-body)",background:"var(--color-surface)",padding:"1px 4px",border:"1.5px solid var(--color-tomato)",borderRadius:4,whiteSpace:"nowrap"}}>Now {fmtTime(NOW_HR)}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Panel>

      {/* Quick stats below */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        <Stat label={`Bookings · ${dayKey===TODAY?"Today":"That Day"}`} value={dayBookings.length}/>
        <Stat label="Machine Hours Sold" value={dayBookings.filter(b=>RESOURCES.find(r=>r.id===b.resource)?.kind==="machine").reduce((s,b)=>s+(b.end-b.start),0).toFixed(1)+" hr"}/>
        <Stat label="Lbs On Floor" value={dayBookings.reduce((s,b)=>s+b.lbs,0)}/>
        <Stat label="Revenue · Day" value={"$"+dayBookings.reduce((s,b)=>s+b.total,0).toLocaleString()} delta={dayKey===TODAY?"+12% vs avg":null}/>
      </div>
    </div>
  );
};

const navArrow = (disabled) => ({
  width:36,height:36,border:"1px solid var(--color-border)",borderRadius:11999,
  background:disabled?"var(--color-fog)":"var(--color-cream)",cursor:disabled?"default":"pointer",
  display:"inline-flex",alignItems:"center",justifyContent:"center",
  boxShadow:disabled?"none":"var(--shadow-md)",
  color:"var(--color-espresso)",opacity:disabled?0.4:1,
});

Object.assign(window, { ScheduleView });
