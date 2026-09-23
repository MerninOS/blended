// CoRoasted × CoffeeOS — worksheet dashboard (Today).
// Hero metric + ruled stat strip, tabs, filter bar, edge-to-edge sessions table.

const cell = { padding:"11px 14px", verticalAlign:"middle" };

const SessionsTable = ({ rows, onOpen, total }) => (
  <div style={{border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",overflow:"hidden",background:"var(--surface)"}}>
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",minWidth:820}}>
        <thead>
          <tr style={{background:"var(--surface-sunken)",borderBottom:"1px solid var(--hairline)"}}>
            {[["chk","left"],["Session","left"],["Customer","left"],["Roast","left"],["Machine","left"],["Lbs","right"],["Total","right"],["Status","left"],["Time","right"]].map(([h,al],i)=>(
              <th key={i} style={{textAlign:al,padding:"9px 14px",...CO.over({fontSize:10,color:"var(--ink-muted)"})}}>
                {h==="chk" ? <input type="checkbox" style={{accentColor:"var(--ink)"}}/> : h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(b=>{
            const c = customerById(b.customer);
            const res = RESOURCES.find(r=>r.id===b.resource);
            return (
              <tr key={b.id} onClick={()=>onOpen(b)} style={{borderBottom:"1px solid var(--hairline)",cursor:"pointer",transition:"background var(--dur) var(--ease)"}}
                onMouseOver={e=>e.currentTarget.style.background="var(--surface-hover)"}
                onMouseOut={e=>e.currentTarget.style.background="transparent"}>
                <td style={cell}><input type="checkbox" onClick={e=>e.stopPropagation()} style={{accentColor:"var(--ink)"}}/></td>
                <td style={cell}>
                  <div style={CO.data({fontSize:13,color:"var(--ink)"})}>#{b.id.replace(/\D/g,"")}</div>
                  <div style={{fontSize:11,color:"var(--ink-subtle)",fontFamily:"var(--font-sans)"}}>{BOOKING_TYPES[b.type]?.label}</div>
                </td>
                <td style={cell}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <Avatar customer={b.customer} size={30}/>
                    <div style={{minWidth:0}}>
                      <div style={{fontFamily:"var(--font-sans)",fontSize:13,fontWeight:600,color:"var(--ink)",whiteSpace:"nowrap"}}>{c.name}</div>
                      <div style={CO.over({fontSize:9.5,color:"var(--ink-subtle)"})}>{c.tier}</div>
                    </div>
                  </div>
                </td>
                <td style={cell}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <RoastDot profile={b.profile}/>
                    <span style={{fontSize:12,color:"var(--ink-muted)",fontFamily:"var(--font-sans)",whiteSpace:"nowrap"}}>{b.profile}</span>
                  </div>
                </td>
                <td style={cell}><span style={CO.data({fontSize:12.5,color:"var(--ink-muted)"})}>{res?.name}</span></td>
                <td style={{...cell,textAlign:"right"}}><span style={CO.data({fontSize:13,color:"var(--ink)"})}>{b.lbs}</span></td>
                <td style={{...cell,textAlign:"right"}}><span style={CO.data({fontSize:13,color:"var(--ink)"})}>${b.total.toLocaleString()}</span></td>
                <td style={cell}><StatusBadge status={b.status} paid={b.paid}/></td>
                <td style={{...cell,textAlign:"right"}}><span style={CO.data({fontSize:12.5,color:"var(--ink-muted)",whiteSpace:"nowrap"})}>{fmtTime(b.start)}–{fmtTime(b.end)}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,padding:"10px 14px",borderTop:"1px solid var(--hairline)",background:"var(--surface)"}}>
      <span style={{fontSize:12,color:"var(--ink-muted)",fontFamily:"var(--font-sans)"}}>{rows.length} of {total} sessions · <Kbd>⌘K</Kbd> to jump</span>
      <div style={{display:"flex",gap:8}}>
        <Btn size="sm" variant="outline">Prev</Btn>
        <Btn size="sm" variant="outline">Next</Btn>
      </div>
    </div>
  </div>
);

const Dashboard = ({ openBooking }) => {
  const NOW = 10.3;
  const day = BOOKINGS[TODAY] || [];
  const [tab, setTab] = React.useState("open");
  const [seg, setSeg] = React.useState("all");

  const onFloor = day.filter(b=>b.start<=NOW && b.end>=NOW);
  const isMachine = b => RESOURCES.find(r=>r.id===b.resource)?.kind==="machine";
  const open = day.filter(b=>!b.paid || b.start>NOW);
  const rev = day.reduce((s,b)=>s+b.total,0);
  const unpaid = day.filter(b=>!b.paid).reduce((s,b)=>s+b.total,0);
  const machineHrs = day.filter(isMachine).reduce((s,b)=>s+(b.end-b.start),0);
  const util = Math.round(machineHrs/((FACILITY.hoursEnd-FACILITY.hoursStart)*4)*100);
  const roastingNow = onFloor.filter(isMachine).length;

  const base = tab==="floor" ? onFloor : tab==="all" ? day : open;
  const rows = base.filter(b=>seg==="all"?true:b.type===seg).sort((a,b)=>a.start-b.start);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:24,padding:"20px 24px 40px",maxWidth:"var(--content-max)"}}>
      <div style={{display:"flex",flexDirection:"column",gap:18}}>
        <HeroMetric label="Sessions today" value={day.length} delta="+3" deltaDir="up" caption={`${roastingNow} roasting now · ${onFloor.length} on the floor · $${unpaid.toLocaleString()} unpaid`}/>
        <StatStrip items={[
          { label:"Revenue · today", value:"$"+rev.toLocaleString(), delta:"12%", deltaDir:"up" },
          { label:"Utilization",     value:util+"%",                 delta:"4 pts", deltaDir:"up" },
          { label:"Roasting now",    value:roastingNow, live:true },
          { label:"Avg queue",       value:"2.1", unit:"days",       delta:"0.3", deltaDir:"down" },
        ]}/>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <Tabs active={tab} onChange={setTab} tabs={[
          { id:"open",  label:"Open",     count:open.length },
          { id:"floor", label:"On floor", count:onFloor.length },
          { id:"all",   label:"All",      count:day.length },
        ]}/>

        <div style={{display:"flex",alignItems:"center",gap:10,padding:10,background:"var(--surface-sunken)",border:"1px solid var(--hairline)",borderRadius:"var(--r-md)"}}>
          <div style={{maxWidth:320,flex:1,display:"flex"}}><SearchInput placeholder="Customer, lot, or session #"/></div>
          <Segmented value={seg} onChange={setSeg} options={[{id:"all",label:"All"},{id:"coroast",label:"Co-roast"},{id:"toll",label:"Toll"}]}/>
          <Select>Any roast</Select>
          <div style={{flex:1}}/>
          <button style={{display:"inline-flex",alignItems:"center",gap:7,padding:"0 12px",height:34,border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",background:"var(--surface)",color:"var(--ink-muted)",fontFamily:"var(--font-sans)",fontSize:13,fontWeight:500,cursor:"pointer",whiteSpace:"nowrap"}}>
            <I2 name="filter" size={14} stroke={2}/> More filters
          </button>
        </div>

        {rows.length===0
          ? <div style={{padding:"48px 16px",textAlign:"center",border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",background:"var(--surface)"}}>
              <div style={CO.display({fontSize:20,color:"var(--ink)",textTransform:"uppercase"})}>Nothing here</div>
              <div style={{fontSize:13,color:"var(--ink-muted)",marginTop:8,fontFamily:"var(--font-sans)"}}>No sessions match this filter. Try switching tabs or clearing the roast filter.</div>
            </div>
          : <SessionsTable rows={rows} onOpen={openBooking} total={day.length}/>}
      </div>
    </div>
  );
};

Object.assign(window, { Dashboard, SessionsTable });
