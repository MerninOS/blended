// CoRoasted — fixture data. All seeds for the prototype.
// One coherent universe so the same booking shows up across screens.

const TODAY = "2026-04-25"; // Saturday — but we'll display it as Today regardless

const FACILITY = {
  name: "Hard Knox Roasting Co-Op",
  city: "Austin, TX",
  hoursStart: 7,    // 7am
  hoursEnd: 19,     // 7pm
  minBookingMin: 60, // 1hr minimum
  slotMin: 30,      // 30-min slots on the schedule
};

// Resources are anything bookable on the schedule.
const RESOURCES = [
  { id:"loring",   name:"Loring S15",      kind:"machine", capacity:"15 kg",  rate:75, color:"tomato" },
  { id:"probat25", name:"Probat P25",      kind:"machine", capacity:"25 kg",  rate:95, color:"honey" },
  { id:"probat12", name:"Probat P12",      kind:"machine", capacity:"12 kg",  rate:60, color:"sun" },
  { id:"sample",   name:"Sample Roaster",  kind:"machine", capacity:"500 g",  rate:35, color:"sky" },
  { id:"pack",     name:"Packaging Line",  kind:"service", capacity:"Bagger", rate:45, color:"matcha" },
  { id:"coach",    name:"1:1 Coaching",    kind:"staff",   capacity:"w/ Joel",rate:90, color:"roast" },
];

// Customer roasters
const CUSTOMERS = [
  { id:"c1", name:"Hare Krishna Coffee",   contact:"Mira J.",     tier:"Pro",     since:"Jan 2024", lbsThisMonth:284, owed:1240, status:"good" },
  { id:"c2", name:"Trailhead Roasters",    contact:"Diego M.",    tier:"Standard",since:"Aug 2024", lbsThisMonth:120, owed:0,    status:"good" },
  { id:"c3", name:"South Lamar Coffee",    contact:"Aisha P.",    tier:"Pro",     since:"Mar 2023", lbsThisMonth:412, owed:2860, status:"overdue" },
  { id:"c4", name:"Big Dipper Coffee",     contact:"Tyler R.",    tier:"Standard",since:"Nov 2025", lbsThisMonth:48,  owed:340,  status:"good" },
  { id:"c5", name:"Gabriela Cafe",         contact:"Gabi V.",     tier:"Pro",     since:"Jun 2024", lbsThisMonth:336, owed:1820, status:"good" },
  { id:"c6", name:"Cosmic Bean",           contact:"Jordan K.",   tier:"New",     since:"Apr 2026", lbsThisMonth:24,  owed:180,  status:"new" },
  { id:"c7", name:"Blackland Cafe",        contact:"Marcus H.",   tier:"Pro",     since:"Feb 2024", lbsThisMonth:208, owed:0,    status:"good" },
  { id:"c8", name:"Wide Awake Coffee",     contact:"Sasha L.",    tier:"Standard",since:"Sep 2024", lbsThisMonth:152, owed:520,  status:"good" },
  { id:"c9", name:"Hill Country Roasters", contact:"Pete B.",     tier:"Pro",     since:"Jul 2023", lbsThisMonth:380, owed:2100, status:"good" },
  { id:"c10",name:"Mockingbird Coffee",    contact:"Ines O.",     tier:"New",     since:"Mar 2026", lbsThisMonth:36,  owed:240,  status:"new" },
];

const customerById = id => CUSTOMERS.find(c=>c.id===id) || {name:"Unknown"};

// Bookings — keyed by ISO day. Times are quarter-hour-aligned floats (h.5 = :30)
// type: toll | coroast | coach | pack | storage
// status: confirmed | inprogress | completed | upcoming | tentative
const BOOKINGS = {
  "2026-04-25": [
    { id:"b101", resource:"loring",   customer:"c1", type:"coroast", start:8.0,  end:11.0, status:"inprogress", lot:"Ethiopia Yirg G1",    lbs:120, profile:"Light, City+", staff:"Jess",  paid:false, total:430 },
    { id:"b102", resource:"loring",   customer:"c5", type:"toll",    start:11.5, end:13.5, status:"upcoming",   lot:"Colombia La Esmeralda",lbs:80,  profile:"Med, Full City", staff:null,    paid:true,  total:210 },
    { id:"b103", resource:"loring",   customer:"c3", type:"coroast", start:14.0, end:17.0, status:"upcoming",   lot:"Brazil Daterra",       lbs:140, profile:"Med-Dark", staff:"Aaron", paid:false, total:610 },

    { id:"b104", resource:"probat25", customer:"c9", type:"toll",    start:7.0,  end:9.5,  status:"in-progress", lot:"Sumatra Mandheling",   lbs:180, profile:"Dark, Vienna", staff:null,    paid:true,  total:380 },
    { id:"b105", resource:"probat25", customer:"c3", type:"toll",    start:10.5, end:13.0, status:"upcoming",   lot:"Kenya Nyeri AA",       lbs:160, profile:"Light", staff:null,    paid:false, total:340 },
    { id:"b106", resource:"probat25", customer:"c8", type:"coroast", start:14.5, end:17.5, status:"upcoming",   lot:"Guatemala Huehue",     lbs:200, profile:"Med", staff:"Jess",  paid:true,  total:840 },

    { id:"b107", resource:"probat12", customer:"c4", type:"toll",    start:9.0,  end:11.0, status:"upcoming",   lot:"Costa Rica Tarrazu",   lbs:60,  profile:"City", staff:null,    paid:true,  total:160 },
    { id:"b108", resource:"probat12", customer:"c7", type:"toll",    start:13.0, end:15.5, status:"upcoming",   lot:"Burundi Long Miles",   lbs:100, profile:"Med", staff:null,    paid:true,  total:240 },
    { id:"b109", resource:"probat12", customer:"c2", type:"coroast", start:16.0, end:18.5, status:"upcoming",   lot:"Honduras El Puente",   lbs:90,  profile:"Med-Dark", staff:"Aaron", paid:false, total:380 },

    { id:"b110", resource:"sample",   customer:"c6", type:"coach",   start:10.0, end:11.5, status:"upcoming",   lot:"Sample · 4 origins",   lbs:2,   profile:"Profiling 101", staff:"Joel",  paid:true,  total:135 },
    { id:"b111", resource:"sample",   customer:"c10",type:"coach",   start:13.0, end:14.5, status:"upcoming",   lot:"Sample · Ethiopia",    lbs:1,   profile:"Roast curve", staff:"Joel",  paid:false, total:135 },

    { id:"b112", resource:"pack",     customer:"c1", type:"pack",    start:11.5, end:13.5, status:"upcoming",   lot:"12oz valve bags · 240ct", lbs:180, profile:"—", staff:"Mei",   paid:false, total:170 },
    { id:"b113", resource:"pack",     customer:"c9", type:"pack",    start:14.5, end:16.0, status:"upcoming",   lot:"5lb bulk · 36ct",      lbs:180, profile:"—", staff:"Mei",   paid:true,  total:90 },

    { id:"b114", resource:"coach",    customer:"c10",type:"coach",   start:15.5, end:17.5, status:"upcoming",   lot:"Loring orientation",   lbs:0,   profile:"Onboarding", staff:"Joel",  paid:true,  total:180 },
  ],
  "2026-04-26": [
    { id:"b201", resource:"loring",   customer:"c5", type:"coroast", start:8.0,  end:10.5, status:"upcoming", lot:"Colombia La Esmeralda", lbs:100, profile:"Med", staff:"Jess", paid:true, total:430, recurring:true },
    { id:"b202", resource:"probat25", customer:"c9", type:"toll",    start:9.0,  end:12.0, status:"upcoming", lot:"Sumatra Mandheling",    lbs:200, profile:"Dark", staff:null,   paid:true, total:380 },
    { id:"b203", resource:"probat12", customer:"c2", type:"toll",    start:13.0, end:15.0, status:"upcoming", lot:"Honduras El Puente",    lbs:80,  profile:"Med", staff:null,   paid:false,total:160 },
    { id:"b204", resource:"pack",     customer:"c5", type:"pack",    start:11.0, end:12.5, status:"upcoming", lot:"12oz valve bags · 160ct",lbs:120,profile:"—", staff:"Mei",  paid:true, total:120 },
  ],
  "2026-04-27": [
    { id:"b301", resource:"loring",   customer:"c1", type:"coroast", start:8.0,  end:11.0, status:"upcoming", lot:"Ethiopia Yirg G1",      lbs:120, profile:"Light", staff:"Jess", paid:false,total:430, recurring:true },
    { id:"b302", resource:"probat25", customer:"c3", type:"coroast", start:8.0,  end:12.0, status:"upcoming", lot:"Brazil Cerrado",        lbs:240, profile:"Med-Dark", staff:"Aaron", paid:false,total:980 },
    { id:"b303", resource:"probat25", customer:"c8", type:"toll",    start:13.0, end:16.0, status:"upcoming", lot:"Guatemala Huehue",      lbs:200, profile:"Med", staff:null,   paid:true, total:380 },
    { id:"b304", resource:"probat12", customer:"c7", type:"toll",    start:7.5,  end:9.5,  status:"in-progress", lot:"Burundi Long Miles",    lbs:90,  profile:"Med", staff:null,   paid:true, total:160, autoCompleteAt:9.75 },
    { id:"b305", resource:"sample",   customer:"c6", type:"coach",   start:14.0, end:15.5, status:"upcoming", lot:"Sample roast",          lbs:2,   profile:"Profiling 102", staff:"Joel", paid:false,total:135 },
    { id:"b306", resource:"pack",     customer:"c1", type:"pack",    start:11.0, end:12.5, status:"upcoming", lot:"12oz · 200ct",          lbs:150, profile:"—", staff:"Mei",  paid:false,total:140 },
  ],
};

// Storage — facility rents shelves to roasters. Charge by shelf, not by lb.
// Roasters fit whatever they can in their allocated shelf.
const SHELVES = [
  { id:"sh-A01", row:"A", num:"01", customer:"c1", since:"2025-09-12", size:"Full",  rate:85, status:"active"  },
  { id:"sh-A02", row:"A", num:"02", customer:"c1", since:"2025-11-04", size:"Full",  rate:85, status:"active"  },
  { id:"sh-A03", row:"A", num:"03", customer:"c3", since:"2025-06-20", size:"Full",  rate:85, status:"active"  },
  { id:"sh-A04", row:"A", num:"04", customer:"c3", since:"2025-08-08", size:"Full",  rate:85, status:"active"  },
  { id:"sh-B01", row:"B", num:"01", customer:"c5", since:"2025-10-28", size:"Full",  rate:85, status:"active"  },
  { id:"sh-B02", row:"B", num:"02", customer:"c8", since:"2026-01-14", size:"Half",  rate:50, status:"active"  },
  { id:"sh-B03", row:"B", num:"03", customer:"c9", since:"2024-11-30", size:"Full",  rate:85, status:"overdue" },
  { id:"sh-B04", row:"B", num:"04", customer:"c2", since:"2026-02-19", size:"Half",  rate:50, status:"active"  },
  { id:"sh-C01", row:"C", num:"01", customer:"c7", since:"2025-03-04", size:"Full",  rate:85, status:"active"  },
  { id:"sh-C02", row:"C", num:"02", customer:"c4", since:"2026-03-12", size:"Half",  rate:50, status:"active"  },
  { id:"sh-C03", row:"C", num:"03", customer:null, since:null,         size:"Half",  rate:50, status:"open"    },
  { id:"sh-C04", row:"C", num:"04", customer:null, since:null,         size:"Full",  rate:85, status:"open"    },
];

// Service offerings — what the facility sells.
const SERVICES = [
  { id:"toll",    label:"Toll Roasting",   billing:"per hour",  unit:"hr",   rate:75,  enabled:true,  desc:"Roaster books machine time. They run their own beans." },
  { id:"coroast", label:"Co-Roasting",     billing:"per pound", unit:"lb",   rate:3.5, enabled:true,  desc:"We roast their green to their profile. Beans → finished bags." },
  { id:"pack",    label:"Packaging",       billing:"per bag",   unit:"bag",  rate:0.85,enabled:true,  desc:"Valve bags + tin ties + heat seal. We label too." },
  { id:"coach",   label:"1:1 Coaching",    billing:"per hour",  unit:"hr",   rate:90,  enabled:true,  desc:"Joel walks you through the machine, the curve, the cup." },
  { id:"storage", label:"Shelf Rental",    billing:"per month", unit:"mo",   rate:85,  enabled:true,  desc:"Climate-controlled shelf in our green room. Roasters fit whatever they can." },
  { id:"recur",   label:"Recurring Slots", billing:"weekly",    unit:"slot", rate:0,   enabled:true,  desc:"Lock in a regular timeslot. Auto-creates the booking each week." },
];

// Invoices
const INVOICES = [
  { id:"INV-2104", customer:"c3", issued:"2026-04-01", due:"2026-04-15", amount:1820, status:"overdue", days:10, items:6 },
  { id:"INV-2107", customer:"c3", issued:"2026-04-12", due:"2026-04-26", amount:1040, status:"due",     days:1,  items:4 },
  { id:"INV-2110", customer:"c1", issued:"2026-04-15", due:"2026-04-29", amount:1240, status:"due",     days:4,  items:5 },
  { id:"INV-2112", customer:"c5", issued:"2026-04-18", due:"2026-05-02", amount:1820, status:"open",    days:7,  items:7 },
  { id:"INV-2113", customer:"c4", issued:"2026-04-20", due:"2026-05-04", amount:340,  status:"open",    days:9,  items:2 },
  { id:"INV-2099", customer:"c9", issued:"2026-03-28", due:"2026-04-11", amount:2100, status:"paid",    days:0,  items:8 },
  { id:"INV-2098", customer:"c8", issued:"2026-03-26", due:"2026-04-09", amount:520,  status:"paid",    days:0,  items:3 },
  { id:"INV-2095", customer:"c7", issued:"2026-03-22", due:"2026-04-05", amount:840,  status:"paid",    days:0,  items:4 },
  { id:"INV-2114", customer:"c8", issued:"2026-04-22", due:"2026-05-06", amount:520,  status:"open",    days:11, items:3 },
];

// Type metadata used everywhere
const BOOKING_TYPES = {
  toll:    { label:"Toll",      color:"tomato",  fg:"cream",    desc:"Pay-by-hour machine time" },
  coroast: { label:"Co-Roast",  color:"honey",   fg:"espresso", desc:"We roast, you pay per lb" },
  coach:   { label:"1:1",       color:"sky",     fg:"espresso", desc:"Coaching session" },
  pack:    { label:"Packaging", color:"matcha",  fg:"cream",    desc:"Bag + label" },
  storage: { label:"Storage",   color:"fog",     fg:"espresso", desc:"Bean storage" },
};

const STATUS_META = {
  inprogress: { label:"On floor", color:"tomato",  pulse:true },
  completed:  { label:"Done",     color:"matcha" },
  upcoming:   { label:"Upcoming", color:"cream"  },
  tentative:  { label:"Hold",     color:"sun"    },
};

// Helpers
const fmtTime = h => {
  const hr = Math.floor(h);
  const min = Math.round((h-hr)*60);
  const ampm = hr>=12 ? "p" : "a";
  const h12 = ((hr+11)%12)+1;
  return min===0 ? `${h12}${ampm}` : `${h12}:${String(min).padStart(2,"0")}${ampm}`;
};
const fmtTimeLong = h => {
  const hr = Math.floor(h); const min = Math.round((h-hr)*60);
  const ampm = hr>=12?"PM":"AM"; const h12 = ((hr+11)%12)+1;
  return `${h12}:${String(min).padStart(2,"0")} ${ampm}`;
};
const durHrs = (s,e) => (e-s);

Object.assign(window, {
  TODAY, FACILITY, RESOURCES, CUSTOMERS, BOOKINGS, SHELVES, SERVICES, INVOICES,
  BOOKING_TYPES, STATUS_META, customerById, fmtTime, fmtTimeLong, durHrs,
});
