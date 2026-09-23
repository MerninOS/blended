// Retail cart: a small persisted store + slide-in drawer. Items survive reloads
// (localStorage "blended-cart-v1"). Checkout hands off to Shopify.

const CART_KEY = "blended-cart-v1";
const cartStore = (() => {
  let items = [];
  try { items = JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch (e) {}
  let open = false, freshId = null;
  items = items.map(({ fresh, ...x }) => x);
  const subs = new Set();
  const emit = () => { try { localStorage.setItem(CART_KEY, JSON.stringify(items.map(({ fresh, ...x }) => x))); } catch (e) {} subs.forEach(f => f()); };
  return {
    get: () => ({ items, open, freshId }),
    sub: (f) => { subs.add(f); return () => subs.delete(f); },
    add: (it) => {
      const { fresh, ...rest } = it; it = rest;
      const same = it.kind === "stock" && items.find(x => x.kind === "stock" && x.key === it.key);
      items = same ? items.map(x => x === same ? { ...x, qty: Math.min(24, x.qty + it.qty) } : x)
                   : [...items, { ...it, id: "ci-" + Date.now().toString(36) }];
      freshId = fresh && !same ? items[items.length - 1].id : null;
      open = true; emit();
    },
    qty: (id, q) => { items = items.map(x => x.id === id ? { ...x, qty: Math.max(1, Math.min(24, q)) } : x); emit(); },
    remove: (id) => { items = items.filter(x => x.id !== id); emit(); },
    setOpen: (v) => { open = v; if (!v) freshId = null; emit(); },
  };
})();
const useCart = () => {
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => cartStore.sub(force), []);
  return cartStore.get();
};

const CartButton = () => {
  const { items } = useCart();
  const n = items.reduce((a, x) => a + x.qty, 0);
  return (
    <button className="cart-btn" onClick={() => cartStore.setOpen(true)} aria-label={`Cart, ${n} item${n === 1 ? "" : "s"}`}
      style={{display:"flex",alignItems:"center",gap:8,height:34,padding:"0 12px",border:"1px solid var(--hairline-strong)",borderRadius:"var(--r-md)",background:"var(--surface)",cursor:"pointer",color:"var(--ink)",fontFamily:"var(--font-mono)",fontSize:11,letterSpacing:".08em",textTransform:"uppercase",transition:"background var(--dur) var(--ease)"}}>
      <I name="pkg" size={15} stroke={2}/>
      <span className="cart-label">Cart</span>
      <span style={{minWidth:18,height:18,padding:"0 5px",borderRadius:9,display:"inline-flex",alignItems:"center",justifyContent:"center",background:n ? "var(--brand)" : "var(--surface-sunken)",color:n ? "#fff" : "var(--ink-subtle)",fontSize:10.5,letterSpacing:0,fontVariantNumeric:"tabular-nums",transition:"background var(--dur) var(--ease)"}}>{n}</span>
    </button>
  );
};

const CartDrawer = ({ onNewBlend }) => {
  const { items, open, freshId } = useCart();
  const [shown, setShown] = React.useState(open);
  React.useEffect(() => { if (open) setShown(true); else { const t = setTimeout(() => setShown(false), 260); return () => clearTimeout(t); } }, [open]);
  React.useEffect(() => {
    if (!open) return;
    const k = (e) => { if (e.key === "Escape") cartStore.setOpen(false); };
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  }, [open]);
  if (!shown) return null;
  const goods = items.reduce((a, x) => a + x.unit * x.qty, 0);
  const shipping = goods >= SHIP_FREE || goods === 0 ? 0 : SHIP_FLAT;
  const toFree = Math.max(0, SHIP_FREE - goods);
  const last = freshId && items.find(x => x.id === freshId);
  const close = () => cartStore.setOpen(false);
  return (
    <div style={{position:"fixed",inset:0,zIndex:900}}>
      <div onClick={close} style={{position:"absolute",inset:0,background:"rgba(26,26,24,.38)",opacity:open ? 1 : 0,transition:"opacity 240ms var(--ease)"}}/>
      <aside role="dialog" aria-label="Cart" style={{position:"absolute",top:0,right:0,bottom:0,width:"min(420px,100vw)",height:"100dvh",background:"var(--surface)",boxShadow:"var(--shadow-modal)",display:"flex",flexDirection:"column",
        transform:open ? "none" : "translateX(100%)",transition:"transform 260ms cubic-bezier(.2,.7,.2,1)",animation:"cart-in 260ms cubic-bezier(.2,.7,.2,1)"}}>
        <div className="cart-drawer-head" style={{display:"flex",alignItems:"center",gap:12,padding:"18px 20px",borderBottom:"1px solid var(--hairline)"}}>
          <span style={{...disp,fontSize:20,color:"var(--ink)",lineHeight:1,flex:1}}>Your cart</span>
          <span style={{...mono,fontSize:11.5,color:"var(--ink-subtle)"}}>{items.reduce((a, x) => a + x.qty, 0)} bags</span>
          <button onClick={close} aria-label="Close cart" style={{width:44,height:44,marginRight:-10,border:"none",background:"none",cursor:"pointer",color:"var(--ink-muted)",fontSize:18,lineHeight:1}}>×</button>
        </div>

        {last && (
          <div className="cart-drawer-note" style={{margin:"14px 20px 0",padding:"11px 13px",borderRadius:"var(--r-md)",background:"var(--surface-sunken)",display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontFamily:"var(--font-sans)",fontSize:12.5,lineHeight:1.45,color:"var(--ink)",flex:1}}>{last.name} is saved. The builder is cleared for your next blend.</span>
            <button className="bb-add" onClick={() => { close(); onNewBlend && onNewBlend(); }} style={{height:30,padding:"0 10px",border:"1px solid var(--hairline-strong)",background:"var(--surface)",borderRadius:"var(--r-sm)",cursor:"pointer",fontFamily:"var(--font-sans)",fontWeight:600,fontSize:12,whiteSpace:"nowrap",color:"var(--ink)",transition:"background var(--dur) var(--ease), color var(--dur) var(--ease)"}}>Build another</button>
          </div>
        )}

        <div className="cart-drawer-body" style={{flex:1,overflowY:"auto",overscrollBehavior:"contain",padding:"4px 20px"}}>
          {items.length === 0 ? (
            <div style={{padding:"48px 0",textAlign:"center",display:"flex",flexDirection:"column",gap:8,alignItems:"center"}}>
              <span style={{...disp,fontSize:16,color:"var(--ink)"}}>Cart is empty</span>
              <span style={{fontFamily:"var(--font-sans)",fontSize:13,color:"var(--ink-muted)"}}>Pick one of our coffees or build a blend.</span>
            </div>
          ) : items.map(it => (
            <div key={it.id} style={{display:"flex",gap:12,padding:"16px 0",borderBottom:"1px solid var(--hairline)",animation:"co-fade 240ms var(--ease)"}}>
              <div style={{width:44,height:52,flexShrink:0,borderRadius:"var(--r-sm)",background:"#F0EDE5",border:"1px solid var(--hairline)",display:"flex",flexDirection:"column",justifyContent:"flex-end",overflow:"hidden"}}>
                {(it.parts && it.parts.length ? it.parts : [{pct:100}]).map((p, i) => <span key={i} style={{flex:`${Math.max(6, p.pct)} 1 0`,maxHeight:it.parts ? "none" : 10,background:it.parts ? BC_COLORS[i % BC_COLORS.length] : plRampColor(it.roast)}}/>)}
              </div>
              <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:4}}>
                <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                  <span style={{...disp,fontSize:14.5,color:"var(--ink)",lineHeight:1.15,flex:1,minWidth:0,overflowWrap:"anywhere"}}>{it.name}</span>
                  <span style={{...mono,fontSize:13,color:"var(--ink)"}}>{plMoney(it.unit * it.qty)}</span>
                </div>
                <span style={{fontFamily:"var(--font-sans)",fontSize:12,color:"var(--ink-muted)"}}>{it.kind === "blend" ? "Custom blend" : "Our coffee"} · {it.sizeLabel} · {plRoastName(it.roast)} roast</span>
                {it.parts && <span style={{...mono,fontSize:11,color:"var(--ink-subtle)",lineHeight:1.45}}>{it.parts.map(p => `${p.pct}% ${p.name}`).join(" · ")}</span>}
                <div style={{display:"flex",alignItems:"center",gap:10,marginTop:6}}>
                  <div style={{display:"flex",alignItems:"center",gap:2}}>
                    <Stepper glyph="−" side="l" onClick={() => cartStore.qty(it.id, it.qty - 1)}/>
                    <span style={{minWidth:34,textAlign:"center",...mono,fontSize:13,color:"var(--ink)"}}>{it.qty}</span>
                    <Stepper glyph="+" side="r" onClick={() => cartStore.qty(it.id, it.qty + 1)}/>
                  </div>
                  <span style={{flex:1}}/>
                  <button onClick={() => cartStore.remove(it.id)} style={{minHeight:36,padding:"0 4px",border:"none",background:"none",cursor:"pointer",fontFamily:"var(--font-sans)",fontSize:12,color:"var(--ink-subtle)",textDecoration:"underline",textUnderlineOffset:3}}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer-foot" style={{borderTop:"1px solid var(--hairline)",padding:"16px 20px 20px",display:"flex",flexDirection:"column",gap:8}}>
            <div style={{display:"flex",justifyContent:"space-between",fontFamily:"var(--font-sans)",fontSize:13,color:"var(--ink-muted)"}}><span>Subtotal</span><span style={mono}>{plMoney(goods)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",fontFamily:"var(--font-sans)",fontSize:13,color:"var(--ink-muted)"}}><span>Shipping</span><span style={mono}>{shipping ? plMoney(shipping) : "Free"}</span></div>
            {toFree > 0 && <span style={{fontFamily:"var(--font-sans)",fontSize:12,color:"var(--ink-subtle)"}}>Add {plMoney(toFree)} for free shipping.</span>}
            <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginTop:4}}>
              <span style={{...over,fontSize:10.5,color:"var(--ink-muted)"}}>Total</span>
              <span style={{...disp,fontSize:26,color:"var(--ink)",lineHeight:1}}>{plMoney(goods + shipping)}</span>
            </div>
            <Btn variant="primary" size="lg" icon={<I name="arrow" size={15} stroke={2}/>} onClick={close}>Checkout</Btn>
          </div>
        )}
      </aside>
    </div>
  );
};

Object.assign(window, { cartStore, useCart, CartButton, CartDrawer });
