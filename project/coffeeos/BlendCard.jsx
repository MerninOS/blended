// Checkout preview for custom blends: a small turnable carton printed with the
// blend name, beside the blend card (components, ratios, cup radar, size).

const BC_COLORS = ["#EE8A1E", "#C43C7C", "#D93D18", "#8E2F52"];
const bcLogo = { fontFamily: '"Energy Grotesk", Archivo, sans-serif', fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1, color: "#1A1A18" };
const bcTrack = { fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: ".14em", color: "#1A1A18" };

const BoxViewer = ({ label }) => {
  const host = React.useRef(null),boxRef = React.useRef(null);
  React.useEffect(() => {
    if (!window.THREE) return;
    const el0 = host.current;let dead = false,raf = 0,visible = true;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, devicePixelRatio));renderer.outputEncoding = THREE.sRGBEncoding;
    el0.appendChild(renderer.domElement);renderer.domElement.style.cssText = "display:block;width:100%;height:100%;touch-action:pan-y;cursor:grab";
    const scene = new THREE.Scene(),cam = new THREE.PerspectiveCamera(30, 1, .1, 100);
    cam.position.set(0, .9, 5.6);cam.lookAt(0, .82, 0);
    scene.add(new THREE.HemisphereLight(0xfffaf2, 0xd8d0c2, .75));
    const key = new THREE.DirectionalLight(0xffffff, .9);key.position.set(3, 6, 4);scene.add(key);
    const fill = new THREE.DirectionalLight(0xfff1e6, .35);fill.position.set(-4, 2, 3);scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, .45);rim.position.set(-2, 3, -5);scene.add(rim);
    const W = 1.6,H = 1.8,D = .7,rig = new THREE.Group();scene.add(rig);
    const sc = document.createElement("canvas");sc.width = sc.height = 256;
    const sg = sc.getContext("2d"),gr = sg.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, "rgba(26,26,24,.32)");gr.addColorStop(.45, "rgba(26,26,24,.12)");gr.addColorStop(1, "rgba(26,26,24,0)");
    sg.fillStyle = gr;sg.fillRect(0, 0, 256, 256);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
    ground.rotation.x = -Math.PI / 2;ground.position.y = .002;rig.add(ground);
    const plain = new THREE.MeshStandardMaterial({ color: BOX_PAPER, roughness: .85 });
    const box = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), Array(6).fill(plain));
    box.position.y = H / 2;rig.add(box);boxRef.current = box;
    let rotY = -.5,vel = 0,dragging = false,lastX = 0,idleAt = 0;
    const el = renderer.domElement;
    el.addEventListener("pointerdown", (e) => {dragging = true;lastX = e.clientX;vel = 0;el.setPointerCapture(e.pointerId);});
    el.addEventListener("pointermove", (e) => {if (!dragging) return;vel = (e.clientX - lastX) * .01;lastX = e.clientX;rotY += vel;});
    const up = () => {dragging = false;idleAt = performance.now();};
    el.addEventListener("pointerup", up);el.addEventListener("pointercancel", up);
    const size = () => {const r = el0.getBoundingClientRect();renderer.setSize(r.width, r.height, false);cam.aspect = r.width / Math.max(1, r.height);cam.updateProjectionMatrix();};
    const ro = new ResizeObserver(size);ro.observe(el0);size();
    const io = new IntersectionObserver(([en]) => {visible = en.isIntersecting;if (visible && !raf) raf = requestAnimationFrame(tick);});io.observe(el0);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    function tick(now) {
      raf = 0;if (dead || !visible) return;
      if (!dragging) {vel *= .94;rotY += vel;if (!reduce && Math.abs(vel) < .002 && now - idleAt > 1400) {const target = -0.5 + Math.sin(now * .00018) * .3;rotY += (target - rotY) * .006;}}
      rig.rotation.y = rotY;renderer.render(scene, cam);raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => {dead = true;cancelAnimationFrame(raf);ro.disconnect();io.disconnect();renderer.dispose();el0.innerHTML = "";};
  }, []);
  React.useEffect(() => {
    let off = false;
    const t = setTimeout(() => buildBoxTextures().then((t) => {
      const box = boxRef.current;if (off || !box) return;
      const m = (map) => new THREE.MeshStandardMaterial({ map, roughness: .82 });
      box.material = [m(t.side), m(t.side), m(t.top), m(t.bottom), m(t.front), m(t.back)];
    }), 250);
    return () => {off = true;clearTimeout(t);};
  }, []);
  return <div ref={host} style={{ width: "100%", height: "100%" }} />;
};

const BlendCard = ({ sel, vals, name, sizeLabel, roast }) => {
  const parts = sel.map((x, i) => {
    const g = PL_GREEN.find((c) => c.id === x.id) || {};
    return { id: x.id, pct: x.pct, name: g.name || x.id, origin: g.origin || "", place: (g.origin || g.name || "").split(/\s*[·,—–-]\s*|\s{2,}/)[0].split(" ").slice(0, /^(Costa|El|Papua|New)$/.test((g.origin || "").split(" ")[0]) ? 2 : 1).join(" "), color: BC_COLORS[i % BC_COLORS.length] };
  });
  const g = plGeom(vals);
  const words = PL_AX.map((a) => ({ l: a.l, v: vals[a.k] || 0 })).sort((a, b) => b.v - a.v).slice(0, 3).map((a) => a.l);
  const r = (p) => 26 + Math.sqrt(Math.max(4, p) / 100) * 38;
  return (
    <div data-om-raster style={{ background: "#F0EDE5", border: "1px solid rgba(26,26,24,.08)", borderRadius: "var(--r-sm)", boxShadow: "0 1px 0 rgba(26,26,24,.04), 0 10px 24px -12px rgba(26,26,24,.28)", padding: "clamp(16px,2.2vw,24px)", display: "flex", flexDirection: "column", gap: "clamp(12px,1.6vw,18px)", minWidth: 0, height: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ ...bcLogo, fontSize: "clamp(24px,2.6vw,34px)", textTransform: "uppercase", overflowWrap: "anywhere", textWrap: "balance" }}>{name || "House blend"}</div>
          <div style={{ ...bcTrack, fontSize: 11, marginTop: 8, color: "#D93D18" }}>Custom Blend</div>
        </div>
        <img src="assets/blended-mark.png" alt="" style={{ width: "clamp(44px,4.6vw,60px)", height: "auto", mixBlendMode: "multiply", flexShrink: 0 }} data-comment-anchor="a86337f01d-img-77-9" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,3fr) minmax(160px,2fr)", gap: "clamp(16px,2.4vw,28px)", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(14px,2vw,24px)", minWidth: 0 }}>
          <div style={{ width: "clamp(40px,5vw,60px)", alignSelf: "stretch", minHeight: 90, display: "flex", flexDirection: "column", gap: 3, flexShrink: 0 }}>
            {parts.map((p) => <span key={p.id} style={{ flex: `${Math.max(4, p.pct)} 1 0`, background: p.color, borderRadius: 2 }} />)}
          </div>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {parts.map((p) =>
            <div key={p.id} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                <span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                  <span style={{ ...bcTrack, fontSize: "clamp(12px,1.3vw,15px)", lineHeight: 1.3, textWrap: "balance" }}>{p.name}</span>
                  <span style={{ ...bcTrack, fontSize: 9.5, letterSpacing: ".1em", color: "rgba(26,26,24,.62)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.origin}</span>
                </span>
                <span style={{ ...bcTrack, letterSpacing: ".06em", fontSize: "clamp(12px,1.3vw,15px)", lineHeight: 1.3, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{p.pct}%</span>
              </div>
            )}
          </div>
        </div>
        <div style={{ position: "relative", width: "100%", maxWidth: 220, margin: "0 auto", aspectRatio: "1 / 1" }}>
          <svg viewBox="84 84 312 312" style={{ position: "absolute", inset: "2%", width: "96%", height: "96%", overflow: "visible" }}>
            {[150, 109, 68].map((v) => <circle key={v} cx="240" cy="240" r={v} fill="none" stroke="rgba(26,26,24,.18)" strokeWidth="1.5" />)}
            {g.axes.map((a, i) => <line key={i} x1="240" y1="240" x2={a.sx.toFixed(1)} y2={a.sy.toFixed(1)} stroke="rgba(26,26,24,.18)" strokeWidth="1.5" />)}
            <path d={g.p1} fill="rgba(196,60,124,.32)" stroke="#C43C7C" strokeWidth="4" strokeLinejoin="round" />
            {g.axes.map((a, i) => <circle key={i} cx={a.dx.toFixed(1)} cy={a.dy.toFixed(1)} r="4.5" fill="#C43C7C" />)}
          </svg>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <span style={{ ...bcTrack, fontSize: "clamp(11px,1.2vw,14px)" }}>{words.join("  /  ")}</span>
        <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          {roast != null && <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "flex", gap: 2 }}>{[1, 2, 3, 4, 5].map((n) => <span key={n} style={{ width: 10, height: 6, borderRadius: 1, background: n <= Math.round(roast) ? plRampColor(roast) : "rgba(26,26,24,.14)" }} />)}</span>
            <span style={{ ...bcTrack, fontSize: "clamp(11px,1.2vw,14px)" }}>{plRoastName(roast)} roast</span>
          </span>}
          <span style={{ ...bcTrack, fontSize: "clamp(11px,1.2vw,14px)", textAlign: "right", lineHeight: 1.6 }}>{sizeLabel} · Whole bean</span>
        </span>
      </div>
    </div>);

};

Object.assign(window, { BoxViewer, BlendCard });