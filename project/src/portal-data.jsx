// Roaster Portal — a roaster's view (Hare Krishna Coffee, c1).
// Shares the same data fixtures as the facility-side CoRoasted app.

const ME = "c1"; // signed-in roaster

// MY bookings = bookings I own across the whole week. We synthesize a small week.
const WEEK = ["2026-04-25","2026-04-26","2026-04-27","2026-04-28","2026-04-29","2026-04-30","2026-05-01"];
const DOW  = ["Sat","Sun","Mon","Tue","Wed","Thu","Fri"];
const FULL_DOW = ["Saturday","Sunday","Monday","Tuesday","Wednesday","Thursday","Friday"];

// Synthesize a week of bookings if not present (re-using BOOKINGS for any day already seeded)
const WEEK_BOOKINGS = (() => {
  const out = {};
  WEEK.forEach((day, i) => {
    out[day] = (BOOKINGS[day] || []).map(b => ({...b, day}));
    if ((BOOKINGS[day]||[]).length === 0) {
      // seed a few facility-wide bookings (other roasters) so the schedule looks lived-in
      const seeds = [
        { id:`s${i}1`, day, resource:"loring",   customer:"c5", type:"toll",    start:8.0,  end:10.5, status:"upcoming", lot:"Colombia",        lbs:80,  profile:"Med",     staff:null,    paid:true,  total:188 },
        { id:`s${i}2`, day, resource:"loring",   customer:"c3", type:"coroast", start:11.0, end:14.0, status:"upcoming", lot:"Brazil Daterra",   lbs:140, profile:"Med-Dark",staff:"Aaron",paid:false, total:610 },
        { id:`s${i}3`, day, resource:"probat25", customer:"c9", type:"toll",    start:7.5,  end:9.5,  status:"upcoming", lot:"Sumatra",          lbs:160, profile:"Dark",    staff:null,    paid:true,  total:380 },
        { id:`s${i}4`, day, resource:"probat25", customer:"c8", type:"coroast", start:13.0, end:16.0, status:"upcoming", lot:"Guatemala",        lbs:200, profile:"Med",     staff:"Jess", paid:true,  total:840 },
        { id:`s${i}5`, day, resource:"probat12", customer:"c4", type:"toll",    start:9.5,  end:11.5, status:"upcoming", lot:"Costa Rica",       lbs:60,  profile:"City",    staff:null,    paid:true,  total:160 },
        { id:`s${i}6`, day, resource:"probat12", customer:"c2", type:"coroast", start:14.0, end:16.5, status:"upcoming", lot:"Honduras",         lbs:90,  profile:"Med-Dk", staff:"Aaron",paid:false, total:380 },
        { id:`s${i}7`, day, resource:"sample",   customer:"c10",type:"coach",   start:13.5, end:15.0, status:"upcoming", lot:"Sample",           lbs:2,   profile:"Profiling",staff:"Joel", paid:false, total:135 },
        { id:`s${i}8`, day, resource:"pack",     customer:"c5", type:"pack",    start:11.0, end:12.5, status:"upcoming", lot:"12oz · 200ct",     lbs:150, profile:"—",       staff:"Mei",  paid:true,  total:140 },
      ];
      out[day] = seeds;
    }
  });
  // ensure each day has at least one of MY bookings (c1)
  WEEK.forEach((day, i) => {
    const hasMine = out[day].some(b => b.customer === ME);
    if (!hasMine && i % 2 === 1) {
      // 14:30–17:30 on the Loring: after the seeded 8–10.5 and 11–14 runs, so no
      // two roasters ever hold the same machine at once.
      out[day].push({ id:`m${i}`, day, resource:"loring", customer:ME, type:"coroast", start:14.5, end:17.5, status:"upcoming", lot:"Ethiopia Yirg G1", lbs:120, profile:"Light, City+", staff:"Jess", paid:false, total:430 });
    }
  });
  return out;
})();

const myBookingsAll = WEEK.flatMap(d => (WEEK_BOOKINGS[d]||[]).filter(b => b.customer === ME).map(b => ({...b, day:d})));
const myShelves = SHELVES.filter(s => s.customer === ME);
const myInvoices = INVOICES.filter(i => i.customer === ME);

Object.assign(window, { ME, WEEK, DOW, FULL_DOW, WEEK_BOOKINGS, myBookingsAll, myShelves, myInvoices });
