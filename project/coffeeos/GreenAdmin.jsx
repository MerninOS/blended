// CoRoasted × CoffeeOS — Green catalog, facility side.
// The coffees customers can put in a blend on the shop page: photo, cupping
// scores that drive the tasting wheel, price, on-hand, preferred roast level.
// Saves to localStorage("cr_green_catalog"), which PrivateLabelData reads on load.

const GC_PROCESS = ["Washed","Natural","Honey","Co-ferment","Anaerobic","Sugarcane EA"];
const GC_KEY = "cr_green_catalog";

const gcLoad = () => {
  try { const s = JSON.parse(localStorage.getItem(GC_KEY)); if (Array.isArray(s) && s.length) return s; } catch(e){}
  return PL_GREEN.map(c=>({...c, notes:{...c.notes}, listed: c.avail > 0}));
};
const gcSave = (rows) => { try { localStorage.setItem(GC_KEY, JSON.stringify(rows)); } catch(e){} };

const gcBlank = () => ({ id:"lot-"+Date.now().toString(36), name:"", origin:"", lot:"", process:"Washed",
  roast:3, price:7.00, wholesale:null, retail:null, avail:0, minG:PL_MING_DEFAULT, kind:"anchor", tag:null, listed:true, notes:{} });

const gcRoastedCost = (p) => p/0.84;                       // green lb → roasted lb
const gcWholesale = (r) => r.wholesale != null ? r.wholesale : Math.round(gcRoastedCost(r.price)*1.85*20)/20;
const gcRetail    = (r) => r.retail    != null ? r.retail    : Math.round(gcRoastedCost(r.price)*2.60*20)/20;

const gcTop = (notes) => PL_AX.map(a=>({l:a.l, v:notes[a.k]||0})).filter(n=>n.v>0).sort((a,b)=>b.v-a.v).slice(0,3);

// ---------- small radar preview (same geometry as the shop wheel) ----------
const GCWheel = ({ notes, roast }) => {
  const g = plGeom(notes);
  const rgb = plRampColor(roast);
  const soft = (a) => rgb.replace("rgb(","rgba(").replace(")",`,${a})`);
  const empty = PL_AX.every(a=>!(notes[a.k]>0));
  return (
    <div style={{position:"relative",width:"100%",aspectRatio:"1 / 1"}}>
      <svg viewBox="0 0 480 480" style={{position:"absolute",inset:0,width:"100%",height:"100%"}}>
        {[150,109,68,27].map(r=><circle key={r} cx="240" cy="240" r={r} fill="none" stroke="var(--viz-grid)" strokeWidth="1"/>)}
        {g.axes.map((a,i)=><line key={i} x1="240" y1="240" x2={a.sx.toFixed(1)} y2={a.sy.toFixed(1)} stroke="var(--viz-grid)" strokeWidth="1"/>)}
        {!empty && <><path d={g.p2} fill={soft(.16)}/><path d={g.p1} fill={soft(.26)} stroke={rgb} strokeWidth="2.5" strokeLinejoin="round"/></>}
      </svg>
      {empty && <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"0 18%",fontFamily:"var(--font-sans)",fontSize:12.5,lineHeight:1.5,color:"var(--ink-subtle)"}}>Score the cup below and the wheel fills in.</div>}
    </div>
  );
};

const GCHead = ({ label, right }) => (
  <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:12,paddingBottom:9,borderBottom:"1px solid var(--hairline-strong)"}}>
    <span style={CO.over({fontSize:10,color:"var(--ink-muted)"})}>{label}</span>
    {right && <span style={CO.data({fontSize:11.5,color:"var(--ink-subtle)"})}>{right}</span>}
  </div>
);

const GCField = ({ label, hint, children }) => (
  <label style={{display:"flex",flexDirection:"column",gap:6,minWidth:0}}>
    <span style={CO.over({fontSize:9.5,color:"var(--ink-muted)"})}>{label}</span>
    {children}
    {hint && <span style={{fontFamily:"var(--font-sans)",fontSize:11.5,color:"var(--ink-subtle)"}}>{hint}</span>}
  </label>
);

const gcInput = { width:"100%", padding:"9px 11px", border:"1px solid var(--hairline-strong)", borderRadius:"var(--r-sm)", background:"var(--surface)", color:"var(--ink)", fontFamily:"var(--font-sans)", fontSize:13.5 };
const gcMonoInput = { ...gcInput, fontFamily:"var(--font-mono)", fontVariationSettings:"var(--data-settings)" };

// ---------- editor ----------
const GCEditor = ({ row, onChange, onClose, onSave, onDelete, isNew }) => {
  if (!row) return null;
  const set = (k,v) => onChange({...row, [k]:v});
  const setNote = (k,v) => onChange({...row, notes:{...row.notes, [k]:v}});
  // the admin-side Btn ignores `disabled`, so the guard lives here
  const problem = !row.name.trim() ? "Name the coffee before saving."
    : !row.origin.trim() ? "Add an origin before saving."
    : PL_AX.every(a=>!(row.notes[a.k]>0)) ? "Score at least one tasting note — the wheel is built from these."
    : null;

  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(36,24,18,.38)",zIndex:400,animation:"co-fade .14s ease"}}/>
      <aside style={{position:"fixed",top:0,right:0,bottom:0,width:"min(600px,96vw)",zIndex:401,background:"var(--surface)",borderLeft:"1px solid var(--hairline)",boxShadow:"var(--shadow-modal)",display:"flex",flexDirection:"column",animation:"co-slide .18s cubic-bezier(.2,.6,.2,1)"}}>
        <div style={{padding:"18px 22px 16px",borderBottom:"1px solid var(--hairline)",display:"flex",alignItems:"flex-start",gap:14,flexShrink:0}}>
          <span style={{width:40,height:40,flexShrink:0,borderRadius:"var(--r-md)",background:"var(--surface-sunken)",display:"inline-flex",alignItems:"center",justifyContent:"center",color:plRampColor(row.roast)}}><I name="flame" size={19} stroke={2}/></span>
          <div style={{flex:1,minWidth:0}}>
            <div style={CO.over({fontSize:9.5,color:"var(--ink-subtle)"})}>{isNew ? "New green lot" : row.lot || "No lot code"}</div>
            <h2 style={CO.display({fontSize:21,lineHeight:1.05,margin:"5px 0 0",color:"var(--ink)"})}>{row.name.trim() || "Untitled coffee"}</h2>
          </div>
          <button onClick={onClose} aria-label="Close" style={{width:32,height:32,flexShrink:0,border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",background:"var(--surface)",color:"var(--ink-muted)",cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center"}}><I2 name="x" size={16} stroke={2}/></button>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"18px 22px 24px",display:"flex",flexDirection:"column",gap:26}}>
          {/* identity */}
          <section style={{display:"flex",gap:16,flexWrap:"wrap"}}>
            <div style={{width:128,flexShrink:0}}>
              <div style={CO.over({fontSize:9.5,color:"var(--ink-muted)",marginBottom:6})}>Photo</div>
              <div style={{width:128,height:128}}><image-slot id={`green-${row.id}`} shape="rounded" radius="5" placeholder="Drop photo"></image-slot></div>
            </div>
            <div style={{flex:"1 1 260px",minWidth:240,display:"flex",flexDirection:"column",gap:12}}>
              <GCField label="Coffee name"><input value={row.name} onChange={e=>set("name",e.target.value)} placeholder="Cerrado Norte" style={gcInput}/></GCField>
              <GCField label="Origin"><input value={row.origin} onChange={e=>set("origin",e.target.value)} placeholder="Brazil · Minas Gerais" style={gcInput}/></GCField>
              <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                <div style={{flex:"1 1 140px"}}><GCField label="Lot code"><input value={row.lot} onChange={e=>set("lot",e.target.value)} placeholder="LOT-2571" style={gcMonoInput}/></GCField></div>
                <div style={{flex:"1 1 140px"}}><GCField label="Process"><select value={row.process} onChange={e=>set("process",e.target.value)} style={gcInput}>{GC_PROCESS.map(p=><option key={p}>{p}</option>)}</select></GCField></div>
              </div>
            </div>
          </section>

          {/* commercials */}
          <section>
            <GCHead label="Price and stock"/>
            <div style={{display:"flex",gap:14,flexWrap:"wrap",marginTop:14}}>
              <div style={{flex:"1 1 150px"}}><GCField label="Green cost $ / lb" hint={`${plMoney(gcRoastedCost(row.price))}/lb roasted after 16% loss`}>
                <input type="number" step="0.05" value={row.price} onChange={e=>set("price",Math.max(0,+e.target.value||0))} style={gcMonoInput}/></GCField></div>
              <div style={{flex:"1 1 150px"}}><GCField label="On hand (green lb)" hint={row.avail===0?"Zero hides it from the blend builder":undefined}>
                <input type="number" value={row.avail} onChange={e=>set("avail",Math.max(0,+e.target.value||0))} style={gcMonoInput}/></GCField></div>
              <div style={{flex:"1 1 170px"}}><GCField label="Min in a blend (g)" hint={plMinG(row) ? `${plMinPctFor(row, 1*PL_G_PER_LB)}% of a 1 lb bag · ${plMinPctFor(row, 5*PL_G_PER_LB)}% of a 5 lb run` : "No floor — any share allowed."}>
                <input type="number" min="0" step="10" value={row.minG!=null?row.minG:PL_MING_DEFAULT} onChange={e=>set("minG",Math.max(0,Math.round(+e.target.value||0)))} style={gcMonoInput}/></GCField></div>
              <div style={{flex:"1 1 150px"}}><GCField label="Badge">
                <select value={row.tag||""} onChange={e=>set("tag",e.target.value||null)} style={gcInput}>
                  <option value="">None</option><option>Limited</option><option>New</option><option>Back in Oct</option>
                </select></GCField></div>
            </div>
            <div style={{display:"flex",gap:14,flexWrap:"wrap",marginTop:14}}>
              <div style={{flex:"1 1 200px"}}><GCField label="Wholesale $ / lb roasted" hint={`${(gcWholesale(row)/Math.max(.01,gcRoastedCost(row.price))).toFixed(2)}× cost · what roasters pay`}>
                <input type="number" step="0.05" value={gcWholesale(row)} onChange={e=>set("wholesale",Math.max(0,+e.target.value||0))} style={gcMonoInput}/></GCField></div>
              <div style={{flex:"1 1 200px"}}><GCField label="Retail $ / lb roasted" hint={`${(gcRetail(row)/Math.max(.01,gcRoastedCost(row.price))).toFixed(2)}× cost · ${plMoney(Math.round(gcRetail(row)*0.5*1.2*4)/4)} an 8 oz bag on the shop`}>
                <input type="number" step="0.05" value={gcRetail(row)} onChange={e=>set("retail",Math.max(0,+e.target.value||0))} style={gcMonoInput}/></GCField></div>
              <div style={{flex:"1 1 150px",display:"flex",alignItems:"flex-end"}}>
                <button onClick={()=>onChange({...row, wholesale:null, retail:null})} style={{padding:0,border:"none",background:"transparent",cursor:"pointer",fontFamily:"var(--font-sans)",fontSize:12,color:"var(--brand)",paddingBottom:10}}>Reset to standard markup</button>
              </div>
            </div>
          </section>

          {/* roast */}
          <section>
            <GCHead label="Preferred roast" right={`Agtron ${[75,75,67,58,50,42][Math.round(row.roast)]} · drop ${[396,396,407,417,427,436][Math.round(row.roast)]}°F`}/>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(96px,1fr))",gap:6,marginTop:14}}>
              {[1,2,3,4,5].map(n=>{
                const on = Math.round(row.roast)===n;
                return (
                  <button key={n} onClick={()=>set("roast",n)} style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:8,padding:"9px 9px 10px",cursor:"pointer",textAlign:"left",
                    border:`1px solid ${on?"var(--brand)":"var(--hairline-strong)"}`,background:on?"var(--brand-soft)":"var(--surface)",borderRadius:"var(--r-sm)"}}>
                    <span style={{width:"100%",height:6,borderRadius:2,background:`var(--roast-${n})`}}/>
                    <span style={CO.over({fontSize:9.5,color:on?"var(--brand-hover)":"var(--ink)"})}>{plRoastName(n)}</span>
                    <span style={{fontFamily:"var(--font-sans)",fontSize:11,lineHeight:1.3,color:"var(--ink-subtle)"}}>{["","Tea, acidity forward","Sweet, fruit intact","Balanced, caramel","Cocoa, low acid","Smoke, syrupy"][n]}</span>
                  </button>
                );
              })}
            </div>
            <p style={{margin:"10px 0 0",fontFamily:"var(--font-sans)",fontSize:12,lineHeight:1.5,color:"var(--ink-subtle)"}}>Customers can move the roast on their blend. This is where the builder starts, and what the wheel is scored at.</p>
          </section>

          {/* cupping */}
          <section>
            <GCHead label="Tasting notes" right="0–10 cupping scores"/>
            <div style={{display:"flex",gap:20,flexWrap:"wrap",marginTop:14}}>
              <div style={{flex:"1 1 260px",minWidth:240,display:"flex",flexDirection:"column",gap:9}}>
                {PL_AX.map(a=>{
                  const v = row.notes[a.k]||0;
                  return (
                    <div key={a.k} style={{display:"flex",alignItems:"center",gap:11}}>
                      <span style={{width:82,flexShrink:0,...CO.over({fontSize:9,color:v?"var(--ink)":"var(--ink-subtle)"})}}>{a.l}</span>
                      <input type="range" min="0" max="10" step="0.5" value={v} onChange={e=>setNote(a.k,+e.target.value)}
                        style={{flex:1,minWidth:0,accentColor:"var(--ink)",cursor:"pointer"}}/>
                      <span style={{width:28,textAlign:"right",...CO.data({fontSize:12,color:v?"var(--ink)":"var(--ink-subtle)"})}}>{v?v.toFixed(1):"—"}</span>
                    </div>
                  );
                })}
                <button onClick={()=>onChange({...row, notes:{}})} style={{alignSelf:"flex-start",marginTop:4,padding:0,border:"none",background:"transparent",cursor:"pointer",fontFamily:"var(--font-sans)",fontSize:12,color:"var(--brand)"}}>Clear all scores</button>
              </div>
              <div style={{flex:"0 1 210px",minWidth:180}}>
                <GCWheel notes={row.notes} roast={row.roast}/>
                <div style={{marginTop:8,textAlign:"center",...CO.data({fontSize:11.5,color:"var(--ink-subtle)"})}}>{gcTop(row.notes).map(n=>n.l).join(" · ") || "No notes yet"}</div>
              </div>
            </div>
          </section>

          {/* listing */}
          <section>
            <GCHead label="Listing"/>
            <div style={{display:"flex",alignItems:"center",gap:14,padding:"14px 0 0"}}>
              <button onClick={()=>set("listed",!row.listed)} aria-label="Toggle listing" style={{width:38,height:22,flexShrink:0,borderRadius:11,border:"1px solid var(--hairline-strong)",background:row.listed?"var(--ink)":"var(--surface-sunken)",cursor:"pointer",padding:2,display:"flex",justifyContent:row.listed?"flex-end":"flex-start",transition:"all var(--dur) var(--ease)"}}>
                <span style={{width:16,height:16,borderRadius:"50%",background:row.listed?"var(--on-ink)":"var(--surface)",boxShadow:"var(--shadow-sm)"}}/>
              </button>
              <span style={{flex:1,minWidth:0,fontFamily:"var(--font-sans)",fontSize:13,lineHeight:1.55,color:"var(--ink-muted)"}}>
                {row.listed ? "Showing in the blend builder on the shop page." : "Hidden from customers. Existing blends that use it keep running."}
              </span>
            </div>
          </section>
        </div>

        <div style={{padding:"14px 22px",borderTop:"1px solid var(--hairline)",display:"flex",alignItems:"center",gap:10,flexShrink:0,flexWrap:"wrap"}}>
          {!isNew && <Btn size="sm" variant="ghost" onClick={()=>onDelete(row)}>Delete</Btn>}
          {problem && <span style={{flex:"1 1 220px",minWidth:0,fontFamily:"var(--font-sans)",fontSize:12,lineHeight:1.45,color:"var(--danger)"}}>{problem}</span>}
          {!problem && <div style={{flex:1}}/>}
          <Btn size="sm" variant="outline" onClick={onClose}>Cancel</Btn>
          <span style={{display:"inline-flex",opacity:problem?.45:1,pointerEvents:problem?"none":"auto"}} aria-disabled={!!problem}>
            <Btn size="sm" variant="primary" disabled={!!problem} icon={<I name="check" size={14}/>} onClick={()=>{ if(!problem) onSave(row); }}>{isNew ? "Add coffee" : "Save changes"}</Btn>
          </span>
        </div>
      </aside>
    </>
  );
};

// ---------- the view ----------
const GreenCatalogView = () => {
  const [rows, setRows] = React.useState(gcLoad);
  const [draft, setDraft] = React.useState(null);
  const [isNew, setIsNew] = React.useState(false);

  const commit = (next) => { setRows(next); gcSave(next); };
  const save = (row) => {
    if (!row.name.trim() || !row.origin.trim() || PL_AX.every(a=>!(row.notes[a.k]>0))) return;
    const next = rows.some(r=>r.id===row.id) ? rows.map(r=>r.id===row.id?row:r) : [...rows, row];
    commit(next); setDraft(null);
  };
  const del = (row) => { commit(rows.filter(r=>r.id!==row.id)); setDraft(null); };

  const listed = rows.filter(r=>r.listed && r.avail>0);
  const lbs = rows.reduce((a,r)=>a+r.avail, 0);
  const value = rows.reduce((a,r)=>a+r.avail*r.price, 0);
  const unscored = rows.filter(r=>PL_AX.every(a=>!(r.notes[a.k]>0)));

  return (
    <div style={{display:"flex",flexDirection:"column",gap:24,padding:"20px 24px 40px",maxWidth:"var(--content-max)"}}>
      <div style={{display:"flex",flexDirection:"column",gap:18}}>
        <HeroMetric label="Green lots customers can blend" value={listed.length}
          caption={`${rows.length} in the catalog · ${lbs.toLocaleString()} lb on hand${unscored.length?` · ${unscored.length} missing tasting notes`:""}`}/>
        <StatStrip items={[
          { label:"Green value", value:plMoney0(value) },
          { label:"Hidden",      value:rows.length - listed.length },
          { label:"Out of stock",value:rows.filter(r=>r.avail===0).length },
          { label:"Avg retail $ / lb", value:plMoney(rows.length?rows.reduce((a,r)=>a+gcRetail(r),0)/rows.length:0) },
        ]}/>
      </div>

      <div style={{display:"flex",alignItems:"center",gap:10,padding:10,background:"var(--surface-sunken)",border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",flexWrap:"wrap"}}>
        <div style={{maxWidth:320,flex:1,display:"flex",minWidth:200}}><SearchInput placeholder="Coffee, origin, or lot"/></div>
        <div style={{flex:1}}/>
        <Btn size="sm" variant="primary" icon={<I name="plus" size={14}/>} onClick={()=>{ setDraft(gcBlank()); setIsNew(true); }}>Add coffee</Btn>
      </div>

      <div style={{border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",overflow:"hidden",background:"var(--surface)"}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:1120}}>
            <thead>
              <tr style={{background:"var(--surface-sunken)",borderBottom:"1px solid var(--hairline)"}}>
                {[["Coffee","left"],["Process","left"],["Roast","left"],["Tasting notes","left"],["Green $","right"],["Wholesale","right"],["Retail","right"],["On hand","right"],["Min in blend","right"],["Listed","left"]].map(([h,al],i)=>(
                  <th key={i} style={{textAlign:al,padding:"9px 14px",whiteSpace:"nowrap",...CO.over({fontSize:10,color:"var(--ink-muted)"})}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(r=>{
                const top = gcTop(r.notes);
                return (
                  <tr key={r.id} onClick={()=>{ setDraft({...r, notes:{...r.notes}}); setIsNew(false); }} style={{borderBottom:"1px solid var(--hairline)",cursor:"pointer"}}
                    onMouseOver={e=>e.currentTarget.style.background="var(--surface-hover)"}
                    onMouseOut={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{padding:"11px 14px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <div style={{width:44,height:44,flexShrink:0}}><image-slot id={`green-${r.id}`} shape="rounded" radius="5" placeholder=" "></image-slot></div>
                        <div style={{minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{fontFamily:"var(--font-sans)",fontSize:13.5,fontWeight:600,color:"var(--ink)",whiteSpace:"nowrap"}}>{r.name || "Untitled"}</span>
                            {r.tag && <Pill variant="tomato">{r.tag}</Pill>}
                          </div>
                          <div style={CO.data({fontSize:11,color:"var(--ink-subtle)",marginTop:2})}>{[r.lot, r.origin].filter(Boolean).join(" · ")}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{padding:"11px 14px"}}><span style={CO.over({fontSize:9.5,color:"var(--ink-muted)",whiteSpace:"nowrap"})}>{r.process}</span></td>
                    <td style={{padding:"11px 14px"}}>
                      <span style={{display:"inline-flex",alignItems:"center",gap:8,whiteSpace:"nowrap"}}>
                        <span style={{width:11,height:11,borderRadius:"var(--r-sm)",background:plRampColor(r.roast),boxShadow:"inset 0 0 0 1px rgba(0,0,0,.14)"}}/>
                        <span style={CO.over({fontSize:9.5,color:"var(--ink-muted)"})}>{plRoastName(r.roast)}</span>
                      </span>
                    </td>
                    <td style={{padding:"11px 14px"}}>
                      {top.length
                        ? <span style={{display:"flex",gap:6,flexWrap:"wrap"}}>{top.map(n=><Pill key={n.l} variant="cream">{n.l} {n.v.toFixed(0)}</Pill>)}</span>
                        : <span style={{fontFamily:"var(--font-sans)",fontSize:12,color:"var(--danger)"}}>Not scored</span>}
                    </td>
                    <td style={{padding:"11px 14px",textAlign:"right"}}><span style={CO.data({fontSize:12.5,color:"var(--ink-muted)"})}>{plMoney(r.price)}</span></td>
                    <td style={{padding:"11px 14px",textAlign:"right"}}><span style={CO.data({fontSize:13,color:"var(--ink)"})}>{plMoney(gcWholesale(r))}</span></td>
                    <td style={{padding:"11px 14px",textAlign:"right"}}><span style={CO.data({fontSize:13,color:"var(--ink)"})}>{plMoney(gcRetail(r))}</span></td>
                    <td style={{padding:"11px 14px",textAlign:"right"}}><span style={CO.data({fontSize:13,color:r.avail===0?"var(--danger)":r.avail<500?"var(--warning)":"var(--ink)"})}>{r.avail.toLocaleString()}</span></td>
                    <td style={{padding:"11px 14px",textAlign:"right"}}><span style={CO.data({fontSize:13,color:plMinG(r)?"var(--ink)":"var(--ink-subtle)"})}>{plMinG(r)?plMinG(r)+" g":"—"}</span></td>
                    <td style={{padding:"11px 14px"}}>
                      {r.avail===0 ? <Pill variant="cream">Out</Pill> : r.listed ? <Pill variant="matcha">Listed</Pill> : <Pill variant="cream">Hidden</Pill>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,padding:"10px 14px",borderTop:"1px solid var(--hairline)"}}>
          <span style={{fontSize:12,color:"var(--ink-muted)",fontFamily:"var(--font-sans)"}}>{rows.length} coffees · changes go live on the shop page</span>
          <Btn size="sm" variant="outline" onClick={()=>{ localStorage.removeItem(GC_KEY); setRows(gcLoad()); }}>Reset to defaults</Btn>
        </div>
      </div>

      <GCEditor row={draft} isNew={isNew} onChange={setDraft} onClose={()=>setDraft(null)} onSave={save} onDelete={del}/>
    </div>
  );
};

Object.assign(window, { GreenCatalogView, GCEditor, GCWheel, GCHead, gcLoad, gcSave, gcWholesale, gcRetail, GC_KEY });
