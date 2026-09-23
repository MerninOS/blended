// Roaster Portal — Chrome (top bar) and shell

const PortalChrome = ({ section, setSection }) => {
  const me = customerById(ME);
  const tabs = [
    { id:"book",     label:"Book Time" },
    { id:"bookings", label:"My Bookings" },
    { id:"shelf",    label:"My Shelf" },
    { id:"invoices", label:"Invoices" },
  ];
  return (
    <header style={{borderBottom:"3px solid var(--color-espresso)",background:"var(--color-cream)",position:"sticky",top:0,zIndex:30}}>
      <div style={{display:"flex",alignItems:"center",gap:18,padding:"12px 28px"}}>
        <a href="CoRoasted.html" style={{display:"flex",alignItems:"center",gap:9,textDecoration:"none",color:"var(--color-espresso)"}}>
          <div style={{width:36,height:36,background:"var(--color-tomato)",border:"2.5px solid var(--color-espresso)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--color-cream)",boxShadow:"2px 2px 0 var(--color-espresso)"}}>
            <I name="flame" size={20}/>
          </div>
          <div>
            <div style={{fontFamily:"var(--font-display)",fontSize:20,lineHeight:1.2,textTransform:"uppercase",letterSpacing:".01em"}}>CoRoasted</div>
            <div style={{fontSize:9.5,fontWeight:800,color:"var(--fg2)",letterSpacing:".14em",textTransform:"uppercase"}}>Roaster Portal · {FACILITY.name}</div>
          </div>
        </a>
        <nav style={{display:"flex",gap:4,marginLeft:18,flex:1}}>
          {tabs.map(t => (
            <button key={t.id} onClick={()=>setSection(t.id)} style={{
              padding:"8px 14px",borderRadius:9,border:"2.5px solid",
              borderColor:section===t.id?"var(--color-espresso)":"transparent",
              background:section===t.id?"var(--color-espresso)":"transparent",
              color:section===t.id?"var(--color-cream)":"var(--color-espresso)",
              fontWeight:800,fontSize:12.5,letterSpacing:".05em",fontFamily:"var(--font-body)",cursor:"pointer",
              boxShadow:section===t.id?"3px 3px 0 var(--color-tomato)":"none",textTransform:"uppercase",
            }}>{t.label}</button>
          ))}
        </nav>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Btn size="sm" variant="outline" icon={<I2 name="bell" size={13}/>}>3</Btn>
          <div style={{display:"flex",alignItems:"center",gap:9,padding:"6px 12px 6px 6px",border:"2.5px solid var(--color-espresso)",borderRadius:9999,background:"var(--color-chalk)"}}>
            <Avatar customer={ME} size={28}/>
          <div style={{lineHeight:1.25,display:"flex",flexDirection:"column",gap:2}}>
            <div style={{fontSize:11.5,fontWeight:800,whiteSpace:"nowrap"}}>{me.name}</div>
            <div style={{fontSize:9.5,fontWeight:700,letterSpacing:".09em",textTransform:"uppercase",color:"var(--fg2)",whiteSpace:"nowrap"}}>{me.contact} · {me.tier}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

Object.assign(window, { PortalChrome });
