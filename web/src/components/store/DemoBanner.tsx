// Shown only while no Shopify store is connected.
export function DemoBanner() {
  return (
    <div role="note" style={{ background: "var(--ink)", color: "var(--on-ink)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", textAlign: "center", padding: "7px 16px" }}>
      Demo mode · sample catalog · connect a Shopify store to take orders
    </div>
  );
}
