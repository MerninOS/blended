// Roaster Portal × CoffeeOS — primitive overrides.
// Loaded AFTER src/primitives.jsx + src/atoms.jsx so these window exports win.
// Reskins the shared atoms to CoffeeOS: ink = action, red = live register,
// hairline borders, tight radii (buttons never pill), mono figures, no offset shadows.

// ---- Button: action = ink, never pill, borders-first ----
const Btn = ({ variant="primary", size="md", children, onClick, icon, iconLeft, disabled, style }) => {
  const V = {
    primary:  { bg:"var(--ink)",           fg:"var(--on-ink)",     bd:"var(--ink)" },
    dark:     { bg:"var(--ink)",           fg:"var(--on-ink)",     bd:"var(--ink)" },
    secondary:{ bg:"var(--surface-sunken)",fg:"var(--ink)",        bd:"var(--hairline)" },
    outline:  { bg:"var(--surface)",       fg:"var(--ink)",        bd:"var(--hairline-strong)" },
    sun:      { bg:"var(--surface-sunken)",fg:"var(--ink)",        bd:"var(--hairline)" },
    ghost:    { bg:"transparent",          fg:"var(--ink-muted)",  bd:"transparent" },
    danger:   { bg:"var(--danger)",        fg:"#fff",              bd:"var(--danger)" },
  }[variant] || {};
  const h  = { sm:32, md:38, lg:44 }[size];
  const px = { sm:12, md:16, lg:20 }[size];
  const fs = { sm:12.5, md:13.5, lg:14.5 }[size];
  return (
    <button onClick={disabled?undefined:onClick} className="co-btn" disabled={disabled} style={{
      display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,height:h,padding:`0 ${px}px`,
      borderRadius:"var(--r-md)",border:`1px solid ${V.bd}`,background:V.bg,color:V.fg,
      fontFamily:"var(--font-sans)",fontWeight:600,fontSize:fs,letterSpacing:0,textTransform:"none",
      cursor:disabled?"not-allowed":"pointer",boxShadow:"none",opacity:disabled?.5:1,whiteSpace:"nowrap",
      transition:"background var(--dur) var(--ease), transform var(--dur) var(--ease)",...style,
    }}>{iconLeft}{children}{icon}</button>
  );
};

// ---- Badge / Pill: tonal, meaningful. Red reserved for live. ----
const Pill = ({ variant="tomato", dot, pulse, children, style }) => {
  const M = {
    tomato:  { bg:"var(--brand-soft)",   fg:"var(--brand)",   d:"var(--brand)" },   // live register
    sun:     { bg:"var(--warning-soft)", fg:"var(--warning)", d:"var(--warning)" },
    matcha:  { bg:"var(--success-soft)", fg:"var(--success)", d:"var(--success)" },
    sky:     { bg:"var(--info-soft)",    fg:"var(--info)",    d:"var(--info)" },
    cream:   { bg:"var(--surface-sunken)",fg:"var(--ink-muted)",d:"var(--ink-subtle)" },
    fog:     { bg:"var(--surface-sunken)",fg:"var(--ink-muted)",d:"var(--ink-subtle)" },
    espresso:{ bg:"var(--ink)",          fg:"var(--on-ink)",  d:"var(--on-ink)" },
  }[variant] || {};
  return <span style={{display:"inline-flex",alignItems:"center",gap:6,padding:"3px 10px",borderRadius:"var(--r-pill)",
    background:M.bg,color:M.fg,fontFamily:"var(--font-mono)",fontVariationSettings:"var(--overline-settings)",
    fontWeight:600,fontSize:10,letterSpacing:".05em",textTransform:"uppercase",...style}}>
    {dot && <span style={{width:6,height:6,borderRadius:"50%",background:M.d,animation:pulse?"co-pulse 1.5s ease-in-out infinite":"none",flexShrink:0}}/>}
    {children}</span>;
};

// ---- Panel: worksheet container — hairline, no shadow, overline title ----
const Panel = ({ title, actions, children, noPadding, style }) => (
  <section style={{background:"var(--surface)",border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",overflow:"hidden",...style}}>
    {title && <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,padding:"11px 16px",borderBottom:"1px solid var(--hairline)",background:"var(--surface-sunken)"}}>
      <span style={{fontFamily:"var(--font-mono)",fontVariationSettings:"var(--overline-settings)",fontWeight:600,fontSize:11,letterSpacing:".08em",textTransform:"uppercase",color:"var(--ink-muted)"}}>{title}</span>
      {actions}
    </div>}
    <div style={{padding:noPadding?0:16}}>{children}</div>
  </section>
);

// ---- Field + input styling ----
const Field = ({ label, children }) => (
  <label style={{display:"flex",flexDirection:"column",gap:6}}>
    <span style={{fontFamily:"var(--font-mono)",fontVariationSettings:"var(--overline-settings)",fontWeight:600,fontSize:10.5,letterSpacing:".08em",textTransform:"uppercase",color:"var(--ink-muted)"}}>{label}</span>
    {children}
  </label>
);
const inp = {padding:"9px 12px",border:"1px solid var(--hairline-strong)",borderRadius:"var(--r-md)",background:"var(--surface)",fontFamily:"var(--font-sans)",fontSize:13.5,color:"var(--ink)",outline:"none",width:"100%"};

// ---- TypeChip: neutral pill + roast/semantic dot ----
const TYPE_DOT = { toll:"var(--roast-2)", coroast:"var(--roast-3)", sample:"var(--roast-1)", coach:"var(--info)", pack:"var(--roast-0)" };
const TypeChip = ({ type }) => {
  const meta = (typeof BOOKING_TYPES!=="undefined" && BOOKING_TYPES[type]) || {label:type};
  return <span style={{display:"inline-flex",alignItems:"center",gap:6,padding:"3px 9px",borderRadius:"var(--r-pill)",
    background:"var(--surface-sunken)",color:"var(--ink-muted)",fontFamily:"var(--font-mono)",
    fontVariationSettings:"var(--overline-settings)",fontWeight:600,fontSize:10,letterSpacing:".05em",textTransform:"uppercase",whiteSpace:"nowrap"}}>
    <span style={{width:7,height:7,borderRadius:"var(--r-sm)",background:TYPE_DOT[type]||"var(--ink-subtle)",flexShrink:0}}/>{meta.label}</span>;
};

// ---- Avatar: square r-md monogram, brand-soft ----
const Avatar = ({ customer, size=32 }) => {
  const c = customerById(customer);
  const initials = c.name.split(/\s+/).slice(0,2).map(s=>s[0]).join("").toUpperCase();
  return <div style={{width:size,height:size,borderRadius:"var(--r-md)",background:"var(--brand-soft)",color:"var(--brand-hover)",
    display:"inline-flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--font-mono)",
    fontVariationSettings:"var(--data-settings)",fontWeight:500,fontSize:size*0.36,flexShrink:0}}>{initials}</div>;
};

const Dot = ({ color="matcha", pulse=false, size=8 }) => {
  const map={tomato:"var(--brand)",matcha:"var(--success)",sun:"var(--warning)",sky:"var(--info)",fog:"var(--ink-subtle)",espresso:"var(--ink)"};
  return <span style={{display:"inline-block",width:size,height:size,borderRadius:"50%",background:map[color]||"var(--success)",animation:pulse?"co-pulse 1.5s ease-in-out infinite":"none",flexShrink:0}}/>;
};

// ---- shared type styles (used across every portal/storefront view) ----
const over = {fontFamily:"var(--font-mono)",fontVariationSettings:"var(--overline-settings)",fontWeight:600,letterSpacing:".08em",textTransform:"uppercase"};
const mono = {fontFamily:"var(--font-mono)",fontVariationSettings:"var(--data-settings)",fontVariantNumeric:"tabular-nums"};
const disp = {fontFamily:"var(--font-display)",fontVariationSettings:"var(--display-settings)",fontWeight:700,letterSpacing:"var(--display-tracking)",textTransform:"uppercase"};

const SVC_DOT = { toll:"var(--roast-2)", coroast:"var(--roast-3)", sample:"var(--roast-1)", coach:"var(--info)", pack:"var(--roast-0)" };

const Step = ({n, title, children}) => (
  <section className="pv-step" style={{display:"flex",flexDirection:"column",gap:12}}>
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <span className="pv-stepnum" style={{width:24,height:24,borderRadius:"var(--r-md)",background:"var(--ink)",color:"var(--on-ink)",display:"inline-flex",alignItems:"center",justifyContent:"center",...mono,fontSize:12,fontWeight:500}}>{n}</span>
      <h2 style={{...disp,fontSize:19,margin:0,color:"var(--ink)",lineHeight:1}}>{title}</h2>
    </div>
    {children}
  </section>
);

Object.assign(window, { Btn, Pill, Panel, Field, inp, TypeChip, TYPE_DOT, Avatar, Dot, over, mono, disp, Step, SVC_DOT });
