// CoRoasted — Booking detail drawer (slide-in from right)

const BookingDrawer = ({ booking, onClose }) => {
  if (!booking) return null;
  const cust = customerById(booking.customer);
  const res = RESOURCES.find(r=>r.id===booking.resource);
  const meta = BOOKING_TYPES[booking.type];
  const dur = booking.end - booking.start;

  // Pricing breakdown depending on type
  const lines = [];
  if (booking.type === "toll")    lines.push({ label:`Machine time · ${res.name}`, qty:`${dur.toFixed(1)} hr × $${res.rate}`, amt: dur*res.rate });
  if (booking.type === "coroast") lines.push({ label:`Co-roast service · ${res.name}`, qty:`${booking.lbs} lb × $3.50`, amt: booking.lbs*3.5 });
  if (booking.type === "coach")   lines.push({ label:`Coaching · ${booking.staff}`, qty:`${dur.toFixed(1)} hr × $90`, amt: dur*90 });
  if (booking.type === "pack")    lines.push({ label:`Packaging · ${booking.lot}`, qty:`${booking.lbs} lb`, amt: booking.total });
  if (booking.type === "coroast" && booking.staff) lines.push({ label:`Roaster on duty · ${booking.staff}`, qty:"included", amt: 0 });
  if (booking.type === "toll")    lines.push({ label:`Green pull · ${booking.lot}`, qty:"included", amt: 0 });
  const subtotal = lines.reduce((s,l)=>s+l.amt,0);
  const total = booking.total;

  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(28,15,5,0.45)",zIndex:50,animation:"co-fade .15s ease-out"}}/>
      <div style={{
        position:"fixed",top:0,right:0,bottom:0,width:"min(560px, 100vw)",
        background:"var(--color-cream)",borderLeft:"4px solid var(--color-espresso)",
        zIndex:51,boxShadow:"-8px 0 0 var(--color-espresso)",
        display:"flex",flexDirection:"column",animation:"co-slide .22s var(--ease-snap)",
        overflowY:"auto",
      }}>
        {/* Header */}
        <div style={{position:"sticky",top:0,background:`var(--color-${meta.color})`,color:`var(--color-${meta.fg})`,borderBottom:"3px solid var(--color-espresso)",padding:"18px 22px",display:"flex",alignItems:"flex-start",gap:14,zIndex:1}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <span style={{fontSize:10,fontWeight:900,letterSpacing:".14em",textTransform:"uppercase",padding:"3px 8px",background:"rgba(28,15,5,0.18)",borderRadius:6}}>{meta.label} · #{booking.id.toUpperCase()}</span>
              {booking.recurring && <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:10,fontWeight:800,letterSpacing:".1em",textTransform:"uppercase",padding:"3px 8px",background:"rgba(28,15,5,0.18)",borderRadius:6}}><I2 name="repeat" size={11}/> Recurring weekly</span>}
              {booking.status==="inprogress" && <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:10,fontWeight:800,letterSpacing:".1em",textTransform:"uppercase",padding:"3px 8px",background:"var(--color-espresso)",color:"var(--color-cream)",borderRadius:6}}><Dot color="sun" pulse size={7}/> On floor</span>}
            </div>
            <h2 style={{fontFamily:"var(--font-display)",fontSize:34,lineHeight:.95,textTransform:"uppercase",margin:0}}>{cust.name}</h2>
            <div style={{fontSize:13,marginTop:6,fontWeight:700,opacity:0.85}}>{booking.lot} · {booking.lbs} lb · {booking.profile}</div>
          </div>
          <button onClick={onClose} style={{width:36,height:36,border:"2.5px solid var(--color-espresso)",borderRadius:9999,background:"var(--color-cream)",color:"var(--color-espresso)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"3px 3px 0 var(--color-espresso)"}}><I2 name="x" size={16}/></button>
        </div>

        <div style={{padding:22,display:"flex",flexDirection:"column",gap:16}}>
          {/* Schedule strip */}
          <div style={{padding:14,border:"3px solid var(--color-espresso)",borderRadius:14,background:"var(--color-chalk)",display:"flex",alignItems:"center",gap:14,boxShadow:"3px 3px 0 var(--color-espresso)"}}>
            <I2 name="cal" size={22}/>
            <div style={{flex:1}}>
              <div style={{fontSize:10,fontWeight:800,letterSpacing:".12em",textTransform:"uppercase",color:"var(--fg2)"}}>Saturday · Apr 25, 2026</div>
              <div style={{fontFamily:"var(--font-display)",fontSize:24,lineHeight:1,marginTop:4,textTransform:"uppercase"}}>{fmtTimeLong(booking.start)} – {fmtTimeLong(booking.end)}</div>
              <div style={{fontSize:11,color:"var(--fg2)",marginTop:4}}>{dur.toFixed(1)} hr · {res.name} · {res.capacity}</div>
            </div>
            <Btn size="sm" variant="outline">Reschedule</Btn>
          </div>

          {/* Customer */}
          <div style={{padding:14,border:"3px solid var(--color-espresso)",borderRadius:14,background:"var(--color-chalk)",display:"flex",alignItems:"center",gap:12,boxShadow:"3px 3px 0 var(--color-espresso)"}}>
            <Avatar customer={booking.customer} size={44}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:800,fontSize:14}}>{cust.name}</div>
              <div style={{fontSize:11,color:"var(--fg2)",marginTop:2}}>{cust.contact} · {cust.tier} · since {cust.since}</div>
            </div>
            <Pill variant="cream"><I2 name="phone" size={11}/> Call</Pill>
            <Pill variant="cream"><I2 name="mail" size={11}/> Msg</Pill>
          </div>

          {/* Staff + lot pulled from storage */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <InfoTile icon="user" label="Staff" value={booking.staff || "Unassigned"} hint={booking.staff?"On the floor":"Self-serve"}/>
            <InfoTile icon="box" label="Green Source" value={booking.lot} hint={booking.type==="pack"?"Roasted bags":"From shelf A-04"}/>
          </div>

          {/* Pricing */}
          <Panel title="Pricing" actions={<Pill variant={booking.paid?"matcha":"tomato"}>{booking.paid?"Paid":"Unpaid"}</Pill>}>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {lines.map((l,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,fontSize:13}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700}}>{l.label}</div>
                    <div style={{fontSize:11,color:"var(--fg2)",marginTop:1}}>{l.qty}</div>
                  </div>
                  <div style={{fontFamily:"var(--font-mono)",fontWeight:800}}>${l.amt.toFixed(2)}</div>
                </div>
              ))}
              <div style={{borderTop:"2px dashed var(--color-fog)",margin:"4px 0"}}/>
              <div style={{display:"flex",alignItems:"center"}}>
                <div style={{flex:1,fontFamily:"var(--font-display)",fontSize:24,textTransform:"uppercase"}}>Total</div>
                <div style={{fontFamily:"var(--font-display)",fontSize:32,color:"var(--color-tomato)"}}>${total}</div>
              </div>
            </div>
          </Panel>

          {/* Actions */}
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {!booking.paid && <Btn variant="primary" icon={<I2 name="dollar" size={14}/>}>Charge ${total}</Btn>}
            <Btn variant="secondary" icon={<I2 name="edit" size={14}/>}>Edit</Btn>
            <Btn variant="secondary" icon={<I name="check" size={14}/>}>Mark complete</Btn>
            <Btn variant="ghost" style={{color:"var(--color-tomato)"}}>Cancel booking</Btn>
          </div>
        </div>
      </div>
    </>
  );
};

const InfoTile = ({icon,label,value,hint}) => (
  <div style={{padding:12,border:"2.5px solid var(--color-espresso)",borderRadius:12,background:"var(--color-cream)"}}>
    <div style={{display:"flex",alignItems:"center",gap:6,fontSize:10,fontWeight:800,letterSpacing:".11em",textTransform:"uppercase",color:"var(--fg2)"}}>
      <I2 name={icon} size={12}/>{label}
    </div>
    <div style={{fontFamily:"var(--font-display)",fontSize:18,textTransform:"uppercase",lineHeight:1,marginTop:6}}>{value}</div>
    {hint && <div style={{fontSize:11,color:"var(--fg2)",marginTop:3}}>{hint}</div>}
  </div>
);

Object.assign(window, { BookingDrawer });
