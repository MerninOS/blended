// CoRoasted — Sidebar + TopBar chrome

const Sidebar = ({ section, setSection }) => {
  const nav = [
    { id:"today",     icon:"dash",  label:"Today" },
    { id:"schedule",  icon:"cal",   label:"Schedule" },
    { id:"bookings",  icon:"list",  label:"Bookings", count:14 },
    { id:"customers", icon:"users", label:"Customers", count:10 },
    { id:"storage",   icon:"box",   label:"Storage" },
    { id:"services",  icon:"bolt",  label:"Services" },
    { id:"payments",  icon:"cash",  label:"Payments", count:3, alert:true },
    { id:"settings",  icon:"cog",   label:"Settings" },
  ];

  const Ico = ({n,size=16}) => {
    if (n==="cal"||n==="list"||n==="box"||n==="bolt"||n==="cash") return <I2 name={n} size={size}/>;
    return <I name={n} size={size}/>;
  };

  return (
    <aside style={{width:236,background:"rgba(36,24,15,0.72)",backdropFilter:"blur(24px) saturate(140%)",WebkitBackdropFilter:"blur(24px) saturate(140%)",color:"var(--color-cream)",padding:"18px 12px",display:"flex",flexDirection:"column",gap:3,flexShrink:0,minHeight:"100vh",position:"sticky",top:0,alignSelf:"flex-start"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"4px 8px 16px",borderBottom:"2px solid var(--color-roast)",marginBottom:12}}>
        <div style={{width:36,height:36,background:"var(--color-tomato)",border:"1px solid rgba(255,255,255,0.6)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--color-cream)",fontFamily:"var(--font-display)",fontSize:22,lineHeight:1}}>C</div>
        <div>
          <div style={{fontFamily:"var(--font-display)",fontSize:21,lineHeight:1,textTransform:"uppercase",letterSpacing:".01em"}}>CoRoasted</div>
          <div style={{fontSize:9,fontWeight:800,letterSpacing:".14em",textTransform:"uppercase",opacity:.55,marginTop:2}}>Toll Roasting OS</div>
        </div>
      </div>
      {nav.map(n=>{
        const active = section===n.id;
        return (
          <button key={n.id} onClick={()=>setSection(n.id)} style={{
            display:"flex",alignItems:"center",gap:11,padding:"9px 11px",
            background:active?"var(--color-tomato)":"transparent",
            color:"var(--color-cream)",
            border:active?"2.5px solid var(--color-cream)":"2.5px solid transparent",
            borderRadius:12,cursor:"pointer",textAlign:"left",fontFamily:"var(--font-body)",
            fontWeight:800,fontSize:12,letterSpacing:".09em",textTransform:"uppercase",
            boxShadow:active?"3px 3px 0 var(--color-cream)":"none",transition:"all .12s var(--ease-snap)"
          }}
          onMouseOver={e=>{ if(!active) e.currentTarget.style.background="rgba(245,240,216,.07)"; }}
          onMouseOut={e=>{  if(!active) e.currentTarget.style.background="transparent"; }}>
            <Ico n={n.icon}/>
            <span style={{flex:1}}>{n.label}</span>
            {n.count!=null && <span style={{
              background:n.alert?"var(--color-tomato)":"var(--color-sun)",
              color:n.alert?"var(--color-cream)":"var(--color-espresso)",
              fontSize:10,padding:"1px 6px",borderRadius:11999,
              border:"1px solid rgba(60,40,28,0.10)",fontWeight:800
            }}>{n.count}</span>}
          </button>
        );
      })}
      <div style={{flex:1}}/>
      <div style={{padding:12,background:"var(--color-roast)",borderRadius:14,border:"2px solid var(--color-tomato)",fontSize:11,lineHeight:1.4,marginTop:12}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
          <Dot color="matcha" pulse/>
          <div style={{fontFamily:"var(--font-display)",fontSize:13,color:"var(--color-sun)",textTransform:"uppercase"}}>Floor open</div>
        </div>
        <div style={{opacity:.75}}>{FACILITY.name}</div>
        <div style={{opacity:.55,fontSize:10,marginTop:2}}>Hrs {FACILITY.hoursStart}a–{FACILITY.hoursEnd-12}p · {FACILITY.city}</div>
      </div>
    </aside>
  );
};

const TopBar = ({ title, subtitle, breadcrumbs, actions }) => (
  <div style={{background:"rgba(251,248,242,0.92)",padding:"18px 24px 16px",borderBottom:"1px solid rgba(60,40,28,0.08)",display:"flex",alignItems:"center",justifyContent:"space-between",gap:20,position:"sticky",top:0,zIndex:5}}>
    <div style={{flex:1,minWidth:0}}>
      {breadcrumbs && <div style={{fontSize:11,fontWeight:800,letterSpacing:".11em",textTransform:"uppercase",color:"var(--fg2)",marginBottom:5}}>{breadcrumbs}</div>}
      <h1 style={{fontFamily:"var(--font-display)",fontSize:36,lineHeight:.95,textTransform:"uppercase",margin:0}}>{title}</h1>
      {subtitle && <div style={{fontSize:13,color:"var(--fg2)",marginTop:4}}>{subtitle}</div>}
    </div>
    <div style={{display:"flex",gap:10,flexShrink:0}}>{actions}</div>
  </div>
);

Object.assign(window, { Sidebar, TopBar });
