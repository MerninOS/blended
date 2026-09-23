// Roaster Portal × CoffeeOS — top chrome: utility bar + ruled tabs.
// Overrides src/PortalChrome.jsx for the CoffeeOS build.

const PortalChrome = ({ section, setSection }) => {
  const me = customerById(ME);
  const tabs = [
    { id:"book",     label:"Book time" },
    { id:"private",  label:"Private label" },
    { id:"bookings", label:"My bookings" },
    { id:"shelf",    label:"My shelf" },
    { id:"invoices", label:"Invoices" },
  ];
  const over = {fontFamily:"var(--font-mono)",fontVariationSettings:"var(--overline-settings)",fontWeight:600,letterSpacing:".08em",textTransform:"uppercase"};
  const mono = {fontFamily:"var(--font-mono)",fontVariationSettings:"var(--data-settings)",fontVariantNumeric:"tabular-nums"};
  return (
    <header style={{position:"sticky",top:0,zIndex:200,background:"var(--surface)",borderBottom:"1px solid var(--hairline)"}}>
      {/* utility bar */}
      <div className="pc-bar" style={{display:"flex",alignItems:"center",gap:16,height:"var(--topbar-h)",padding:"0 24px"}}>
        <a href="CoRoasted CoffeeOS.html" style={{display:"flex",alignItems:"center",gap:9,textDecoration:"none",flexShrink:0}}>
          <span style={{fontFamily:"var(--font-display)",fontVariationSettings:"var(--display-settings)",fontWeight:700,letterSpacing:"var(--display-tracking)",fontSize:18,color:"var(--ink)",lineHeight:1}}>CoRoasted</span>
          <span style={{width:8,height:8,borderRadius:"0 50% 50% 50%",background:"var(--brand)",transform:"rotate(45deg)",flexShrink:0}}/>
        </a>
        <span className="pc-facility" style={{...over,fontSize:10,color:"var(--ink-subtle)",flexShrink:0}}>Roaster portal · {FACILITY.name}</span>
        <div style={{flex:1}}/>
        <IconBtn name="bell" badge/>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"4px 12px 4px 4px",border:"1px solid var(--hairline)",borderRadius:"var(--r-pill)",background:"var(--surface)",flexShrink:0}}>
          <Avatar customer={ME} size={28}/>
          <div className="pc-user-meta" style={{lineHeight:1.25}}>
            <div style={{fontFamily:"var(--font-sans)",fontSize:12.5,fontWeight:600,color:"var(--ink)",whiteSpace:"nowrap"}}>{me.name}</div>
            <div style={{...over,fontSize:9,color:"var(--ink-subtle)",whiteSpace:"nowrap"}}>{me.tier}</div>
          </div>
        </div>
      </div>
      {/* ruled tabs */}
      <nav className="pc-tabs" style={{display:"flex",gap:26,padding:"0 24px"}}>
        {tabs.map(t=>{
          const on = t.id===section;
          return (
            <button key={t.id} onClick={()=>setSection(t.id)} style={{
              background:"none",border:"none",cursor:"pointer",padding:"0 0 11px",marginBottom:-1,
              borderBottom:on?"2px solid var(--brand)":"2px solid transparent",
              color:on?"var(--ink)":"var(--ink-muted)",fontFamily:"var(--font-sans)",fontSize:14,fontWeight:on?600:500,
            }}>{t.label}</button>
          );
        })}
      </nav>
    </header>
  );
};

Object.assign(window, { PortalChrome });
