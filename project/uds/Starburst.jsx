// CoffeeOS primitive — better Starburst
const _makeBurstPts = (points, outerR, innerR, cx=60, cy=60) => {
  const total = points*2; const out=[];
  for(let i=0;i<total;i++){ const r=i%2===0?outerR:innerR; const a=(Math.PI*2*i/total)-Math.PI/2;
    out.push(`${(cx+r*Math.cos(a)).toFixed(2)},${(cy+r*Math.sin(a)).toFixed(2)}`);}
  return out.join(" ");
};
const _BURST = _makeBurstPts(24,58,44);

const Starburst = ({ label, color="sun", size=80, style }) => {
  const m = { sun:{bg:"#F5C842",fg:"#1C0F05"}, tomato:{bg:"#E8442A",fg:"#F5F0D8"},
    espresso:{bg:"#1C0F05",fg:"#F5F0D8"}, sky:{bg:"#5BC8D5",fg:"#1C0F05"},
    matcha:{bg:"#5A7A3A",fg:"#F5F0D8"}, cream:{bg:"#F5F0D8",fg:"#1C0F05"}, }[color];
  return (
    <div style={{position:"relative",display:"inline-flex",width:size,height:size,alignItems:"center",justifyContent:"center",...style}}>
      <svg viewBox="0 0 120 120" style={{position:"absolute",inset:0,width:"100%",height:"100%"}}>
        <polygon points={_BURST} fill={m.bg} stroke="#1C0F05" strokeWidth="3" strokeLinejoin="round"/>
      </svg>
      <span style={{position:"relative",zIndex:2,color:m.fg,fontFamily:"var(--font-body)",fontWeight:800,fontSize:Math.max(10,Math.round(size*0.14)),letterSpacing:".04em",lineHeight:1.05,textAlign:"center",padding:"0 14%"}}>{label}</span>
    </div>
  );
};
Object.assign(window, { Starburst });
