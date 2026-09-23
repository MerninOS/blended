// CoRoasted — Today (operational dashboard) + Booking drawer

const TodayView = ({ openBooking, goSchedule, goPayments }) => {
  const dayBookings = BOOKINGS[TODAY];
  const NOW_HR = 10.3;
  const onFloor = dayBookings.filter(b => b.start <= NOW_HR && b.end >= NOW_HR && b.status!=="needs-signoff");
  // Sessions whose scheduled end has passed but floor manager never marked complete.
  // Auto-complete after a grace window (default 30m past end) but flag for sign-off.
  const GRACE_HR = 0.5;
  const needsSignoff = dayBookings.filter(b => b.end < NOW_HR && (b.status==="in-progress" || b.status==="inprogress"));
  const upNext  = dayBookings.filter(b => b.start > NOW_HR).sort((a,b)=>a.start-b.start).slice(0,5);
  const lbsToday = dayBookings.reduce((s,b)=>s+b.lbs,0);
  const revToday = dayBookings.reduce((s,b)=>s+b.total,0);
  const unpaidToday = dayBookings.filter(b=>!b.paid).reduce((s,b)=>s+b.total,0);
  const machineHours = dayBookings.filter(b=>RESOURCES.find(r=>r.id===b.resource)?.kind==="machine").reduce((s,b)=>s+(b.end-b.start),0);
  const utilization = Math.round((machineHours/((FACILITY.hoursEnd-FACILITY.hoursStart)*4))*100); // 4 machines

  // Rev split by service type
  const byType = {};
  dayBookings.forEach(b => byType[b.type] = (byType[b.type]||0) + b.total);
  const totalRev = Object.values(byType).reduce((a,b)=>a+b,0);

  return (
    <div style={{padding:"16px 24px 32px",display:"flex",flexDirection:"column",gap:16}}>
      {/* Auto-completion safety net */}
      {needsSignoff.length>0 && <SignoffBanner sessions={needsSignoff} openBooking={openBooking}/>}

      {/* Stats row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12}}>
        <Stat label="Bookings · Today" value={dayBookings.length}/>
        <Stat label="Active Roasters" value={new Set(dayBookings.map(b=>b.customer)).size} delta={`${onFloor.length} on floor now`}/>
        <Stat label="Machine Utilization" value={utilization+"%"} delta={utilization>60?"+4 pts":null}/>
        <Stat label="Revenue · Today" value={"$"+revToday.toLocaleString()} delta="+12% vs avg"/>
        <Stat label="Unpaid · Today" value={"$"+unpaidToday.toLocaleString()}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:14}}>
        {/* On the floor */}
        <Panel title="On The Floor" actions={<Btn size="sm" variant="outline" onClick={goSchedule}>Open Schedule</Btn>}>
          {onFloor.length===0 && <EmptyMini msg="Nothing roasting right now."/>}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {onFloor.map(b=>{
              const cust = customerById(b.customer);
              const res = RESOURCES.find(r=>r.id===b.resource);
              const elapsed = NOW_HR - b.start;
              const pct = Math.min(100, Math.max(0, (elapsed/(b.end-b.start))*100));
              return (
                <button key={b.id} onClick={()=>openBooking(b)} style={floorCardStyle()}
                  onMouseOver={e=>{e.currentTarget.style.transform="translate(-2px,-2px)";e.currentTarget.style.boxShadow="6px 6px 0 var(--color-espresso)"}}
                  onMouseOut={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="3px 3px 0 var(--color-espresso)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:48,height:48,background:"var(--color-tomato)",border:"2.5px solid var(--color-espresso)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--color-cream)",position:"relative"}}>
                      <I name="flame" size={22}/>
                      <span style={{position:"absolute",top:-6,right:-6,width:14,height:14,background:"var(--color-sun)",border:"2px solid var(--color-espresso)",borderRadius:9999,animation:"co-pulse 1.5s ease-in-out infinite"}}/>
                    </div>
                    <div style={{flex:1,minWidth:0,textAlign:"left"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                        <TypeChip type={b.type}/>
                        <span style={{fontSize:11,color:"var(--fg2)",fontWeight:700,letterSpacing:".06em",textTransform:"uppercase"}}>{res.name}</span>
                      </div>
                      <div style={{fontFamily:"var(--font-display)",fontSize:22,textTransform:"uppercase",lineHeight:1}}>{cust.name}</div>
                      <div style={{fontSize:12,color:"var(--fg2)",marginTop:3}}>{b.lot} · {b.lbs} lb · {b.profile}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--fg2)",fontWeight:700}}>{fmtTime(b.start)}–{fmtTime(b.end)}</div>
                      <div style={{fontFamily:"var(--font-display)",fontSize:26,color:"var(--color-tomato)",lineHeight:1,marginTop:3}}>{Math.floor(elapsed*60)}:{String(Math.round((elapsed*60)%60)).padStart(2,"0")}</div>
                      <div style={{fontSize:9.5,fontWeight:800,letterSpacing:".1em",textTransform:"uppercase",color:"var(--fg2)"}}>elapsed</div>
                    </div>
                  </div>
                  <div style={{height:8,background:"var(--color-fog)",border:"2px solid var(--color-espresso)",borderRadius:9999,marginTop:10,overflow:"hidden",position:"relative"}}>
                    <div style={{position:"absolute",inset:0,width:pct+"%",background:"var(--color-tomato)",borderRight:"2px solid var(--color-espresso)"}}/>
                  </div>
                </button>
              );
            })}
          </div>
        </Panel>

        {/* Up next */}
        <Panel title="Up Next" actions={<Btn size="sm" variant="outline" onClick={goSchedule}>All Bookings</Btn>}>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {upNext.map(b=>{
              const cust = customerById(b.customer);
              const res = RESOURCES.find(r=>r.id===b.resource);
              const minsAway = Math.round((b.start - NOW_HR)*60);
              return (
                <button key={b.id} onClick={()=>openBooking(b)} style={upNextStyle()}
                  onMouseOver={e=>{e.currentTarget.style.transform="translate(-1.5px,-1.5px)";e.currentTarget.style.boxShadow="4px 4px 0 var(--color-espresso)"}}
                  onMouseOut={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="2px 2px 0 var(--color-espresso)"}}>
                  <div style={{textAlign:"center",flexShrink:0,width:54}}>
                    <div style={{fontFamily:"var(--font-display)",fontSize:20,lineHeight:1}}>{fmtTime(b.start).replace(/[ap]/,"")}</div>
                    <div style={{fontSize:9,fontWeight:800,letterSpacing:".1em",textTransform:"uppercase",color:"var(--fg2)"}}>{fmtTime(b.start).slice(-1)==="p"?"PM":"AM"}</div>
                  </div>
                  <div style={{width:2,height:34,background:"var(--color-espresso)"}}/>
                  <div style={{flex:1,minWidth:0,textAlign:"left"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:1}}>
                      <TypeChip type={b.type}/>
                      {b.recurring && <I2 name="repeat" size={11}/>}
                    </div>
                    <div style={{fontWeight:800,fontSize:13,lineHeight:1.1}}>{cust.name}</div>
                    <div style={{fontSize:11,color:"var(--fg2)",marginTop:2}}>{res.name} · {b.lbs} lb</div>
                  </div>
                  <div style={{textAlign:"right",fontSize:10,fontWeight:800,letterSpacing:".08em",textTransform:"uppercase",color:"var(--color-tomato)"}}>
                    in {minsAway>=60?`${Math.floor(minsAway/60)}h ${minsAway%60}m`:`${minsAway}m`}
                  </div>
                </button>
              );
            })}
          </div>
        </Panel>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        {/* Revenue split */}
        <Panel title="Revenue Today · By Service">
          <div style={{display:"flex",alignItems:"flex-end",height:140,gap:10,padding:"6px 0 12px"}}>
            {Object.entries(byType).map(([k,v])=>{
              const meta = BOOKING_TYPES[k];
              const pct = (v/totalRev)*100;
              return (
                <div key={k} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                  <div style={{position:"relative",width:"100%",height:110,display:"flex",alignItems:"flex-end"}}>
                    <div style={{width:"100%",height:pct*1.05+"%",background:`var(--color-${meta.color})`,border:"2.5px solid var(--color-espresso)",borderRadius:"8px 8px 0 0",boxShadow:"2px 2px 0 var(--color-espresso)",position:"relative"}}>
                      <div style={{position:"absolute",top:-22,left:"50%",transform:"translateX(-50%)",fontFamily:"var(--font-mono)",fontSize:11,fontWeight:800,whiteSpace:"nowrap"}}>${v}</div>
                    </div>
                  </div>
                  <div style={{fontSize:10,fontWeight:800,letterSpacing:".1em",textTransform:"uppercase"}}>{meta.label}</div>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Alerts */}
        <Panel title="Needs Your Attention" actions={<Pill variant="tomato">3</Pill>}>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <AlertRow icon="alert" color="tomato" title="South Lamar Coffee · $1,820 overdue 10 days" sub="INV-2104 · Last reminder 3 days ago" cta="Send reminder" onClick={goPayments}/>
            <AlertRow icon="bell" color="sun" title="Cosmic Bean's first co-roast in 3:42" sub="They've never run with us before. Joel is on coaching." cta="View booking" onClick={()=>openBooking(BOOKINGS[TODAY].find(b=>b.id==="b110"))}/>
            <AlertRow icon="box" color="sky" title="Shelf B-03 · Sundog Coffee — rental past due" sub="Renewal was due Apr 15. Auto-charged 2x, both failed." cta="Open shelf"/>
          </div>
        </Panel>
      </div>
    </div>
  );
};

const AlertRow = ({icon,color,title,sub,cta,onClick}) => (
  <div style={{padding:12,border:"2.5px solid var(--color-espresso)",borderRadius:12,background:"var(--color-cream)",display:"flex",alignItems:"center",gap:12}}>
    <div style={{width:36,height:36,background:`var(--color-${color})`,border:"2.5px solid var(--color-espresso)",borderRadius:9999,display:"flex",alignItems:"center",justifyContent:"center",color:(color==="sun"||color==="sky")?"var(--color-espresso)":"var(--color-cream)",flexShrink:0}}>
      <I2 name={icon} size={17}/>
    </div>
    <div style={{flex:1,minWidth:0}}>
      <div style={{fontWeight:800,fontSize:12.5,lineHeight:1.2}}>{title}</div>
      <div style={{fontSize:11,color:"var(--fg2)",marginTop:2}}>{sub}</div>
    </div>
    <Btn size="sm" variant="outline" onClick={onClick}>{cta}</Btn>
  </div>
);

const EmptyMini = ({msg}) => (
  <div style={{padding:"24px 12px",textAlign:"center",color:"var(--fg2)",fontWeight:700,fontSize:12,letterSpacing:".06em"}}>{msg}</div>
);

const floorCardStyle = () => ({
  padding:14,border:"3px solid var(--color-espresso)",borderRadius:14,
  background:"var(--color-chalk)",boxShadow:"3px 3px 0 var(--color-espresso)",
  cursor:"pointer",transition:"all .12s var(--ease-snap)",fontFamily:"var(--font-body)",
  textAlign:"left",width:"100%",display:"block",
});

const upNextStyle = () => ({
  padding:"10px 12px",border:"2.5px solid var(--color-espresso)",borderRadius:10,
  background:"var(--color-cream)",boxShadow:"2px 2px 0 var(--color-espresso)",
  cursor:"pointer",transition:"all .12s var(--ease-snap)",fontFamily:"var(--font-body)",
  display:"flex",alignItems:"center",gap:10,width:"100%",
});

const SignoffBanner = ({sessions, openBooking}) => {
  const NOW_HR = 10.3;
  return (
    <div style={{padding:"14px 18px",background:"var(--color-sun)",color:"var(--color-espresso)",border:"3px solid var(--color-espresso)",borderRadius:14,boxShadow:"3px 3px 0 var(--color-espresso)",display:"flex",alignItems:"stretch",gap:16}}>
      <div style={{width:48,height:48,background:"var(--color-espresso)",border:"2.5px solid var(--color-espresso)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--color-sun)",flexShrink:0,alignSelf:"center"}}>
        <I2 name="alert" size={22}/>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:3}}>
          <div style={{fontFamily:"var(--font-display)",fontSize:20,textTransform:"uppercase",lineHeight:1}}>Sessions need sign-off</div>
          <Pill variant="tomato">{sessions.length}</Pill>
        </div>
        <div style={{fontSize:11.5,fontWeight:600,opacity:.85,lineHeight:1.4,marginBottom:9}}>
          Past their scheduled end without a completion mark. Auto-completing in 30 min unless edited.
          Invoice will pull from the scheduled stop time.
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {sessions.map(b=>{
            const cust = customerById(b.customer);
            const res = RESOURCES.find(r=>r.id===b.resource);
            const lateMin = Math.round((NOW_HR - b.end)*60);
            const autoInMin = Math.max(0, Math.round((b.end + 0.5 - NOW_HR)*60));
            return (
              <div key={b.id} style={{padding:"9px 12px",background:"var(--color-cream)",border:"2px solid var(--color-espresso)",borderRadius:10,display:"flex",alignItems:"center",gap:12}}>
                <Avatar customer={b.customer} size={28}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,fontSize:12.5,fontWeight:800,lineHeight:1.15}}>
                    <span>{cust.name}</span>
                    <span style={{color:"var(--fg2)",fontWeight:600}}>·</span>
                    <span style={{color:"var(--fg2)",fontWeight:700}}>{res.name}</span>
                  </div>
                  <div style={{fontSize:10.5,color:"var(--fg2)",fontWeight:700,marginTop:2,letterSpacing:".03em"}}>
                    Scheduled {fmtTime(b.start)}–{fmtTime(b.end)} · <span style={{color:"var(--color-tomato)"}}>{lateMin}m past end</span>
                    {autoInMin>0 && <> · auto-completes in {autoInMin}m</>}
                  </div>
                </div>
                <Btn size="sm" variant="outline" onClick={()=>openBooking(b)} icon={<I2 name="clock" size={11}/>}>Edit time</Btn>
                <Btn size="sm" variant="primary" icon={<I2 name="check" size={11}/>}>Mark complete</Btn>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { TodayView });
