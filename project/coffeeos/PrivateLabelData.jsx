// Roaster Portal × CoffeeOS — Private Label: catalog, packaging, and the cup math.
// Shared by BlendBuilder.jsx and PrivateLabelView.jsx.

// ---- flavor axes (cupping scores, 0–10) ----
const PL_AX = [
  {k:"cocoa",l:"Cocoa"},{k:"brownSugar",l:"Brown sugar"},{k:"malt",l:"Malt"},
  {k:"hazelnut",l:"Hazelnut"},{k:"almond",l:"Almond"},{k:"ferment",l:"Ferment"},
  {k:"berry",l:"Berry"},{k:"stoneFruit",l:"Stone fruit"},{k:"citrus",l:"Citrus"},{k:"floral",l:"Floral"},
];

// ---- green components the facility stocks (what a blend is built from) ----
const PL_GREEN = [
  {id:"cerrado",name:"Cerrado Norte",  origin:"Brazil · Minas Gerais",   lot:"LOT-2571",process:"Natural",   roast:4,price:6.20,kind:"anchor",avail:1860,notes:{cocoa:7,hazelnut:8,brownSugar:5,malt:5,almond:4}},
  {id:"sierra", name:"Sierra Alta",    origin:"Mexico · Chiapas",        lot:"LOT-2588",process:"Washed",    roast:4,price:6.85,kind:"anchor",avail:1420,notes:{cocoa:8,brownSugar:6,almond:5,malt:4,hazelnut:3}},
  {id:"huila",  name:"Huila Reserve",  origin:"Colombia · Huila",        lot:"LOT-2604",process:"Washed",    roast:3,price:7.60,kind:"anchor",avail:980, notes:{brownSugar:6,stoneFruit:6,citrus:5,cocoa:4,malt:3}},
  {id:"guji",   name:"Guji Highland",  origin:"Ethiopia · Guji",         lot:"LOT-2612",process:"Washed",    roast:2,price:9.40,kind:"anchor",avail:640, notes:{floral:8,citrus:7,berry:6,stoneFruit:4}},
  {id:"straw",  name:"Tolima Strawberry",origin:"Colombia · Tolima",     lot:"LOT-2619",process:"Co-ferment",roast:2,price:14.20,kind:"limited",tag:"Limited",avail:340,notes:{berry:9,ferment:7,stoneFruit:5,floral:4,brownSugar:3}},
  {id:"peach",  name:"Tarrazú Peach",  origin:"Costa Rica · Tarrazú",    lot:"LOT-2590",process:"Co-ferment",roast:2,price:13.50,kind:"soon",   tag:"Back in Oct",avail:0,notes:{stoneFruit:9,ferment:6,floral:5,brownSugar:4}},
];

// admin-managed green catalog (coffeeos/GreenAdmin.jsx) wins when present
try {
  const saved = JSON.parse(localStorage.getItem("cr_green_catalog"));
  if (Array.isArray(saved) && saved.length) PL_GREEN.splice(0, PL_GREEN.length, ...saved.filter(c=>c.listed !== false));
} catch(e){}

// ---- finished coffees the facility roasts and keeps on hand ----
const PL_STOCK = [
  {id:"s-counter", name:"Counter Standard", sub:"House blend · Brazil + Mexico", roast:4, price:7.15, lead:"Ships in 2 days", avail:"860 lb roasted weekly", tag:null,
   notes:{cocoa:7,hazelnut:6,brownSugar:6,malt:5,almond:4}, blurb:"The workhorse. Chocolate and toasted nut, forgiving on any espresso recipe."},
  {id:"s-sixounce",name:"Six Ounce House",  sub:"House blend · Mexico + Colombia + Ethiopia", roast:3, price:8.40, lead:"Ships in 2 days", avail:"540 lb roasted weekly", tag:null,
   notes:{cocoa:5,brownSugar:6,stoneFruit:5,citrus:4,floral:3,malt:3}, blurb:"Sweeter and more aromatic. Built for filter, holds up in milk."},
  {id:"s-cerrado", name:"Cerrado Norte",    sub:"Single origin · Brazil · Minas Gerais", roast:4, price:7.60, lead:"Ships in 2 days", avail:"1,860 lb green", tag:null,
   notes:{cocoa:7,hazelnut:8,brownSugar:5,malt:5,almond:4}, blurb:"Natural process. Heavy body, hazelnut, low acidity."},
  {id:"s-huila",   name:"Huila Reserve",    origin:"Colombia", sub:"Single origin · Colombia · Huila", roast:3, price:9.10, lead:"Ships in 3 days", avail:"980 lb green", tag:null,
   notes:{brownSugar:6,stoneFruit:6,citrus:5,cocoa:4,malt:3}, blurb:"Washed. Caramel and stone fruit, clean finish."},
  {id:"s-guji",    name:"Guji Highland",    sub:"Single origin · Ethiopia · Guji", roast:2, price:11.20, lead:"Ships in 3 days", avail:"640 lb green", tag:null,
   notes:{floral:8,citrus:7,berry:6,stoneFruit:4}, blurb:"Washed. Jasmine, bergamot, tea-like. Your pour-over slot."},
  {id:"s-decaf",   name:"Cascara Decaf",    sub:"Single origin · Colombia · sugarcane EA", roast:3, price:9.80, lead:"Ships in 4 days", avail:"420 lb green", tag:null,
   notes:{cocoa:6,brownSugar:6,stoneFruit:4,malt:3,almond:3}, blurb:"Sugarcane decaf. Sweet, round, nobody guesses."},
  {id:"s-straw",   name:"Tolima Strawberry",sub:"Co-ferment · Colombia · Tolima", roast:2, price:16.90, lead:"Ships in 3 days", avail:"340 lb left", tag:"Limited",
   notes:{berry:9,ferment:7,stoneFruit:5,floral:4,brownSugar:3}, blurb:"Strawberry co-ferment. Loud, seasonal, sells itself on a shelf."},
  {id:"s-coldbrew",name:"Cold Brew Base",   sub:"House blend · coarse-ground option", roast:5, price:6.40, lead:"Ships in 2 days", avail:"1,200 lb roasted weekly", tag:null,
   notes:{cocoa:8,malt:7,brownSugar:5,hazelnut:3}, blurb:"Dark, syrupy, built to be diluted. Available whole bean or coarse."},
];

// ---- packaging ----
const PL_BAGS = [
  {id:"12oz", label:"12 oz", lb:0.75, material:{stock:0.68, label:0.68, own:0}},
  {id:"2lb",  label:"2 lb",  lb:2,    material:{stock:1.10, label:1.10, own:0}},
  {id:"5lb",  label:"5 lb",  lb:5,    material:{stock:1.65, label:1.65, own:0}},
];

const PL_PACK = [
  {id:"stock", icon:"bag",  title:"Our stock bags",
   desc:"Kraft stand-up pouch, one-way valve, resealable zip. Blank — we apply a printed roast-date sticker.",
   rate:"material + $0.55/bag fill", per:0, setup:0},
  {id:"label", icon:"pkg",  title:"Your label, our bags",
   desc:"Send artwork. We print and apply it to the same stock bag. Proof comes back before the run.",
   rate:"+ $0.42/bag label · $85 plate setup", per:0.42, setup:85},
  {id:"own",   icon:"cart", title:"You supply the bags",
   desc:"Ship your own bags here. No material charge — we bill handling on the packaging line.",
   rate:"$0.35/bag handling, no material", per:0.35, setup:0},
];

const PL_FILL = 0.55;   // per bag, packaging line labor
const PL_MIN  = 5;      // lb minimum on a private label run

// ---- math ----
const plRamp = ["#EE8A1E","#D93D18","#C43C7C","#8E2F52","#3A2118"];
const plRampColor = (r) => {
  const x = Math.max(1, Math.min(5, r)) - 1, i = Math.min(3, Math.floor(x)), f = x - i;
  const a = plRamp[i], b = plRamp[i+1];
  const mix = p => Math.round(parseInt(a.substr(p,2),16)*(1-f) + parseInt(b.substr(p,2),16)*f);
  return `rgb(${mix(1)},${mix(3)},${mix(5)})`;
};
const plRoastName = (r) => ["LIGHT","LIGHT","MED-LIGHT","MEDIUM","MED-DARK","DARK"][Math.max(0,Math.min(5,Math.round(r)))];
const plGreen = (id) => PL_GREEN.find(c=>c.id===id);
// smallest WEIGHT a lot may contribute to a custom blend, set per lot in the
// green catalog. The builder turns it into a percentage against the batch it is
// actually making, so the floor moves with order size.
const PL_G_PER_LB = 453.592;
const PL_MING_DEFAULT = 100;                       // grams
const plMinG = (lotOrId) => {
  const c = typeof lotOrId === "string" ? plGreen(lotOrId) : lotOrId;
  const v = c && c.minG != null ? +c.minG : PL_MING_DEFAULT;
  return Math.max(0, isNaN(v) ? PL_MING_DEFAULT : v);
};
// minimum share of THIS batch, in whole percent (batchG = grams being roasted)
const plMinPctFor = (lotOrId, batchG) => {
  const g = plMinG(lotOrId);
  if (!g || !batchG) return 0;
  return Math.min(100, Math.ceil(g / batchG * 100));
};
const plGramsOf = (pct, batchG) => Math.round((batchG||0) * pct / 100);
// can every lot in this selection clear its own floor out of this batch?
// measured in grams — the percentage helper is capped at 100 and can't see an
// overflow caused by a single lot on its own
const plMinsFit = (sel, batchG) => sel.reduce((a,s)=>a + plMinG(s.id), 0) <= (batchG||0);
// pull a selection back inside every lot's minimum, holding one row fixed
const plEnforceMins = (arr, lockedId, batchG) => {
  const minOf = (id) => plMinPctFor(id, batchG);
  const next = arr.map(x=>({...x}));
  for (let pass=0; pass<6; pass++){
    const short = next.filter(x=>x.id!==lockedId && x.pct < minOf(x.id));
    if (!short.length) break;
    short.forEach(s=>{
      const need = minOf(s.id) - s.pct;
      s.pct = minOf(s.id);
      let left = need;
      next.filter(o=>o.id!==s.id && o.id!==lockedId)
        .sort((a,b)=>(b.pct-minOf(b.id))-(a.pct-minOf(a.id)))
        .forEach(o=>{ if(left<=0) return; const slack=Math.max(0,o.pct-minOf(o.id)); const take=Math.min(slack,left); o.pct-=take; left-=take; });
      if (left > 0) { const l = next.find(o=>o.id===lockedId); if (l) l.pct = Math.max(0, l.pct - left); }
    });
  }
  // always hand back a selection that sums to exactly 100 — when the floors
  // can't all be met the ratios stay proportional and the view raises the error
  let tot = next.reduce((a,b)=>a+b.pct,0);
  if (tot !== 100 && next.length) {
    if (plMinsFit(next, batchG)) {
      const t = next.slice().sort((a,b)=>(b.pct-minOf(b.id))-(a.pct-minOf(a.id)))[0];
      t.pct = Math.max(minOf(t.id), t.pct + 100 - tot);
    } else {
      const base = tot || next.length;
      next.forEach(x=>{ x.pct = Math.max(0, Math.round(x.pct*100/base)); });
    }
    tot = next.reduce((a,b)=>a+b.pct,0);
    if (tot !== 100) { const t = next.slice().sort((a,b)=>b.pct-a.pct)[0]; t.pct = Math.max(0, t.pct + 100 - tot); }
  }
  return next;
};
// shelf price per roasted lb. The green catalog can override it per lot;
// otherwise it is the standard markup on roasted cost.
const PL_RETAIL_X = 2.6, PL_LOSS = 0.84;
const plRetailOf = (lot) => lot && lot.retail != null ? lot.retail : (lot ? lot.price*PL_RETAIL_X/PL_LOSS : 0);
const plRetailSel = (sel) => sel.reduce((a,s)=>{ const c = plGreen(s.id); return a + (c ? plRetailOf(c)*s.pct/100 : 0); }, 0);
const plStockRetail = (sku) => sku.retail != null ? sku.retail : sku.price*PL_RETAIL_X;

const plPriceOf = (sel) => sel.reduce((a,s)=>a + (plGreen(s.id) ? plGreen(s.id).price * s.pct/100 : 0), 0);
const plRoastOf = (sel) => sel.reduce((a,s)=>a + (plGreen(s.id) ? plGreen(s.id).roast * s.pct/100 : 0), 0);
const PL_DARK = {cocoa:1,malt:1,brownSugar:.6,hazelnut:.8,almond:.6,ferment:-.6,berry:-1,stoneFruit:-.8,citrus:-1,floral:-1};

const plWeighted = (sel, roastTarget) => {
  const o = {};
  PL_AX.forEach(a=>o[a.k]=0);
  sel.forEach(s=>{ const c = plGreen(s.id); if(!c) return; for (const k in c.notes) o[k] = (o[k]||0) + c.notes[k]*s.pct/100; });
  if (roastTarget != null && sel.length) {
    const delta = roastTarget - plRoastOf(sel);
    PL_AX.forEach(a=>{ o[a.k] = Math.max(0, Math.min(10, o[a.k] * (1 + delta*(PL_DARK[a.k]||0)*0.17))); });
  }
  return o;
};

// radar geometry — returns closed catmull-rom path + axis endpoints
const plGeom = (vals) => {
  const cx=240, cy=240, r0=24, rMax=150, pts=[], axes=[];
  PL_AX.forEach((a,i)=>{
    const ang = (i*36 - 90) * Math.PI/180;
    const v = Math.max(0, Math.min(10, vals[a.k]||0));
    const r = r0 + (v/10)*(rMax-r0);
    const x = cx + Math.cos(ang)*r, y = cy + Math.sin(ang)*r;
    pts.push([x,y]);
    const lr=.4, sn=Math.sin(i*36*Math.PI/180), cs=Math.cos(i*36*Math.PI/180);
    const right = sn>.2, left = sn<-.2;
    axes.push({
      label:a.l, v, valStr: v<.05 ? "—" : v.toFixed(1),
      op: Math.round(Math.max(.24, Math.min(1, .24 + v/6))*100)/100,
      sx: cx+Math.cos(ang)*rMax, sy: cy+Math.sin(ang)*rMax,
      dx: x, dy: y, dot: v<.05 ? "transparent" : "var(--ink)",
      lx: 50 + lr*100*sn, ly: 50 - lr*100*cs,
      tf: right ? "translate(8px,-50%)" : left ? "translate(-100%,-50%) translateX(-8px)" : (cs>0 ? "translate(-50%,-100%) translateY(-8px)" : "translate(-50%,8px)"),
      al: right ? "flex-start" : left ? "flex-end" : "center",
    });
  });
  const path = (scale) => {
    const p = pts.map(([x,y])=>[cx+(x-cx)*scale, cy+(y-cy)*scale]), n = p.length;
    let d = `M ${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
    for (let i=0;i<n;i++){
      const p0=p[(i-1+n)%n], p1=p[i], p2=p[(i+1)%n], p3=p[(i+2)%n];
      const c1=[p1[0]+(p2[0]-p0[0])/6, p1[1]+(p2[1]-p0[1])/6];
      const c2=[p2[0]-(p3[0]-p1[0])/6, p2[1]-(p3[1]-p1[1])/6];
      d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d + " Z";
  };
  return {axes, p1:path(1), p2:path(.68), p3:path(.4)};
};

// full cost worksheet for a private label run
const plQuote = ({ pricePerLb, lbs, bagId, packId, ownBagCount }) => {
  const bag = PL_BAGS.find(b=>b.id===bagId) || PL_BAGS[0];
  const pack = PL_PACK.find(p=>p.id===packId) || PL_PACK[0];
  const bags = Math.ceil(lbs / bag.lb);
  const coffee = pricePerLb * lbs;
  const material = bag.material[pack.id] * bags;
  const perBag = pack.per * bags;
  const fill = PL_FILL * bags;
  const setup = pack.setup;
  const total = coffee + material + perBag + fill + setup;
  return {bag, pack, bags, coffee, material, perBag, fill, setup, total, unit: total/Math.max(1,bags), perLb: total/Math.max(1,lbs), shortBags: pack.id==="own" ? Math.max(0, bags - (ownBagCount||0)) : 0};
};

const plMoney = (n) => "$" + n.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
const plMoney0 = (n) => "$" + Math.round(n).toLocaleString();

// past private label runs (so a placed order has somewhere to land)
const PL_ORDERS = [
  {id:"PL-1042", name:"Hare Krishna House",  lbs:150, bags:200, bag:"12 oz", pack:"Your label, our bags", status:"roasting", eta:"Ships Fri", total:1489},
  {id:"PL-1038", name:"Sunday Filter",       lbs:60,  bags:80,  bag:"12 oz", pack:"Our stock bags",       status:"shipped",  eta:"Delivered Apr 18", total:712},
  {id:"PL-1031", name:"Cold Brew Base",      lbs:250, bags:50,  bag:"5 lb",  pack:"You supply the bags",  status:"shipped",  eta:"Delivered Apr 4",  total:1655},
];

Object.assign(window, { PL_AX, PL_GREEN, PL_STOCK, PL_BAGS, PL_PACK, PL_FILL, PL_MIN, PL_ORDERS,
  plRampColor, plRoastName, plGreen, plMinG, plMinPctFor, plGramsOf, plMinsFit, plEnforceMins, PL_MING_DEFAULT, PL_G_PER_LB, plPriceOf, plRetailOf, plRetailSel, plStockRetail, plRoastOf, plWeighted, plGeom, plQuote, plMoney, plMoney0 });
