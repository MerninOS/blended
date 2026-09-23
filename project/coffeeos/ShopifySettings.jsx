// CoRoasted × CoffeeOS — Settings: Shopify integration.
// Every checkout on the storefront is written into Shopify: retail carts become
// orders on the Online Store channel, wholesale runs become draft orders on terms.
// Worksheet layout — ruled sections, no nested cards.

const sxOver = (o={}) => CO.over({fontSize:10,color:"var(--ink-muted)",...o});
const sxInp  = {width:"100%",padding:"8px 11px",border:"1px solid var(--hairline-strong)",borderRadius:"var(--r-md)",background:"var(--surface)",color:"var(--ink)",fontFamily:"var(--font-sans)",fontSize:13.5,outline:"none"};

const SxField = ({ label, hint, children }) => (
  <label style={{display:"flex",flexDirection:"column",gap:6,minWidth:0}}>
    <span style={sxOver()}>{label}</span>
    {children}
    {hint && <span style={{fontFamily:"var(--font-sans)",fontSize:11.5,color:"var(--ink-subtle)",lineHeight:1.45}}>{hint}</span>}
  </label>
);

const SxSection = ({ title, note, right, children }) => (
  <section style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"flex",alignItems:"flex-end",gap:16,paddingBottom:9,borderBottom:"1px solid var(--hairline-strong)"}}>
      <div style={{flex:1,minWidth:0}}>
        <h2 style={CO.display({fontSize:17,margin:0,color:"var(--ink)",lineHeight:1.1,textTransform:"uppercase"})}>{title}</h2>
        {note && <p style={{margin:"7px 0 0",fontFamily:"var(--font-sans)",fontSize:13,lineHeight:1.55,color:"var(--ink-muted)",maxWidth:"72ch"}}>{note}</p>}
      </div>
      {right}
    </div>
    {children}
  </section>
);

const SxSwitch = ({ on, onChange }) => (
  <button role="switch" aria-checked={on} onClick={()=>onChange(!on)} style={{width:38,height:22,flexShrink:0,borderRadius:"var(--r-pill)",border:"1px solid "+(on?"var(--ink)":"var(--hairline-strong)"),background:on?"var(--ink)":"var(--surface-sunken)",cursor:"pointer",padding:2,display:"flex",justifyContent:on?"flex-end":"flex-start",transition:"all var(--dur) var(--ease)"}}>
    <span style={{width:16,height:16,borderRadius:"50%",background:on?"var(--on-ink)":"var(--surface)",boxShadow:"var(--shadow-sm)"}}/>
  </button>
);

const SxToggleRow = ({ title, desc, on, onChange, meta }) => (
  <div style={{display:"flex",alignItems:"flex-start",gap:16,padding:"13px 0",borderBottom:"1px solid var(--hairline)"}}>
    <div style={{flex:1,minWidth:0}}>
      <div style={{fontFamily:"var(--font-sans)",fontSize:13.5,fontWeight:600,color:"var(--ink)"}}>{title}</div>
      <div style={{fontFamily:"var(--font-sans)",fontSize:12.5,lineHeight:1.5,color:"var(--ink-muted)",marginTop:3,maxWidth:"66ch"}}>{desc}</div>
    </div>
    {meta && <span style={CO.data({fontSize:11.5,color:"var(--ink-subtle)",whiteSpace:"nowrap",paddingTop:3})}>{meta}</span>}
    <SxSwitch on={on} onChange={onChange}/>
  </div>
);

// ---- routing: what a checkout becomes on the Shopify side ----
const SX_ROUTES = [
  { id:"retail", channel:"Retail · Blend Lab", target:"Order", detail:"Online Store channel", pay:"Captured at checkout by Shopify Payments", tag:"channel:retail", roast:"Roast job created on paid" },
  { id:"wholesale", channel:"Wholesale · Private label", target:"Draft order", detail:"Sent as invoice, Net 30", pay:"Invoice on account terms", tag:"channel:wholesale · private-label", roast:"Roast job created on invoice accepted" },
];

const SX_MAP = [
  { from:"Listed green coffee", to:"Product", note:"One product per listed lot. Hidden lots are unpublished, not deleted." },
  { from:"Bag size (8 oz / 1 / 2 / 5 lb)", to:"Variant", note:"Price from the retail multiple on the green catalog." },
  { from:"Custom blend", to:"Custom line item", note:"Component lots and percentages ride as line-item properties." },
  { from:"Private label run", to:"Draft order line", note:"Packaging, label artwork and bag count attach as properties." },
  { from:"Roast level", to:"Metafield", note:"coroasted.roast_level — readable on the order printout." },
  { from:"Lot code", to:"Metafield", note:"coroasted.lot_code — written back when the batch drops." },
];

const SX_HOOKS = [
  { topic:"orders/create", use:"Opens the order on the Orders board", state:"Active", last:"2 min ago" },
  { topic:"orders/paid", use:"Releases the roast job to the floor", state:"Active", last:"2 min ago" },
  { topic:"draft_orders/update", use:"Moves accepted wholesale quotes into the queue", state:"Active", last:"41 min ago" },
  { topic:"fulfillments/create", use:"Pushes tracking back to the customer", state:"Active", last:"3 hr ago" },
  { topic:"refunds/create", use:"Pulls the job if it hasn't been charged", state:"Paused", last:"—" },
];

const SX_LOG = [
  { t:"09:42", ev:"orders/create", ref:"#1841", msg:"Retail · 2 items · imported" },
  { t:"09:41", ev:"inventory/set", ref:"Cerrado Yellow", msg:"On-hand 412 lb → Shopify" },
  { t:"09:12", ev:"draft_orders/update", ref:"PL-1046", msg:"Invoice accepted · roast job queued" },
  { t:"08:55", ev:"fulfillments/create", ref:"#1837", msg:"Tracking 9400 1102 … pushed" },
  { t:"08:31", ev:"products/update", ref:"Sierra Azul", msg:"Retail price $22.50 → Shopify" },
];

const SettingsView = () => {
  const [connected, setConnected] = React.useState(true);
  const [routeOn, setRouteOn] = React.useState({retail:true, wholesale:true});
  const [invOut, setInvOut] = React.useState(true);
  const [invIn, setInvIn]   = React.useState(false);
  const [autoFulfill, setAutoFulfill] = React.useState(true);
  const [holdBlend, setHoldBlend] = React.useState(true);
  const [customers, setCustomers] = React.useState(true);
  const [location, setLocation] = React.useState("Roastery · SE Portland");

  return (
    <div style={{maxWidth:1040,padding:"22px 24px 80px",display:"flex",flexDirection:"column",gap:34}}>

      {/* connection */}
      <section style={{display:"flex",alignItems:"center",gap:18,flexWrap:"wrap",padding:"16px 18px",border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",background:"var(--surface)"}}>
        <div style={{width:42,height:42,flexShrink:0,borderRadius:"var(--r-md)",background:"var(--surface-sunken)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--roast-0)"}}><I2 name="box" size={20} stroke={2}/></div>
        <div style={{flex:"1 1 260px",minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <span style={{fontFamily:"var(--font-sans)",fontSize:14.5,fontWeight:600,color:"var(--ink)"}}>Shopify</span>
            <Pill variant={connected?"matcha":"cream"} dot>{connected?"Connected":"Disconnected"}</Pill>
          </div>
          <div style={CO.data({fontSize:11.5,color:"var(--ink-muted)",marginTop:4})}>coroasted.myshopify.com · Admin API 2026-07 · last sync 2 min ago</div>
        </div>
        <div style={{display:"flex",gap:9,flexShrink:0}}>
          <Btn size="sm" variant="outline">Sync now</Btn>
          <Btn size="sm" variant={connected?"ghost":"primary"} onClick={()=>setConnected(c=>!c)}>{connected?"Disconnect":"Connect store"}</Btn>
        </div>
      </section>

      {/* routing */}
      <SxSection title="Checkout routing" note="Nothing is billed here. Both storefront tabs hand the cart to Shopify at checkout — retail as a paid order, wholesale as a draft order on account terms — and the order comes back to the Orders board as a roast job.">
        <div style={{border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"1.1fr 1fr 1.2fr 44px",gap:16,padding:"9px 16px",background:"var(--surface-sunken)",borderBottom:"1px solid var(--hairline)"}}>
            <span style={sxOver()}>Storefront tab</span>
            <span style={sxOver()}>Becomes</span>
            <span style={sxOver()}>Payment</span>
            <span/>
          </div>
          {SX_ROUTES.map((r,i)=>(
            <div key={r.id} style={{display:"grid",gridTemplateColumns:"1.1fr 1fr 1.2fr 44px",gap:16,alignItems:"center",padding:"14px 16px",borderTop:i?"1px solid var(--hairline)":"none"}}>
              <div style={{minWidth:0}}>
                <div style={{fontFamily:"var(--font-sans)",fontSize:13.5,fontWeight:600,color:"var(--ink)"}}>{r.channel}</div>
                <div style={CO.data({fontSize:11,color:"var(--ink-subtle)",marginTop:3})}>{r.tag}</div>
              </div>
              <div style={{minWidth:0}}>
                <div style={CO.data({fontSize:13,color:"var(--ink)"})}>{r.target}</div>
                <div style={{fontFamily:"var(--font-sans)",fontSize:11.5,color:"var(--ink-subtle)",marginTop:3}}>{r.detail}</div>
              </div>
              <div style={{minWidth:0}}>
                <div style={{fontFamily:"var(--font-sans)",fontSize:12.5,color:"var(--ink-muted)",lineHeight:1.45}}>{r.pay}</div>
                <div style={{fontFamily:"var(--font-sans)",fontSize:11.5,color:"var(--ink-subtle)",marginTop:3}}>{r.roast}</div>
              </div>
              <SxSwitch on={routeOn[r.id]} onChange={v=>setRouteOn(s=>({...s,[r.id]:v}))}/>
            </div>
          ))}
        </div>
        <SxToggleRow title="Hold custom blends for a QC cupping" desc="First run of a new blend lands in the queue as on hold. Shopify still shows the order as paid; the roast job waits for sign-off." on={holdBlend} onChange={setHoldBlend}/>
        <SxToggleRow title="Create Shopify customers from wholesale accounts" desc="Private label accounts are written as Shopify customers tagged wholesale, so terms and price lists follow them at checkout." on={customers} onChange={setCustomers}/>
      </SxSection>

      {/* catalog mapping */}
      <SxSection title="Catalog mapping" note="The green catalog is the source of truth. Listing a coffee publishes it; hiding it unpublishes the Shopify product and leaves the history intact."
        right={<Btn size="sm" variant="outline" icon={<I2 name="download" size={14}/>}>Re-push catalog</Btn>}>
        <div style={{border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1.6fr",gap:16,padding:"9px 16px",background:"var(--surface-sunken)",borderBottom:"1px solid var(--hairline)"}}>
            <span style={sxOver()}>CoRoasted</span>
            <span style={sxOver()}>Shopify</span>
            <span style={sxOver()}>Note</span>
          </div>
          {SX_MAP.map((m,i)=>(
            <div key={m.from} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1.6fr",gap:16,alignItems:"center",padding:"11px 16px",borderTop:i?"1px solid var(--hairline)":"none"}}>
              <span style={{fontFamily:"var(--font-sans)",fontSize:13,color:"var(--ink)"}}>{m.from}</span>
              <span style={CO.data({fontSize:12.5,color:"var(--ink)"})}>{m.to}</span>
              <span style={{fontFamily:"var(--font-sans)",fontSize:12,color:"var(--ink-muted)",lineHeight:1.45}}>{m.note}</span>
            </div>
          ))}
        </div>
      </SxSection>

      {/* inventory + fulfillment */}
      <SxSection title="Inventory and fulfillment">
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16,marginBottom:4}}>
          <SxField label="Fulfillment location" hint="Where Shopify decrements stock and files tracking.">
            <select value={location} onChange={e=>setLocation(e.target.value)} style={sxInp}>
              <option>Roastery · SE Portland</option>
              <option>Warehouse · Swan Island</option>
            </select>
          </SxField>
          <SxField label="Green on-hand buffer" hint="Lots below the buffer stop taking new blend orders.">
            <input defaultValue="40 lb" style={{...sxInp,...CO.data({fontSize:13.5})}}/>
          </SxField>
          <SxField label="Order prefix" hint="Applied to roast jobs so they match the Shopify order name.">
            <input defaultValue="#" style={{...sxInp,...CO.data({fontSize:13.5})}}/>
          </SxField>
        </div>
        <SxToggleRow title="Push green on-hand to Shopify" desc="Available pounds in the green catalog set the inventory level on every product built from that lot." on={invOut} onChange={setInvOut} meta="every 15 min"/>
        <SxToggleRow title="Accept inventory edits from Shopify" desc="Off by default. The roastery counts green; letting Shopify write back overwrites a physical count with a sales estimate." on={invIn} onChange={setInvIn}/>
        <SxToggleRow title="Mark fulfilled when the order is packed" desc="Packing an order on the Orders board files the fulfillment and emails tracking from Shopify." on={autoFulfill} onChange={setAutoFulfill}/>
      </SxSection>

      {/* webhooks */}
      <SxSection title="Webhooks" note="Shopify tells the roastery what changed. A paused topic queues up to 48 hours before events are dropped.">
        <div style={{border:"1px solid var(--hairline)",borderRadius:"var(--r-md)",overflow:"hidden"}}>
          {SX_HOOKS.map((h,i)=>(
            <div key={h.topic} style={{display:"flex",alignItems:"center",gap:16,padding:"12px 16px",borderTop:i?"1px solid var(--hairline)":"none"}}>
              <span style={{width:8,height:8,borderRadius:"50%",flexShrink:0,background:h.state==="Active"?"var(--success)":"var(--ink-subtle)"}}/>
              <span style={CO.data({fontSize:12.5,color:"var(--ink)",flex:"0 0 190px"})}>{h.topic}</span>
              <span style={{flex:1,minWidth:0,fontFamily:"var(--font-sans)",fontSize:12.5,color:"var(--ink-muted)"}}>{h.use}</span>
              <span style={CO.data({fontSize:11.5,color:"var(--ink-subtle)",whiteSpace:"nowrap"})}>{h.last}</span>
            </div>
          ))}
        </div>
      </SxSection>

      {/* activity */}
      <SxSection title="Recent activity" right={<Btn size="sm" variant="ghost">Open full log</Btn>}>
        <div>
          {SX_LOG.map((l,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:16,padding:"10px 0",borderBottom:"1px solid var(--hairline)"}}>
              <span style={CO.data({fontSize:11.5,color:"var(--ink-subtle)",width:46,flexShrink:0})}>{l.t}</span>
              <span style={CO.data({fontSize:12,color:"var(--ink)",flex:"0 0 170px"})}>{l.ev}</span>
              <span style={CO.data({fontSize:12,color:"var(--ink-muted)",flex:"0 0 130px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"})}>{l.ref}</span>
              <span style={{flex:1,minWidth:0,fontFamily:"var(--font-sans)",fontSize:12.5,color:"var(--ink-muted)"}}>{l.msg}</span>
            </div>
          ))}
        </div>
      </SxSection>
    </div>
  );
};

Object.assign(window, { SettingsView, SxSection, SxField, SxSwitch, SxToggleRow, sxInp });
