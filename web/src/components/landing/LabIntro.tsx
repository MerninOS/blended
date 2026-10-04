"use client";
// "Opening the Coffee Lab": sample blend cards dealt onto the tan stage, the
// top one zooms away, then we go on. It also covers the 3D bag model loading:
// with `ready`, it holds on the last card until that settles (never longer
// than CAP_MS), so the lab opens with the model in place. Click to skip.
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { IntroBlend } from "@/lib/landing";
import "./lab-intro.css";

const IC_COLORS = ["#EE8A1E", "#C43C7C", "#D93D18", "#8E2F52"];
const IC_ROAST = ["#8C9A6B", "#D9A441", "#C4763C", "#9A4F26", "#6B3018", "#3A2118"];
const track = { fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: ".14em", color: "#1A1A18" } as const;
const STEP = 520, CAP_MS = 12000;

function IntroCard({ b }: { b: IntroBlend }) {
  return (
    <div className="ic-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <div style={{ fontFamily: "var(--font-logo)", fontWeight: 800, fontSize: "clamp(24px,3vw,36px)", letterSpacing: "-.02em", lineHeight: 1, textTransform: "uppercase", color: "#1A1A18" }}>Blended</div>
          <div style={{ ...track, fontSize: 11, marginTop: 8, color: "#D93D18" }}>{b.name}</div>
        </div>
        <Image src="/brand/blended-mark.png" alt="" width={56} height={56} style={{ width: "clamp(40px,4.6vw,56px)", height: "auto", mixBlendMode: "multiply" }} />
      </div>
      <div className="ic-body" style={{ display: "grid", gridTemplateColumns: "minmax(0,3fr) minmax(0,2fr)", gap: "clamp(16px,3vw,32px)", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          {b.parts.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "clamp(12px,2vw,22px)" }}>
              <span style={{ width: "clamp(36px,5vw,58px)", height: Math.max(22, p.pct * .8), background: IC_COLORS[i % 4], borderRadius: 2, flexShrink: 0 }} />
              <span style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}>
                <span style={{ ...track, fontSize: "clamp(11px,1.4vw,15px)" }}>{p.name}</span>
                <span style={{ ...track, fontSize: 9.5, letterSpacing: ".1em", color: "rgba(26,26,24,.62)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.origin}</span>
              </span>
              <span style={{ ...track, letterSpacing: ".06em", fontSize: "clamp(11px,1.4vw,15px)" }}>{p.pct}%</span>
            </div>
          ))}
        </div>
        <svg className="ic-svg" viewBox="84 84 312 312" style={{ width: "100%", maxWidth: 200, justifySelf: "center", overflow: "visible" }} aria-hidden="true">
          {[150, 109, 68].map((r) => <circle key={r} cx="240" cy="240" r={r} fill="none" stroke="rgba(26,26,24,.18)" strokeWidth="1.5" />)}
          <g className="ic-radar">
            <path d={b.radar} fill="rgba(196,60,124,.32)" stroke="#C43C7C" strokeWidth="4" strokeLinejoin="round" />
            {b.dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4.5" fill="#C43C7C" />)}
          </g>
        </svg>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <span style={{ ...track, fontSize: "clamp(10px,1.3vw,14px)" }}>{b.notes}</span>
        <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "flex", gap: 2 }}>{[1, 2, 3, 4, 5].map((n) => <span key={n} style={{ width: 10, height: 6, borderRadius: 1, background: n <= b.roast ? IC_ROAST[b.roast] : "rgba(26,26,24,.14)" }} />)}</span>
            <span style={{ ...track, fontSize: "clamp(10px,1.3vw,14px)" }}>{b.roastLabel} roast</span>
          </span>
          <span style={{ ...track, fontSize: "clamp(10px,1.3vw,14px)" }}>1 lb · Whole bean</span>
        </span>
      </div>
    </div>
  );
}

/**
 * `minMs` overrides how long the deck plays (default: every card dealt). `ready`: wait
 * for it too before leaving. `onDone` fires after the exit animation, or on click.
 */
export function LabIntro({ blends, onDone, ready, minMs }: { blends: IntroBlend[]; onDone: () => void; ready?: Promise<unknown>; minMs?: number }) {
  const end = minMs ?? 700 + blends.length * STEP + 500;
  const [out, setOut] = useState(false);
  const done = useRef(onDone), wait = useRef(ready);
  useEffect(() => { done.current = onDone; });
  useEffect(() => {
    let live = true;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      await sleep(end);
      if (wait.current) await Promise.race([wait.current, sleep(CAP_MS - end)]);
      if (!live) return;
      setOut(true);
      await sleep(750);
      if (live) done.current();
    })();
    return () => { live = false; };
  }, [end]);
  return (
    <div className={"ic-stage" + (out ? " out" : "")} onClick={() => done.current()} role="dialog" aria-label="Opening the Coffee Lab">
      <div className="ic-marq lp-disp" aria-hidden="true"><div>{[0, 1].map((k) => <span key={k}>Build your blend · Coffee Lab · Build your blend · Coffee Lab ·&nbsp;</span>)}</div></div>
      <div className="ic-deck">
        {blends.map((b, i) => (
          <div key={i} className="ic-slot" style={{ "--i": i, "--rot": `${(i % 2 ? 1 : -1) * (1.5 + i * .7)}deg`, zIndex: i + 1, animationDelay: `${700 + i * STEP}ms` } as React.CSSProperties}>
            <IntroCard b={b} />
          </div>
        ))}
      </div>
      <div className="ic-foot">
        <span className="lp-over" style={{ color: "var(--ink-muted)" }}>Opening the Coffee Lab</span>
        <span className="ic-prog"><i style={{ animationDuration: `${end}ms` }} /></span>
        <span className="lp-over" style={{ color: "var(--ink-subtle)" }}>Click to skip</span>
      </div>
    </div>
  );
}
