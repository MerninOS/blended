// CoRoasted × CoffeeOS — Private Label, facility side. Fixtures.
// Depends on coffeeos/PrivateLabelData.jsx (PL_GREEN, PL_STOCK, PL_PACK, plMoney…).

// stage pipeline an order moves through
const PLA_STAGES = [
  { id:"submitted", label:"Submitted", hint:"Waiting on us" },
  { id:"proof",     label:"Proof",     hint:"Artwork with the roaster" },
  { id:"green",     label:"Green",     hint:"Lot allocated" },
  { id:"roasting",  label:"Roasting",  hint:"On a machine" },
  { id:"packing",   label:"Packing",   hint:"On the bagging line" },
  { id:"shipped",   label:"Shipped",   hint:"Out the door" },
];
const plaStageIdx = (id) => Math.max(0, PLA_STAGES.findIndex(s=>s.id===id));

const PLA_ORDERS = [
  { id:"PL-1051", roaster:"Hare Krishna Coffee", tier:"Wholesale", product:"Hare Krishna House", kind:"blend",
    sel:[{id:"cerrado",pct:60},{id:"sierra",pct:40}], roast:4, lbs:150, bagId:"12oz", packId:"label",
    art:"hk-house-v3.pdf", labelSize:'3.5" × 5" front', stage:"proof", needBy:"Aug 07", placed:"Jul 28", total:1489, flag:"proof" },
  { id:"PL-1050", roaster:"第三波 Third Wave", tier:"Wholesale", product:"Cold Brew Base", kind:"stock", skuId:"s-coldbrew",
    roast:5, lbs:250, bagId:"5lb", packId:"own", ownBags:50, ownEta:"Jul 29", ownReceived:50,
    stage:"roasting", needBy:"Aug 04", placed:"Jul 27", total:1655, flag:null },
  { id:"PL-1049", roaster:"Ninth Street Espresso", tier:"Wholesale", product:"Counter Standard", kind:"stock", skuId:"s-counter",
    roast:4, lbs:100, bagId:"12oz", packId:"stock", stage:"packing", needBy:"Aug 01", placed:"Jul 26", total:927, flag:null },
  { id:"PL-1048", roaster:"Bodega Sur", tier:"Retail", product:"Sunday Filter", kind:"blend",
    sel:[{id:"huila",pct:50},{id:"guji",pct:30},{id:"sierra",pct:20}], roast:3, lbs:60, bagId:"12oz", packId:"label",
    art:"bodega-sunday.ai", labelSize:'4" × 6" front', stage:"submitted", needBy:"Aug 12", placed:"Jul 30", total:812, flag:"proof" },
  { id:"PL-1047", roaster:"Kinship Roasters", tier:"Wholesale", product:"Tolima Strawberry", kind:"stock", skuId:"s-straw",
    roast:2, lbs:40, bagId:"12oz", packId:"stock", stage:"green", needBy:"Aug 05", placed:"Jul 25", total:781, flag:"green" },
  { id:"PL-1046", roaster:"Morningside Café", tier:"Retail", product:"Morningside Blend", kind:"blend",
    sel:[{id:"cerrado",pct:70},{id:"huila",pct:30}], roast:4, lbs:75, bagId:"2lb", packId:"own", ownBags:30, ownEta:"Aug 02", ownReceived:0,
    stage:"submitted", needBy:"Aug 09", placed:"Jul 30", total:596, flag:"bags" },
  { id:"PL-1042", roaster:"Hare Krishna Coffee", tier:"Wholesale", product:"Hare Krishna House", kind:"blend",
    sel:[{id:"cerrado",pct:60},{id:"sierra",pct:40}], roast:4, lbs:150, bagId:"12oz", packId:"label",
    art:"hk-house-v2.pdf", labelSize:'3.5" × 5" front', stage:"shipped", needBy:"Jul 24", placed:"Jul 15", total:1489, flag:null },
  { id:"PL-1038", roaster:"Ninth Street Espresso", tier:"Wholesale", product:"Six Ounce House", kind:"stock", skuId:"s-sixounce",
    roast:3, lbs:60, bagId:"12oz", packId:"stock", stage:"shipped", needBy:"Jul 18", placed:"Jul 10", total:712, flag:null },
];

// artwork sitting in the proof queue
const PLA_PROOFS = [
  { id:"PR-311", orderId:"PL-1051", roaster:"Hare Krishna Coffee", file:"hk-house-v3.pdf", size:'3.5" × 5" front',
    submitted:"Jul 28", state:"awaiting-roaster", note:"Proof printed Jul 29 — with the roaster for sign-off.", rev:3, colors:"2 spot + white" },
  { id:"PR-310", orderId:"PL-1048", roaster:"Bodega Sur", file:"bodega-sunday.ai", size:'4" × 6" front',
    submitted:"Jul 30", state:"needs-review", note:"New artwork. Not yet checked for bleed or ink coverage.", rev:1, colors:"4C process" },
  { id:"PR-309", orderId:"PL-1044", roaster:"Kinship Roasters", file:"kinship-guji.pdf", size:"Full wrap",
    submitted:"Jul 22", state:"changes", note:"Barcode sits 2mm inside the seal zone. Asked for a reposition.", rev:2, colors:"4C process" },
];

// what the facility sells, with the levers admin controls
const PLA_SKU_STATE = {
  "s-counter":  { published:true,  onHand:860,  par:600, weekly:420 },
  "s-sixounce": { published:true,  onHand:540,  par:400, weekly:260 },
  "s-cerrado":  { published:true,  onHand:1860, par:900, weekly:180 },
  "s-huila":    { published:true,  onHand:980,  par:600, weekly:140 },
  "s-guji":     { published:true,  onHand:640,  par:500, weekly:95  },
  "s-decaf":    { published:true,  onHand:420,  par:400, weekly:60  },
  "s-straw":    { published:true,  onHand:340,  par:0,   weekly:110 },
  "s-coldbrew": { published:false, onHand:1200, par:800, weekly:310 },
};

// bag stock on the packaging line
const PLA_BAGSTOCK = [
  { id:"12oz", label:"12 oz kraft pouch", onHand:4200, par:3000, cost:0.68, committed:1180, lead:"9 days" },
  { id:"2lb",  label:"2 lb kraft pouch",  onHand:640,  par:900,  cost:1.10, committed:38,   lead:"9 days" },
  { id:"5lb",  label:"5 lb kraft pouch",  onHand:210,  par:400,  cost:1.65, committed:0,    lead:"14 days" },
];

// bags roasters have shipped in
const PLA_INBOUND = [
  { orderId:"PL-1050", roaster:"第三波 Third Wave",  bags:50,  need:50, arrived:"Jul 29", state:"received" },
  { orderId:"PL-1046", roaster:"Morningside Café", bags:30,  need:38, arrived:"Aug 02", state:"expected" },
];

Object.assign(window, { PLA_STAGES, plaStageIdx, PLA_ORDERS, PLA_PROOFS, PLA_SKU_STATE, PLA_BAGSTOCK, PLA_INBOUND });
