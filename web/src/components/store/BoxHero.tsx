"use client";
// Coffee Lab hero: the turnable BLENDED bag on the tan stage, fitted between
// the title and a scroll cue (BoxHero.jsx). Kept short so step 1 — choosing
// coffees — shows on the first screen, with the cue pointing down to it.
import { useEffect, useRef, useState } from "react";
import { disp, over } from "@/components/ui/primitives";
import { BOX_D, BOX_H, BOX_W, mountBox } from "./box3d";

export function BoxHero() {
  const canvasHost = useRef<HTMLDivElement>(null), titleRef = useRef<HTMLDivElement>(null), cueRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = canvasHost.current; if (!host) return;
    let cleanup: (() => void) | null = null, cancelled = false;
    void mountBox(host, {
      cam: [0, .5, 8], look: [0, 0, 0], baseRot: -.45,
      onReady: () => setReady(true),
      // fit the bag into the gap between the title and the cue
      layout: ({ three, camera, rig }) => {
        const vh = host.clientHeight || 1, vw = host.clientWidth || 1;
        const top = titleRef.current ? titleRef.current.offsetTop + titleRef.current.offsetHeight + 12 : 80;
        const bot = cueRef.current ? cueRef.current.offsetTop - 12 : vh - 60;
        const band = Math.max(40, bot - top);
        const wpp = 2 * 8 * Math.tan(three.MathUtils.degToRad(camera.fov / 2)) / vh;
        const sc = Math.max(.05, Math.min(band * .9 * wpp / BOX_H, vw * .7 * wpp / Math.hypot(BOX_W, BOX_D)));
        rig.scale.setScalar(sc);
        rig.position.y = (vh / 2 - (top + bot) / 2) * wpp - sc * BOX_H / 2;
      },
    }).then((h) => { if (cancelled) h.dispose(); else cleanup = h.dispose; });
    return () => { cancelled = true; cleanup?.(); };
  }, []);

  return (
    <section className="bx-hero" aria-label="Coffee Lab" style={{ position: "relative", background: "var(--bag-stage)" }}>
      <div className="bx-stage" style={{ position: "relative", height: "clamp(340px, 50svh, 540px)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div ref={titleRef} style={{ textAlign: "center", padding: "clamp(16px,4vh,40px) 24px 0", flexShrink: 0, position: "relative", zIndex: 2 }}>
          <h1 style={{ ...disp, fontSize: "clamp(32px,4.4vw,64px)", lineHeight: 1, margin: 0, color: "var(--ink)" }}>COFFEE LAB</h1>
          <p style={{ ...over, fontSize: 10.5, color: "var(--ink-muted)", margin: "12px 0 0" }}>Create your coffee blend · Roasted to order</p>
        </div>
        <div ref={canvasHost} style={{ position: "absolute", inset: 0, opacity: ready ? 1 : 0, transition: "opacity 600ms var(--ease)" }} />
        <div ref={cueRef} className="bx-cue" aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "0 24px clamp(12px,2.4vh,22px)", zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, ...over, fontSize: 10.5, color: "var(--ink-muted)", pointerEvents: "none" }}>
          <span><span style={{ color: "var(--brand)" }}>1</span> · Choose your coffees below</span>
          <svg className="bx-cue-arrow" width="14" height="8" viewBox="0 0 14 8" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l6 6 6-6" /></svg>
        </div>
      </div>
    </section>
  );
}
