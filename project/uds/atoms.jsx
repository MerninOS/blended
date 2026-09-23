// CoRoasted — extra primitives that extend src/primitives.jsx
// Adds icons we need + small UI atoms specific to a roasting facility.

const I2 = ({ name, size=18, stroke=2.2 }) => {
  const p = {
    cal:    <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    clock:  <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    cash:   <><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><line x1="6" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="18" y2="12"/></>,
    box:    <><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/></>,
    grid:   <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
    bolt:   <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
    coffee: <><path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></>,
    list:   <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/></>,
    chevR:  <polyline points="9 18 15 12 9 6"/>,
    chevL:  <polyline points="15 18 9 12 15 6"/>,
    x:      <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    repeat: <><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></>,
    bell:   <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    alert:  <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
    user:   <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    dollar: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
    therm:  <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    filter: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>,
    edit:   <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    map:    <><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></>,
    today:  <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="12" cy="16" r="2" fill="currentColor"/></>,
    phone:  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>,
    mail:   <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    check:  <polyline points="20 6 9 17 4 12"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{display:"inline-block",verticalAlign:"middle",flexShrink:0}}>{p[name]}</svg>;
};

// Type chip for a booking — colored pill with the type label
const TypeChip = ({ type, size="sm" }) => {
  const meta = BOOKING_TYPES[type] || BOOKING_TYPES.toll;
  const padY = size==="sm" ? 2 : 4;
  const padX = size==="sm" ? 8 : 12;
  const fs = size==="sm" ? 10 : 11;
  return <span style={{
    display:"inline-flex",alignItems:"center",padding:`${padY}px ${padX}px`,
    borderRadius:11999,border:"1px solid var(--color-border)",
    background:`var(--color-${meta.color})`,color:`var(--color-${meta.fg})`,
    fontWeight:800,fontSize:fs,letterSpacing:".1em",whiteSpace:"nowrap"
  }}>{meta.label}</span>;
};

// Avatar — color-blocked monogram
const Avatar = ({ customer, size=32 }) => {
  const c = customerById(customer);
  const initials = c.name.split(/\s+/).slice(0,2).map(s=>s[0]).join("").toUpperCase();
  // Stable color from id
  const palette = ["tomato","sun","sky","honey","matcha","roast"];
  const idx = (c.id ? c.id.charCodeAt(c.id.length-1) : 0) % palette.length;
  const color = palette[idx];
  const fg = (color==="sun"||color==="sky"||color==="cream") ? "espresso" : "cream";
  return <div style={{
    width:size,height:size,borderRadius:11999,
    background:`var(--color-${color})`,color:`var(--color-${fg})`,
    border:"1px solid var(--color-border)",
    display:"inline-flex",alignItems:"center",justifyContent:"center",
    fontFamily:"var(--font-body)",fontWeight:800,fontSize:size*0.4,letterSpacing:".02em",flexShrink:0
  }}>{initials}</div>;
};

// Status dot
const Dot = ({ color="matcha", pulse=false, size=8 }) => (
  <span style={{
    display:"inline-block",width:size,height:size,borderRadius:11999,
    background:`var(--color-${color})`,border:"1px solid var(--color-border)",
    animation:pulse?"co-pulse 1.5s ease-in-out infinite":"none",flexShrink:0,
  }}/>
);

Object.assign(window, { I2, TypeChip, Avatar, Dot });
