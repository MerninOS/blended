// CoRoasted × CoffeeOS — worksheet-pattern building blocks
// Mono-forward type roles, roast-ramp data encoding, hero metric + stat strip,
// the signature live batch strip, ruled tabs, segmented control, worksheet table.

// ---- type role helpers (inline style objects) ----
const CO = {
  display: (x={}) => ({fontFamily:"var(--font-display)",fontVariationSettings:"var(--display-settings)",fontWeight:700,letterSpacing:"var(--display-tracking)",...x}),
  data:    (x={}) => ({fontFamily:"var(--font-mono)",fontVariationSettings:"var(--data-settings)",fontWeight:450,fontVariantNumeric:"tabular-nums",...x}),
  over:    (x={}) => ({fontFamily:"var(--font-mono)",fontVariationSettings:"var(--overline-settings)",fontWeight:600,letterSpacing:"var(--overline-tracking)",textTransform:"uppercase",...x}),
};

// ---- roast ramp encoding ----
const roastLevel = (profile="") => {
  const p = profile.toLowerCase();
  if (/vienna|french|espresso/.test(p)) return 5;
  if (/dark/.test(p)) return /med/.test(p) ? 4 : 5;
  if (/full city|med-dark/.test(p)) return 4;
  if (/med|medium/.test(p)) return 3;
  if (/city|cinnamon/.test(p)) return 2;
  if (/light/.test(p)) return /city/.test(p) ? 2 : 1;
  return 3;
};
const ROAST_VARS = ["--roast-0","--roast-1","--roast-2","--roast-3","--roast-4","--roast-5"];
const roastColor = lvl => `var(${ROAST_VARS[Math.max(0,Math.min(5,lvl))]})`;

const RoastDot = ({ profile, showLevel=true, size=11 }) => {
  const lvl = roastLevel(profile);
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:8}}>
      <span style={{width:size,height:size,borderRadius:"var(--r-sm)",background:roastColor(lvl),boxShadow:"inset 0 0 0 1px rgba(0,0,0,.14)",flexShrink:0}}/>
      {showLevel && <span style={CO.data({fontSize:12,color:"var(--ink-muted)"})}>{lvl}/5</span>}
    </span>
  );
};

// ---- status badge (roasting = live register red; open = amber; scheduled = neutral) ----
const StatusBadge = ({ status, paid }) => {
  const roasting = status==="inprogress" || status==="in-progress";
  let c;
  if (roasting)   c = {label:"Roasting",  bg:"var(--brand-soft)",   fg:"var(--brand)",   dot:"var(--brand)",   pulse:true};
  else if (!paid) c = {label:"Open",      bg:"var(--warning-soft)", fg:"var(--warning)", dot:"var(--warning)"};
  else            c = {label:"Scheduled", bg:"var(--surface-sunken)",fg:"var(--ink-muted)",dot:"var(--ink-subtle)"};
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:6,padding:"3px 10px",borderRadius:"var(--r-pill)",background:c.bg,color:c.fg,...CO.over({fontSize:10,letterSpacing:".05em"})}}>
      <span style={{width:6,height:6,borderRadius:"50%",background:c.dot,animation:c.pulse?"co-pulse 1.5s ease-in-out infinite":"none",flexShrink:0}}/>{c.label}
    </span>
  );
};

// ---- kbd chip ----
const Kbd = ({ children }) => (
  <span style={{...CO.data({fontSize:10.5}),display:"inline-flex",alignItems:"center",padding:"1px 6px",borderRadius:"var(--r-sm)",background:"var(--surface)",border:"1px solid var(--hairline-strong)",color:"var(--ink-muted)",boxShadow:"0 1px 0 var(--hairline-strong)",whiteSpace:"nowrap"}}>{children}</span>
);

// ---- hero metric: one big figure on the canvas with a rule under it ----
const HeroMetric = ({ label, value, delta, deltaDir="up", caption }) => (
  <div style={{paddingBottom:16,borderBottom:"1px solid var(--hairline)"}}>
    <div style={CO.over({fontSize:11,color:"var(--ink-muted)"})}>{label}</div>
    <div style={{display:"flex",alignItems:"flex-end",gap:14,marginTop:6}}>
      <div style={CO.display({fontSize:"clamp(46px,5.4vw,72px)",lineHeight:.86,color:"var(--ink)"})}>{value}</div>
      {delta!=null && <div style={{display:"inline-flex",alignItems:"center",gap:3,marginBottom:9,...CO.data({fontSize:14,fontWeight:600}),color:deltaDir==="down"?"var(--danger)":"var(--success)"}}>{deltaDir==="down"?"↓":"↑"} {delta}</div>}
    </div>
    {caption && <div style={{marginTop:9,fontSize:13,color:"var(--ink-subtle)"}}>{caption}</div>}
  </div>
);

// ---- stat strip: the rest of the metrics in one ruled sunken row ----
const StatStrip = ({ items }) => (
  <div className="co-statstrip" style={{display:"grid",gridTemplateColumns:`repeat(${items.length},minmax(0,1fr))`,border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",background:"var(--surface-sunken)",overflow:"hidden"}}>
    {items.map((it,i)=>(
      <div key={i} style={{padding:"14px 16px",borderLeft:i?"1px solid var(--hairline)":"none"}}>
        <div style={CO.over({fontSize:10,color:"var(--ink-muted)"})}>{it.label}</div>
        <div style={{display:"flex",alignItems:"baseline",gap:6,marginTop:8}}>
          <span style={CO.data({fontSize:24,color:it.live?"var(--brand)":"var(--ink)"})}>{it.value}</span>
          {it.unit && <span style={CO.over({fontSize:10,color:"var(--ink-subtle)"})}>{it.unit}</span>}
        </div>
        {it.delta!=null && <div style={{marginTop:6,...CO.data({fontSize:11,fontWeight:600}),color:it.deltaDir==="down"?"var(--danger)":"var(--success)"}}>{it.deltaDir==="down"?"↓":"↑"} {it.delta}</div>}
      </div>
    ))}
  </div>
);

// ---- the signature live batch strip: today's roast queue on a time axis ----
const BatchStrip = () => {
  const [open, setOpen] = React.useState(true);
  const NOW = 10.3, H0 = FACILITY.hoursStart, H1 = FACILITY.hoursEnd, span = H1 - H0;
  const queue = (BOOKINGS[TODAY]||[]).filter(b=>b.resource==="loring").sort((a,b)=>a.start-b.start);
  const pct = h => Math.max(0, Math.min(100, ((h-H0)/span)*100));
  const live = queue.find(b=>b.start<=NOW && b.end>=NOW);
  const liveCust = live ? customerById(live.customer) : null;
  const ticks = [];
  for (let h=H0; h<=H1; h+=2) ticks.push(h);
  return (
    <div style={{display:"flex",alignItems:"center",gap:18,height:"var(--strip-h)",padding:"0 24px",borderBottom:"1px solid var(--hairline)",background:"var(--surface)"}}>
      <span style={CO.over({fontSize:10,color:"var(--ink-muted)",whiteSpace:"nowrap",flexShrink:0})}>Roast queue</span>
      {open && (
        <div style={{position:"relative",flex:1,height:20,minWidth:0}}>
          <div style={{position:"absolute",top:"50%",left:0,right:0,height:6,transform:"translateY(-50%)",background:"var(--roast-empty)",borderRadius:"var(--r-pill)"}}/>
          {ticks.map(h=>(
            <div key={h} style={{position:"absolute",bottom:-3,left:pct(h)+"%",...CO.data({fontSize:8.5,color:"var(--ink-subtle)"}),transform:"translateX(-50%)"}}>{fmtTime(h)}</div>
          ))}
          {queue.map(b=>{
            const l=pct(b.start), w=pct(b.end)-pct(b.start), isLive=b===live;
            return <div key={b.id} title={`${customerById(b.customer).name} · ${b.profile}`} style={{position:"absolute",top:"50%",transform:"translateY(-50%)",left:l+"%",width:w+"%",height:isLive?12:8,background:roastColor(roastLevel(b.profile)),borderRadius:"var(--r-pill)",boxShadow:isLive?"0 0 0 2px var(--brand)":"inset 0 0 0 1px rgba(0,0,0,.12)"}}/>;
          })}
          <div style={{position:"absolute",top:-2,bottom:2,left:pct(NOW)+"%",width:2,background:"var(--brand)"}}>
            <span style={{position:"absolute",top:-4,left:-3,width:8,height:8,borderRadius:"50%",background:"var(--brand)",animation:"co-pulse 1.5s ease-in-out infinite"}}/>
          </div>
        </div>
      )}
      {open && live && (
        <span style={{display:"inline-flex",alignItems:"center",gap:8,whiteSpace:"nowrap",flexShrink:0}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:"var(--brand)",animation:"co-pulse 1.5s ease-in-out infinite"}}/>
          <span style={CO.data({fontSize:12,color:"var(--ink)"})}>{liveCust.name.split(" ")[0]} · drop {fmtTime(live.end)}</span>
        </span>
      )}
      <button onClick={()=>setOpen(o=>!o)} style={{...CO.over({fontSize:10,color:"var(--ink-muted)"}),background:"none",border:"none",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:5,whiteSpace:"nowrap",flexShrink:0}}>{open?"Collapse ▴":"Expand ▾"}</button>
    </div>
  );
};

// ---- ruled tabs ----
const Tabs = ({ tabs, active, onChange }) => (
  <div style={{display:"flex",gap:24,borderBottom:"1px solid var(--hairline)"}}>
    {tabs.map(t=>{
      const on = t.id===active;
      return (
        <button key={t.id} onClick={()=>onChange(t.id)} style={{background:"none",border:"none",cursor:"pointer",padding:"0 0 11px",display:"inline-flex",alignItems:"center",gap:7,borderBottom:on?"2px solid var(--brand)":"2px solid transparent",marginBottom:-1,color:on?"var(--ink)":"var(--ink-muted)",fontFamily:"var(--font-sans)",fontSize:14,fontWeight:on?600:500}}>
          {t.label}
          {t.count!=null && <span style={CO.data({fontSize:11,color:on?"var(--brand)":"var(--ink-subtle)"})}>{t.count}</span>}
        </button>
      );
    })}
  </div>
);

// ---- segmented control (active = ink fill) ----
const Segmented = ({ options, value, onChange }) => (
  <div style={{display:"inline-flex",background:"var(--surface)",border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",padding:2,gap:2,flexShrink:0}}>
    {options.map(o=>{
      const on = o.id===value;
      return <button key={o.id} onClick={()=>onChange(o.id)} style={{padding:"5px 13px",borderRadius:"var(--r-sm)",border:"none",cursor:"pointer",background:on?"var(--ink)":"transparent",color:on?"var(--on-ink)":"var(--ink-muted)",fontFamily:"var(--font-sans)",fontSize:12.5,fontWeight:on?600:500,whiteSpace:"nowrap"}}>{o.label}</button>;
    })}
  </div>
);

// ---- faux select ----
const Select = ({ children }) => (
  <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"0 12px",height:34,border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",background:"var(--surface)",fontFamily:"var(--font-sans)",fontSize:13,color:"var(--ink-muted)",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{children}<span style={{fontSize:9,color:"var(--ink-subtle)"}}>▾</span></div>
);

// ---- search input ----
const SearchInput = ({ placeholder="Search", sunken=false }) => (
  <div style={{display:"flex",alignItems:"center",gap:9,padding:"0 12px",height:34,background:sunken?"var(--surface-sunken)":"var(--surface)",border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",flex:1,minWidth:0}}>
    <span style={{color:"var(--ink-subtle)",display:"inline-flex",flexShrink:0}}><I name="search" size={15} stroke={2}/></span>
    <input placeholder={placeholder} style={{flex:1,minWidth:0,border:"none",outline:"none",background:"transparent",fontFamily:"var(--font-sans)",fontSize:13,color:"var(--ink)"}}/>
    <Kbd>⌘K</Kbd>
  </div>
);

// ---- utility icon button (topbar) ----
const IconBtn = ({ name, badge }) => (
  <button style={{position:"relative",width:34,height:34,borderRadius:"var(--r-md)",border:"1px solid var(--hairline)",background:"var(--surface)",color:"var(--ink-muted)",cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center"}}>
    <I2 name={name} size={17} stroke={2}/>
    {badge && <span style={{position:"absolute",top:-3,right:-3,width:8,height:8,borderRadius:"50%",background:"var(--brand)",border:"2px solid var(--surface)"}}/>}
  </button>
);

Object.assign(window, { CO, roastLevel, roastColor, RoastDot, StatusBadge, Kbd, HeroMetric, StatStrip, BatchStrip, Tabs, Segmented, Select, SearchInput, IconBtn });
