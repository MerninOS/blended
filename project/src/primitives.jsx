// CoffeeOS — primitives shared with CrowdRoast but stripped for admin context
// Same tokens, same patterns, but denser, dashboard-oriented.

const { useState } = React;

const Btn = ({ variant="primary", size="md", children, onClick, icon, style }) => {
  const bg = { primary:"var(--color-tomato)", secondary:"var(--color-cream)", dark:"var(--color-espresso)", sun:"var(--color-sun)", ghost:"transparent", outline:"transparent" }[variant];
  const fg = { primary:"var(--color-cream)", secondary:"var(--color-espresso)", dark:"var(--color-cream)", sun:"var(--color-espresso)", ghost:"var(--color-espresso)", outline:"var(--color-espresso)" }[variant];
  const hasBorder = variant !== "ghost";
  const h = { sm:30, md:38, lg:46 }[size];
  const px = { sm:14, md:20, lg:28 }[size];
  const fs = { sm:11, md:12.5, lg:14 }[size];
  return (
    <button onClick={onClick} className="co-btn" style={{
      display:"inline-flex", alignItems:"center", gap:8, height:h, padding:`0 ${px}px`, borderRadius:9999,
      border:hasBorder?"2.5px solid var(--color-espresso)":"none", background:bg, color:fg, fontFamily:"var(--font-body)",
      fontWeight:800, fontSize:fs, letterSpacing:".08em", textTransform:"uppercase", cursor:"pointer",
      boxShadow:hasBorder?"3px 3px 0 var(--color-espresso)":"none", transition:"all .12s var(--ease-snap)", whiteSpace:"nowrap", ...style,
    }}>{children}{icon}</button>
  );
};

const Pill = ({ variant="tomato", children, style }) => {
  const m = {
    tomato:{bg:"var(--color-tomato)",fg:"var(--color-cream)"},
    sun:{bg:"var(--color-sun)",fg:"var(--color-espresso)"},
    matcha:{bg:"var(--color-matcha)",fg:"var(--color-cream)"},
    sky:{bg:"var(--color-sky)",fg:"var(--color-espresso)"},
    cream:{bg:"var(--color-cream)",fg:"var(--color-espresso)"},
    espresso:{bg:"var(--color-espresso)",fg:"var(--color-cream)"},
    fog:{bg:"var(--color-fog)",fg:"var(--color-espresso)"},
  }[variant];
  return <span style={{
    display:"inline-flex",alignItems:"center",padding:"2px 10px",borderRadius:9999,
    border:"2px solid var(--color-espresso)",background:m.bg,color:m.fg,
    fontWeight:800,fontSize:10,letterSpacing:".1em",textTransform:"uppercase",...style,
  }}>{children}</span>;
};

const Panel = ({ title, actions, children, noPadding, style }) => (
  <div style={{background:"var(--color-chalk)",border:"3px solid var(--color-espresso)",borderRadius:16,boxShadow:"4px 4px 0 var(--color-espresso)",overflow:"hidden",...style}}>
    {title && <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:"2px solid var(--color-espresso)",background:"var(--color-cream)"}}>
      <div style={{fontFamily:"var(--font-display)",fontSize:18,textTransform:"uppercase",lineHeight:1}}>{title}</div>
      {actions}
    </div>}
    <div style={{padding:noPadding?0:16}}>{children}</div>
  </div>
);

const Stat = ({ label, value, delta, accent="tomato" }) => (
  <div style={{background:"var(--color-chalk)",border:"3px solid var(--color-espresso)",borderRadius:14,padding:16,boxShadow:"4px 4px 0 var(--color-espresso)"}}>
    <div style={{fontSize:10.5,fontWeight:800,letterSpacing:".12em",textTransform:"uppercase",color:"var(--fg2)"}}>{label}</div>
    <div style={{fontFamily:"var(--font-display)",fontSize:42,lineHeight:1,marginTop:6,color:"var(--color-espresso)"}}>{value}</div>
    {delta && <div style={{display:"inline-flex",alignItems:"center",gap:4,marginTop:8,fontSize:11,fontWeight:800,letterSpacing:".08em",textTransform:"uppercase",color:delta.startsWith("+")?"var(--color-matcha)":"var(--color-tomato)"}}>{delta}</div>}
  </div>
);

// Shared Lucide icons for admin
const I = ({ name, size=18, stroke=2.2 }) => {
  const p = {
    dash: <><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></>,
    pkg: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
    flame: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    cart: <><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></>,
    bag: <><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></>,
    cog: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    arrow: <path d="M5 12h14M13 6l6 6-6 6"/>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    bean: <><path d="M12 2C7 2 3 6 3 11c0 5 4 9 9 9s9-4 9-9c0-5-4-9-9-9z"/><path d="M8 7c2 3 6 7 8 10"/></>,
    up: <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></>,
    down: <><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></>,
    check: <polyline points="20 6 9 17 4 12"/>,
    coffee: <><path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></>,
    bolt: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    box: <><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/></>,
    clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    cash: <><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></>,
    dollar: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
    therm: <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>,
    grid: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
    list: <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/></>,
    bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    alert: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
    chevR: <polyline points="9 18 15 12 9 6"/>,
    cal: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{display:"inline-block",verticalAlign:"middle",flexShrink:0}}>{p[name]}</svg>;
};

Object.assign(window, { Btn, Pill, Panel, Stat, I });
