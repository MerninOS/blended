import { ImageResponse } from "next/og";

// Default share preview (product pages use the coffee's photo instead).
export const alt = "Blended · build your own coffee blend";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#F6F1EA", color: "#241812", fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 2 }}>BLENDED</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 88, fontWeight: 800, lineHeight: 1, textTransform: "uppercase", letterSpacing: -2 }}>Build your own blend</div>
          <div style={{ fontSize: 34, color: "#6B5A4E" }}>Single-origin green lots · your ratios · roasted to order</div>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {["#E4C9A8", "#B98253", "#8A5530", "#5C361D", "#3A2112"].map((c) => <div key={c} style={{ width: 90, height: 18, borderRadius: 9, background: c }} />)}
        </div>
      </div>
    ),
    size,
  );
}
