// Collapsible reviews for any coffee a customer can pick: our graders' cupping
// read plus customer reviews. Sample content, derived from each lot's cupping
// scores until real reviews are wired from Admin.

const CR_GRADERS = [{n:"Maya R.",t:"Q Grader"},{n:"Luis O.",t:"Head roaster"},{n:"Priya S.",t:"Q Grader"}];
const CR_PEOPLE = ["Jordan K.","Sam T.","Alex M.","Riley P.","Casey W.","Morgan L.","Devon H.","Avery C.","Jamie F.","Taylor B."];
const CR_BREW = ["Pour-over","Espresso","French press","AeroPress","Drip","Cold brew"];
const CR_LINES = {
  cocoa:["Rich and chocolatey without getting heavy.","Tastes like a good dark chocolate bar."],
  brownSugar:["Sweet enough that I stopped adding sugar.","Caramel sweetness all the way through."],
  malt:["Round, bready, very easy to drink every morning.","Comforting and malty. My daily cup now."],
  hazelnut:["Nutty and smooth. Great with milk.","Toasted hazelnut, super mellow."],
  almond:["Soft and nutty, nothing sharp about it.","Clean, almond-y finish I keep chasing."],
  ferment:["Wild in the best way, like boozy fruit.","Funky and fun. Not for everyone, perfect for me."],
  berry:["Big berry notes, almost jammy.","Blueberry jumped out right away."],
  stoneFruit:["Peachy and juicy as it cools.","Stone fruit sweetness, really bright."],
  citrus:["Bright and zesty, wakes you up.","Lemony acidity that stays clean."],
  floral:["Delicate, tea-like and floral.","Jasmine on the nose, light body."],
};
const crHash = (s) => { let h = 7; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
const crTop = (notes = {}) => PL_AX.map(a => ({ k:a.k, l:a.l, v:notes[a.k] || 0 })).sort((a,b) => b.v - a.v);

const crFor = (coffee) => {
  const h = crHash(coffee.id), top = crTop(coffee.notes);
  const g = CR_GRADERS[h % CR_GRADERS.length];
  const score = (84 + (top[0]?.v || 5) * .35 + (h % 7) / 10).toFixed(2);
  const grader = { who:g.n, role:g.t, score,
    note:`${top[0]?.l || "Balanced"} up front, then ${(top[1]?.l || "sweetness").toLowerCase()} and ${(top[2]?.l || "a clean finish").toLowerCase()}. ${h % 2 ? "Holds its sweetness as it cools." : "Clean finish, medium body."}` };
  const count = 12 + (h % 40);
  const reviews = [0,1,2].map(i => {
    const k = top[i % 3]?.k || "malt", lines = CR_LINES[k] || CR_LINES.malt;
    return { who:CR_PEOPLE[(h + i * 3) % CR_PEOPLE.length], brew:CR_BREW[(h + i) % CR_BREW.length], stars: i === 2 && h % 3 === 0 ? 4 : 5, text: lines[(h + i) % lines.length] };
  });
  const avg = (reviews.reduce((a,r) => a + r.stars, 0) / reviews.length - (h % 3) * .1).toFixed(1);
  return { grader, reviews, count, avg };
};

const CrStars = ({ n, size = 11 }) => (
  <span aria-label={`${n} of 5`} style={{display:"inline-flex",gap:1,color:"var(--brand)",fontSize:size,lineHeight:1,letterSpacing:0}}>
    {[1,2,3,4,5].map(i => <span key={i} style={{opacity:i <= Math.round(n) ? 1 : .22}}>★</span>)}
  </span>
);

const CoffeeReviews = ({ coffee, compact }) => {
  const [open, setOpen] = React.useState(false);
  const d = React.useMemo(() => crFor(coffee), [coffee.id]);
  const stop = (e) => e.stopPropagation();
  return (
    <div onClick={stop} onKeyDown={stop} style={{borderTop:"1px solid var(--hairline)"}}>
      <button type="button" aria-expanded={open} onClick={() => setOpen(o => !o)}
        style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:compact ? "8px 0" : "9px 0",background:"none",border:"none",cursor:"pointer",textAlign:"left",color:"var(--ink)"}}>
        <CrStars n={+d.avg}/>
        <span style={{...mono,fontSize:11.5,color:"var(--ink)"}}>{d.avg}</span>
        <span style={{fontFamily:"var(--font-sans)",fontSize:11.5,color:"var(--ink-subtle)",flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.count} reviews · grader notes</span>
        <span style={{display:"inline-flex",transform:open ? "rotate(180deg)" : "none",transition:"transform var(--dur) var(--ease)",color:"var(--ink-subtle)",fontSize:10}}>▾</span>
      </button>
      {open && (
        <div style={{display:"flex",flexDirection:"column",gap:14,paddingBottom:12}}>
          <div style={{display:"flex",flexDirection:"column",gap:6,padding:"10px 12px",background:"var(--surface-sunken)",borderRadius:"var(--r-sm)"}}>
            <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:8}}>
              <span style={{...over,fontSize:9.5,color:"var(--ink-muted)"}}>What our graders say</span>
              <span style={{...mono,fontSize:12,color:"var(--ink)"}}>{d.grader.score}</span>
            </div>
            <p style={{margin:0,fontFamily:"var(--font-sans)",fontSize:12.5,lineHeight:1.5,color:"var(--ink)",textWrap:"pretty"}}>{d.grader.note}</p>
            <span style={{fontFamily:"var(--font-sans)",fontSize:11,color:"var(--ink-subtle)"}}>{d.grader.who} · {d.grader.role}</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <span style={{...over,fontSize:9.5,color:"var(--ink-muted)"}}>From customers</span>
            {d.reviews.map((r, i) => (
              <div key={i} style={{display:"flex",flexDirection:"column",gap:4,paddingTop:i ? 10 : 0,borderTop:i ? "1px solid var(--hairline)" : "none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <CrStars n={r.stars} size={10}/>
                  <span style={{fontFamily:"var(--font-sans)",fontSize:11.5,fontWeight:600,color:"var(--ink)"}}>{r.who}</span>
                  <span style={{fontFamily:"var(--font-sans)",fontSize:11,color:"var(--ink-subtle)"}}>· {r.brew}</span>
                </div>
                <p style={{margin:0,fontFamily:"var(--font-sans)",fontSize:12.5,lineHeight:1.5,color:"var(--ink-muted)",textWrap:"pretty"}}>{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { CoffeeReviews });
