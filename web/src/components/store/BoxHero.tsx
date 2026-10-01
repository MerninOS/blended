"use client";
// Coffee Lab hero: the turnable BLENDED bag on the tan stage, fitted between
// the title and a "start building" cue (BoxHero.jsx). Shorter than a full
// screen so the first step — choosing coffees — starts just below it.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { disp, over } from "@/components/ui/primitives";
import { BOX_D, BOX_H, BOX_W, mountBox } from "./box3d";

export function BoxHero({ onStart }: { onStart: () => void }) {
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
      <div className="bx-stage" style={{ position: "relative", height: "clamp(400px, 64svh, 640px)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div ref={titleRef} style={{ textAlign: "center", padding: "clamp(16px,4vh,40px) 24px 0", flexShrink: 0, position: "relative", zIndex: 2 }}>
          <h1 style={{ ...disp, fontSize: "clamp(32px,4.4vw,64px)", lineHeight: 1, margin: 0, color: "var(--ink)" }}>COFFEE LAB</h1>
          <p style={{ ...over, fontSize: 10.5, color: "var(--ink-muted)", margin: "12px 0 0" }}>Create your coffee blend · Roasted to order</p>
        </div>
        <div ref={canvasHost} style={{ position: "absolute", inset: 0, opacity: ready ? 1 : 0, transition: "opacity 600ms var(--ease)" }} />
        <div ref={cueRef} style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "0 24px clamp(16px,3vh,28px)", zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <button type="button" onClick={onStart} className="bx-start" style={{ ...over, fontSize: 11, display: "inline-flex", alignItems: "center", gap: 10, height: 44, padding: "0 20px", border: 0, borderRadius: "var(--r-md)", background: "var(--ink)", color: "var(--on-ink)", cursor: "pointer" }}>
            Start building <Icon name="arrow" size={14} stroke={2} />
          </button>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, color: "var(--ink-muted)" }}>
            Want one coffee as it is? <Link href="/coffees" style={{ color: "var(--ink)", textDecoration: "underline", textUnderlineOffset: 3 }}>Shop our coffees</Link>
          </span>
        </div>
      </div>
    </section>
  );
}
