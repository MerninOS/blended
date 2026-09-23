// CoRoasted × CoffeeOS — worksheet chrome: grouped Sidebar + AppHeader.
// Overrides the shared uds/Chrome.jsx components for the CoffeeOS build only.

const NAV_GROUPS = [
  { label:"Workspace", items:[
    { id:"today",     icon:"dash",  label:"Today" },
    { id:"schedule",  icon:"cal",   label:"Schedule" },
    { id:"bookings",  icon:"list",  label:"Bookings" },
    { id:"orders",    icon:"cart",  label:"Orders", count:6, live:true },
  ]},
  { label:"Customers", items:[
    { id:"customers", icon:"users", label:"Customers" },
    { id:"payments",  icon:"cash",  label:"Payments", count:3, live:true },
  ]},
  { label:"Facility", items:[
    { id:"storage",   icon:"box",   label:"Storage" },
    { id:"private",   icon:"pkg",   label:"Private label", count:3, live:true },
    { id:"green",     icon:"beans", label:"Green catalog" },
    { id:"services",  icon:"bolt",  label:"Services" },
  ]},
];

const NavIcon = ({ n, size=17 }) => {
  const two = n==="cal"||n==="list"||n==="box"||n==="bolt"||n==="cash";
  return two ? <I2 name={n} size={size} stroke={2}/> : <I name={n} size={size} stroke={2}/>;
};

const Sidebar = ({ section, setSection, groups }) => {
  const NAVG = groups || NAV_GROUPS;
  const [collapsed, setCollapsed] = React.useState(false);
  const w = collapsed ? "var(--nav-w-collapsed)" : "var(--nav-w)";

  const NavItem = ({ n }) => {
    const active = section===n.id;
    return (
      <button key={n.id} onClick={()=>setSection(n.id)} title={collapsed?n.label:undefined} style={{
        position:"relative",display:"flex",alignItems:"center",gap:12,
        padding:collapsed?"9px 0":"8px 11px",justifyContent:collapsed?"center":"flex-start",
        background:active?"var(--brand-soft)":"transparent",
        color:active?"var(--brand)":"var(--ink-muted)",
        border:"none",borderRadius:"var(--r-md)",cursor:"pointer",textAlign:"left",
        fontFamily:"var(--font-sans)",fontWeight:active?600:500,fontSize:13.5,width:"100%",
        transition:"background var(--dur) var(--ease), color var(--dur) var(--ease)"
      }}
      onMouseOver={e=>{ if(!active) e.currentTarget.style.background="var(--surface-hover)"; }}
      onMouseOut={e=>{  if(!active) e.currentTarget.style.background="transparent"; }}>
        {active && <span style={{position:"absolute",left:0,top:6,bottom:6,width:3,borderRadius:"0 3px 3px 0",background:"var(--brand)"}}/>}
        <NavIcon n={n.icon}/>
        {!collapsed && <span style={{flex:1}}>{n.label}</span>}
        {!collapsed && n.count!=null && (
          <span style={{...CO.data({fontSize:11}),padding:"1px 7px",borderRadius:"var(--r-pill)",
            background:n.live?"var(--brand)":"var(--surface-sunken)",
            color:n.live?"#fff":"var(--ink-muted)"}}>{n.count}</span>
        )}
      </button>
    );
  };

  return (
    <aside className="co-sidebar" style={{width:w,flexShrink:0,background:"var(--surface)",borderRight:"1px solid var(--hairline)",display:"flex",flexDirection:"column",minHeight:"100vh",position:"sticky",top:0,alignSelf:"flex-start",transition:"width var(--dur) var(--ease)"}}>
      {/* wordmark */}
      <div style={{display:"flex",alignItems:"center",gap:9,height:"var(--topbar-h)",padding:collapsed?"0":"0 16px",justifyContent:collapsed?"center":"flex-start",borderBottom:"1px solid var(--hairline)"}}>
        <span className="co-wordmark" style={CO.display({fontSize:18,color:"var(--ink)",lineHeight:1,display:"flex",alignItems:"center",gap:8})}>{collapsed?null:<img src="assets/blended-mark.png" alt="" style={{width:20,height:20,flexShrink:0}}/>}{collapsed?"Co":"BLENDED"}</span>
      </div>

      <div className="co-navbody" style={{flex:1,overflowY:"auto",padding:collapsed?"12px 8px":"14px 12px",display:"flex",flexDirection:"column",gap:collapsed?4:2}}>
        {/* product / facility switcher */}
        {!collapsed && (
          <button style={{textAlign:"left",width:"100%",padding:"9px 11px",marginBottom:8,border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",background:"var(--surface)",cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={CO.over({fontSize:9,color:"var(--ink-subtle)"})}>Facility</div>
              <div style={{fontFamily:"var(--font-sans)",fontSize:13,fontWeight:600,color:"var(--ink)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginTop:2}}>{FACILITY.name}</div>
            </div>
            <span style={{color:"var(--ink-subtle)",fontSize:11}}>▾</span>
          </button>
        )}

        {NAVG.map((g,gi)=>(
          <div key={g.label} style={{marginTop:gi?14:0,display:"flex",flexDirection:"column",gap:2}}>
            {!collapsed && <div style={CO.over({fontSize:9.5,color:"var(--ink-subtle)",padding:"0 11px 6px"})}>{g.label}</div>}
            {g.items.map(n=><NavItem key={n.id} n={n}/>)}
          </div>
        ))}
      </div>

      {/* footer: live status + settings + collapse */}
      <div className="co-navfoot" style={{borderTop:"1px solid var(--hairline)",padding:collapsed?"10px 8px":"12px"}}>
        {!collapsed && (
          <div className="co-navstatus" style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",marginBottom:8,border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",background:"var(--surface-sunken)"}}>
            <span style={{width:8,height:8,borderRadius:"50%",background:"var(--success)",flexShrink:0}}/>
            <div style={{minWidth:0}}>
              <div style={{fontFamily:"var(--font-sans)",fontSize:12,fontWeight:600,color:"var(--ink)"}}>Floor open</div>
              <div style={CO.data({fontSize:10,color:"var(--ink-subtle)"})}>{FACILITY.hoursStart}a–{FACILITY.hoursEnd-12}p · {FACILITY.city}</div>
            </div>
          </div>
        )}
        <div style={{display:"flex",flexDirection:"column",gap:2}}>
          <NavItem n={{ id:"settings", icon:"cog", label:"Settings" }}/>
          <button className="co-collapse" onClick={()=>setCollapsed(c=>!c)} style={{display:"flex",alignItems:"center",gap:12,justifyContent:collapsed?"center":"flex-start",padding:collapsed?"9px 0":"8px 11px",background:"none",border:"none",cursor:"pointer",color:"var(--ink-subtle)",fontFamily:"var(--font-sans)",fontSize:12.5,fontWeight:500,width:"100%"}}>
            <span style={{display:"inline-flex",transform:collapsed?"rotate(180deg)":"none"}}><I2 name="chevL" size={16} stroke={2}/></span>
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

// AppHeader — slim utility bar + batch strip + title block. Keeps the shared
// TopBar prop shape (title/subtitle/breadcrumbs/actions) so every view works.
const TopBar = ({ title, subtitle, breadcrumbs, actions, strip = true }) => {
  const crumbs = (breadcrumbs||"").split("/").map(s=>s.trim()).filter(Boolean);
  return (
    <header style={{position:"sticky",top:0,zIndex:200,background:"var(--surface)"}}>
      <div style={{display:"flex",alignItems:"center",gap:16,height:"var(--topbar-h)",padding:"0 24px",borderBottom:"1px solid var(--hairline)"}}>
        <div style={{display:"flex",alignItems:"center",gap:7,minWidth:0,flexShrink:0}}>
          {crumbs.map((c,i)=>(
            <React.Fragment key={i}>
              {i>0 && <span style={{color:"var(--ink-subtle)",fontSize:11}}>/</span>}
              <span style={CO.over({fontSize:10,color:i===crumbs.length-1?"var(--ink)":"var(--ink-muted)"})}>{c}</span>
            </React.Fragment>
          ))}
        </div>
        <div className="co-topsearch" style={{flex:1,display:"flex",justifyContent:"center"}}>
          <div style={{width:"100%",maxWidth:460}}><SearchInput placeholder="Search bookings, roasters, lots" sunken/></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <IconBtn name="bell" badge/>
          <IconBtn name="today"/>
          <div style={{width:32,height:32,borderRadius:"50%",background:"var(--brand)",color:"#fff",display:"inline-flex",alignItems:"center",justifyContent:"center",...CO.data({fontSize:12,fontWeight:600})}}>HK</div>
        </div>
      </div>

      {strip && <BatchStrip/>}

      <div className="co-titleblock" style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:20,padding:"18px 24px 16px",borderBottom:"1px solid var(--hairline)"}}>
        <div style={{minWidth:0}}>
          <h1 style={CO.display({fontSize:"clamp(28px,3vw,40px)",lineHeight:1,margin:0,color:"var(--ink)",textTransform:"uppercase"})}>{title}</h1>
          {subtitle && <div style={{marginTop:8,fontSize:14,color:"var(--ink-muted)"}}>{subtitle}</div>}
        </div>
        {actions && <div style={{display:"flex",gap:10,flexShrink:0}}>{actions}</div>}
      </div>
    </header>
  );
};

Object.assign(window, { Sidebar, TopBar });
