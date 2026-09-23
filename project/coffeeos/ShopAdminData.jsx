// CoRoasted × CoffeeOS — shop (D2C) orders, facility side. Fixtures + math.
// Depends on coffeeos/PrivateLabelData.jsx (PL_STOCK, PL_GREEN, plPriceOf…).

const SO_SIZES = [
  {id:"8oz", label:"8 oz", lb:0.5, mult:1.20},
  {id:"1lb", label:"1 lb", lb:1,   mult:1.00},
  {id:"2lb", label:"2 lb", lb:2,   mult:0.92},
  {id:"5lb", label:"5 lb", lb:5,   mult:0.84},
];
const SO_GREEN_LOSS = 0.84, SO_SHIP_FLAT = 6.50, SO_SHIP_FREE = 50, SO_SUB_OFF = 0.10;

const SO_STAGES = [
  { id:"paid",     label:"Paid",     hint:"Waiting to be roasted" },
  { id:"roasting", label:"Roasting", hint:"On a machine" },
  { id:"packing",  label:"Packing",  hint:"Grinding and bagging" },
  { id:"shipped",  label:"Shipped",  hint:"Out the door" },
];
const soStageIdx = (id) => Math.max(0, SO_STAGES.findIndex(s=>s.id===id));

const soSize  = (id) => SO_SIZES.find(s=>s.id===id) || SO_SIZES[1];
// shelf price per roasted lb, honouring green-catalog overrides
const soPerLb = (it) => it.kind==="blend" ? plRetailSel(it.sel) : plStockRetail(PL_STOCK.find(s=>s.id===it.skuId)||{price:0});
const soBagPrice = (perLb, size) => Math.round(perLb * size.lb * size.mult * 4)/4;

const soItemName  = (it) => it.kind==="blend" ? it.name : (PL_STOCK.find(s=>s.id===it.skuId)||{name:"—"}).name;
const soItemRoast = (it) => it.kind==="blend" ? (it.roast != null ? it.roast : plRoastOf(it.sel)) : (PL_STOCK.find(s=>s.id===it.skuId)||{roast:3}).roast;
const soItemLbs   = (it) => soSize(it.sizeId).lb * it.qty;
const soItemUnit  = (it) => soBagPrice(soPerLb(it), soSize(it.sizeId));
const soItemTotal = (it) => soItemUnit(it) * it.qty;

// order money + counts
const soQuote = (o) => {
  const gross = o.items.reduce((a,it)=>a+soItemTotal(it), 0);
  const discount = o.channel==="Subscription" ? gross*SO_SUB_OFF : 0;
  const goods = gross - discount;
  const shipping = goods >= SO_SHIP_FREE ? 0 : SO_SHIP_FLAT;
  const lbs  = o.items.reduce((a,it)=>a+soItemLbs(it), 0);
  const bags = o.items.reduce((a,it)=>a+it.qty, 0);
  return { gross, discount, goods, shipping, total: goods + shipping, lbs, bags };
};

// what actually has to go on a machine: roasted lb by coffee, green lb by lot
const soRoastPlan = (orders) => {
  const roasted = {}, green = {};
  orders.forEach(o=>o.items.forEach(it=>{
    const lbs = soItemLbs(it), roast = soItemRoast(it);
    const key = it.kind==="blend" ? `blend:${it.name}` : `sku:${it.skuId}`;
    const r = roasted[key] || (roasted[key] = { key, kind:it.kind, name:soItemName(it), roast, lbs:0, orders:new Set(), sel:it.sel });
    r.lbs += lbs; r.orders.add(o.id);
    // everything is roasted to order; only blends resolve to named green lots
    if (it.kind === "blend") it.sel.forEach(s=>{
      const g = green[s.id] || (green[s.id] = { id:s.id, lbs:0 });
      g.lbs += lbs*s.pct/100;
    });
  }));
  return {
    roasted: Object.values(roasted).sort((a,b)=>b.lbs-a.lbs).map(r=>({...r, orders:r.orders.size})),
    green: Object.values(green).sort((a,b)=>b.lbs-a.lbs),
  };
};

// grind + bag breakdown for the packing bench
const soPackPlan = (o) => {
  const by = {};
  o.items.forEach(it=>{
    const k = `${it.grind}|${it.sizeId}`;
    const e = by[k] || (by[k] = { grind:it.grind, size:soSize(it.sizeId), qty:0, names:[] });
    e.qty += it.qty; e.names.push(soItemName(it));
  });
  return Object.values(by);
};

const SO_ORDERS = [
  { id:"CR-2061", placed:"Aug 02", channel:"Web", status:"paid", gift:false,
    customer:{ name:"Maya Ellsworth", email:"maya.ellsworth@gmail.com", city:"Providence, RI",
      address:["Maya Ellsworth","118 Wickenden St, Apt 2","Providence, RI 02903"] },
    ship:{ method:"Ground · 2–3 day", tracking:null },
    items:[ { kind:"blend", name:"Sunday Morning", sel:[{id:"huila",pct:60},{id:"guji",pct:40}], roast:3, sizeId:"1lb", grind:"Filter / drip", qty:2 } ],
    note:"First order — asked for a roast date on the bag." },

  { id:"CR-2060", placed:"Aug 02", channel:"Subscription", status:"paid", gift:false,
    customer:{ name:"Dev Raman", email:"dev@ramanstudio.co", city:"Brooklyn, NY",
      address:["Dev Raman","94 Meserole Ave, 3R","Brooklyn, NY 11222"] },
    ship:{ method:"Ground · 2–3 day", tracking:null },
    items:[ { kind:"stock", skuId:"s-counter", sizeId:"2lb", grind:"Whole bean", qty:1 } ],
    note:"Delivery 7 of a four-week subscription." },

  { id:"CR-2059", placed:"Aug 01", channel:"Web", status:"roasting", gift:true,
    customer:{ name:"Hollis Pike", email:"hollis.pike@fastmail.com", city:"Austin, TX",
      address:["Hollis Pike","3407 Cherrywood Rd","Austin, TX 78722"] },
    ship:{ method:"Express · next day", tracking:null },
    items:[
      { kind:"stock", skuId:"s-guji", sizeId:"8oz", grind:"Whole bean", qty:2 },
      { kind:"stock", skuId:"s-straw", sizeId:"8oz", grind:"Whole bean", qty:1 },
    ],
    note:"Gift. Message card: \"Happy birthday, drink it fast.\"" },

  { id:"CR-2058", placed:"Aug 01", channel:"Web", status:"roasting", gift:false,
    customer:{ name:"Corner Room Café", email:"orders@cornerroom.cafe", city:"New Haven, CT",
      address:["Corner Room Café","72 Orange St","New Haven, CT 06510"] },
    ship:{ method:"Ground · 2–3 day", tracking:null },
    items:[
      { kind:"blend", name:"Corner House", sel:[{id:"cerrado",pct:70},{id:"sierra",pct:30}], roast:4, sizeId:"5lb", grind:"Espresso", qty:4 },
      { kind:"stock", skuId:"s-decaf", sizeId:"2lb", grind:"Espresso", qty:2 },
    ],
    note:"Standing café order, grind to their EK setting." },

  { id:"CR-2057", placed:"Jul 31", channel:"Subscription", status:"packing", gift:false,
    customer:{ name:"Priya Venkatesh", email:"pv@hey.com", city:"Oakland, CA",
      address:["Priya Venkatesh","1229 Alcatraz Ave","Oakland, CA 94608"] },
    ship:{ method:"Ground · 2–3 day", tracking:null },
    items:[ { kind:"blend", name:"Morning Weekday", sel:[{id:"sierra",pct:50},{id:"huila",pct:30},{id:"guji",pct:20}], roast:3, sizeId:"1lb", grind:"Moka pot", qty:1 } ],
    note:"" },

  { id:"CR-2056", placed:"Jul 31", channel:"Web", status:"packing", gift:false,
    customer:{ name:"Tobias Lund", email:"tlund@protonmail.com", city:"Minneapolis, MN",
      address:["Tobias Lund","2815 Aldrich Ave S","Minneapolis, MN 55408"] },
    ship:{ method:"Ground · 2–3 day", tracking:null },
    items:[ { kind:"stock", skuId:"s-coldbrew", sizeId:"5lb", grind:"French press", qty:1 } ],
    note:"Coarse for cold brew — confirmed by email." },

  { id:"CR-2054", placed:"Jul 30", channel:"Web", status:"shipped", gift:false,
    customer:{ name:"Anne-Marie Sowa", email:"amsowa@gmail.com", city:"Chicago, IL",
      address:["Anne-Marie Sowa","4411 N Hermitage Ave","Chicago, IL 60640"] },
    ship:{ method:"Ground · 2–3 day", tracking:"9400 1899 5698 8412 7733 21" },
    items:[ { kind:"stock", skuId:"s-huila", sizeId:"1lb", grind:"Whole bean", qty:3 } ],
    note:"" },

  { id:"CR-2053", placed:"Jul 29", channel:"Subscription", status:"shipped", gift:false,
    customer:{ name:"Ruth Okafor", email:"ruth.okafor@outlook.com", city:"Seattle, WA",
      address:["Ruth Okafor","615 15th Ave E, Unit 4","Seattle, WA 98112"] },
    ship:{ method:"Ground · 2–3 day", tracking:"9400 1899 5698 8412 7701 88" },
    items:[ { kind:"stock", skuId:"s-sixounce", sizeId:"1lb", grind:"Filter / drip", qty:2 } ],
    note:"" },
];

Object.assign(window, { SO_SIZES, SO_STAGES, SO_ORDERS, SO_GREEN_LOSS, SO_SHIP_FLAT, SO_SHIP_FREE,
  soStageIdx, soSize, soPerLb, soBagPrice, soItemName, soItemRoast, soItemLbs, soItemUnit, soItemTotal,
  soQuote, soRoastPlan, soPackPlan });
