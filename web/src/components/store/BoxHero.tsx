"use client";
// Retail hero: the turnable BLENDED bag on the tan stage, fitted between the
// title and the two buying paths (BoxHero.jsx).
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { disp, over } from "@/components/ui/primitives";
import { BOX_D, BOX_H, BOX_W, mountBox } from "./box3d";

export interface HeroOption { id: "shop" | "blend"; icon: string; title: string; desc: string; meta: string }

export function BoxHero({ mode, onPick, options }: { mode: string; onPick: (id: HeroOption["id"]) => void; options: HeroOption[] }) {
  const canvasHost = useRef<HTMLDivElement>(null), titleRef = useRef<HTMLDivElement>(null), optsRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = canvasHost.current; if (!host) return;
    let cleanup: (() => void) | null = null, cancelled = false;
    void mountBox(host, {
      cam: [0, .5, 8], look: [0, 0, 0], baseRot: -.45,
      onReady: () => setReady(true),
      // fit the bag into the gap between the title and the options
      layout: ({ three, camera, rig }) => {
        const vh = host.clientHeight || 1, vw = host.clientWidth || 1;
        const top = titleRef.current ? titleRef.current.offsetTop + titleRef.current.offsetHeight + 16 : 80;
        const bot = optsRef.current ? optsRef.current.offsetTop - 20 : vh - 90;
        const band = Math.max(40, bot - top);
        const wpp = 2 * 8 * Math.tan(three.MathUtils.degToRad(camera.fov / 2)) / vh;
        const sc = Math.max(.05, Math.min(band * .84 * wpp / BOX_H, vw * .7 * wpp / Math.hypot(BOX_W, BOX_D)));
        rig.scale.setScalar(sc);
        rig.position.y = (vh / 2 - (top + bot) / 2) * wpp - sc * BOX_H / 2;
      },
    }).then((h) => { if (cancelled) h.dispose(); else cleanup = h.dispose; });
    return () => { cancelled = true; cleanup?.(); };
  }, []);

  return (
    <section className="bx-hero" aria-label="Coffee Lab" style={{ position: "relative", background: "var(--bag-stage)" }}>
      <div className="bx-stage" style={{ position: "relative", height: "calc(100svh - var(--topbar-h))", minHeight: 520, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div ref={titleRef} style={{ textAlign: "center", padding: "clamp(16px,4vh,44px) 24px 0", flexShrink: 0, position: "relative", zIndex: 2 }}>
          <h1 style={{ ...disp, fontSize: "clamp(32px,4.4vw,64px)", lineHeight: 1, margin: 0, color: "var(--ink)" }}>COFFEE LAB</h1>
          <p style={{ ...over, fontSize: 10.5, color: "var(--ink-muted)", margin: "12px 0 0" }}>Create your coffee blend · Roasted to order</p>
        </div>
        <div ref={canvasHost} style={{ position: "absolute", inset: 0, opacity: ready ? 1 : 0, transition: "opacity 600ms var(--ease)" }} />
        <div ref={optsRef} className="bx-opts" style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "0 24px clamp(20px,4vh,40px)", zIndex: 3 }}>
          <div style={{ maxWidth: 880, margin: "0 auto" }}>
            <div style={{ ...over, fontSize: 10.5, color: "var(--ink-muted)", marginBottom: 12, textAlign: "center" }}><span style={{ color: "var(--brand)" }}>1</span> · What would you like?</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 10 }}>
              {options.map((m) => {
                const on = mode === m.id;
                return (
                  <button type="button" key={m.id} aria-pressed={on} className="opt-card bx-opt" onClick={() => onPick(m.id)} style={{ padding: 16, textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 8,
                    border: on ? "1.5px solid var(--brand)" : "1px solid var(--hairline)", borderRadius: "var(--r-md)", background: on ? "var(--brand-soft)" : "var(--surface)", fontFamily: "var(--font-sans)", boxShadow: "var(--shadow-sm)", transition: "all var(--dur) var(--ease)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className="opt-ico" style={{ width: 32, height: 32, borderRadius: "var(--r-md)", background: on ? "var(--surface)" : "var(--surface-sunken)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: on ? "var(--brand)" : "var(--roast-3)", flexShrink: 0 }}><Icon name={m.icon} size={17} stroke={2} /></span>
                      <span className="opt-title" style={{ ...disp, fontSize: 16, color: "var(--ink)", lineHeight: 1.05, flex: 1 }}>{m.title}</span>
                      <span style={{ color: on ? "var(--brand)" : "var(--ink-subtle)" }}><Icon name="arrow" size={15} stroke={2} /></span>
                    </div>
                    <div className="opt-desc bx-desc" style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--ink-muted)" }}>{m.desc}</div>
                    <div className="opt-meta" style={{ ...over, fontSize: 9.5, color: "var(--ink-subtle)", marginTop: 2 }}>{m.meta}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
