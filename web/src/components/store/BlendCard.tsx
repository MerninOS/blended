"use client";
// Checkout preview for custom blends: the turnable bag wearing the customer's
// own bag label, beside that label full size (BlendCard.jsx). The label is the
// one the roaster prints (lib/bag-label.ts), 3.25 × 1.5 in.
import { useEffect, useRef } from "react";
import type { Notes, SelItem } from "@/lib/domain/types";
import { blendLabel } from "@/lib/bag-label";
import { LabelArt } from "@/components/label/BagLabel";
import { useCatalog } from "./catalog-context";
import { mountBox, type BagCard, type BoxHandle } from "./box3d";

/** What the bag's printed card shows for a blend: its label. */
export const bcCardData = blendLabel;

/** The bag, reprinted (debounced) whenever the blend changes. */
export function BoxViewer({ card }: { card?: BagCard }) {
  const host = useRef<HTMLDivElement>(null), handle = useRef<BoxHandle | null>(null), first = useRef(card);
  useEffect(() => {
    const el = host.current; if (!el) return;
    let cancelled = false;
    void mountBox(el, { cam: [0, .9, 5.6], look: [0, .82, 0], baseRot: -.5, card: first.current })
      .then((h) => { if (cancelled) h.dispose(); else handle.current = h; });
    return () => { cancelled = true; handle.current?.dispose(); handle.current = null; };
  }, []);
  const key = JSON.stringify(card ?? null);
  useEffect(() => {
    if (!card) return;
    const t = setTimeout(() => handle.current?.setCard(card), 200);
    return () => clearTimeout(t);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps -- keyed on the card's content
  return <div ref={host} style={{ width: "100%", height: "100%" }} />;
}

export function BlendCard({ sel, vals, name, sizeLabel, roast }: { sel: SelItem[]; vals: Notes; name: string; sizeLabel: string; roast: number | null }) {
  const { idx } = useCatalog();
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, height: "100%", minWidth: 0 }}>
      <div style={{ border: "1px solid rgba(26,26,24,.08)", borderRadius: 3, overflow: "hidden", boxShadow: "0 1px 0 rgba(26,26,24,.04), 0 10px 24px -12px rgba(26,26,24,.28)" }}>
        <LabelArt d={blendLabel({ sel, vals, name, sizeLabel, roast, idx })} />
      </div>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-subtle)" }}>Bag label · 3.25 × 1.5 in</span>
    </div>
  );
}
