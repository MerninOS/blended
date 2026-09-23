// Retail hero — a turnable 3D Blended carton that holds in place while the
// two buying paths rise in beneath it, then releases into the steps below.

const BOX_PAPER = "#F0EDE5", BOX_INK = "#1A1A18", BOX_RED = "#D93D18";

const boxLoadImg = (src) => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });

function boxFace(w, h, draw) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d"); g.fillStyle = BOX_PAPER; g.fillRect(0, 0, w, h);
  // faint paper grain
  for (let i = 0; i < 2200; i++) { g.fillStyle = `rgba(26,26,24,${Math.random() * .035})`; g.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); }
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 8; t.encoding = THREE.sRGBEncoding; return t;
}
const boxText = (g, s, x, y, font, color, align = "center", track = 0) => {
  g.font = font; g.fillStyle = color; g.textAlign = align; g.textBaseline = "middle";
  if ("letterSpacing" in g) g.letterSpacing = track + "px";
  g.fillText(s, x, y);
};

async function buildBoxTextures(sub = "COFFEE LAB") {
  try { await document.fonts.load('800 100px "Energy Grotesk"'); } catch (e) {}
  const mark = await boxLoadImg("assets/blended-mark.png");
  const logo = '800 150px "Energy Grotesk", Archivo, sans-serif';
  const front = boxFace(1024, 1152, (g, w, h) => {
    if (mark) { const s = 330; g.save(); g.globalCompositeOperation = "multiply"; g.drawImage(mark, w / 2 - s / 2, 190, s, s); g.restore(); }
    boxText(g, "BLENDED", w / 2, 640, logo, BOX_INK, "center", -2);
    boxText(g, String(sub).toUpperCase().slice(0, 28), w / 2, 740, '600 34px "Martian Mono", monospace', BOX_RED, "center", 8);
    g.fillStyle = BOX_INK; g.fillRect(96, 960, w - 192, 2);
    boxText(g, "WHOLE BEAN · ROASTED TO ORDER", w / 2, 1010, '500 26px "Martian Mono", monospace', BOX_INK, "center", 4);
  });
  const back = boxFace(1024, 1152, (g, w, h) => {
    boxText(g, "YOUR COFFEE,", 96, 220, '800 72px "Energy Grotesk", Archivo, sans-serif', BOX_INK, "left");
    boxText(g, "YOUR RATIOS.", 96, 300, '800 72px "Energy Grotesk", Archivo, sans-serif', BOX_RED, "left");
    const rows = [["LOT", "________"], ["ROAST", "________"], ["RATIO", "________"], ["ROASTED", "__ / __ / __"]];
    rows.forEach(([k, v], i) => {
      const y = 480 + i * 96; g.fillStyle = "rgba(26,26,24,.25)"; g.fillRect(96, y + 34, w - 192, 2);
      boxText(g, k, 96, y, '600 30px "Martian Mono", monospace', BOX_INK, "left", 4);
      boxText(g, v, w - 96, y, '400 30px "Martian Mono", monospace', "rgba(26,26,24,.5)", "right");
    });
    boxText(g, "blended.coffee", w / 2, 1040, '500 28px "Martian Mono", monospace', BOX_INK, "center", 2);
  });
  const side = boxFace(448, 1152, (g, w, h) => {
    g.fillStyle = BOX_RED; g.fillRect(0, 0, w, h);
    g.save(); g.translate(w / 2, h / 2); g.rotate(-Math.PI / 2);
    boxText(g, "BLENDED", 0, 0, '800 150px "Energy Grotesk", Archivo, sans-serif', BOX_PAPER, "center", -2);
    g.restore();
  });
  const top = boxFace(1024, 448, (g, w, h) => {
    if (mark) { const s = 200; g.save(); g.globalCompositeOperation = "multiply"; g.drawImage(mark, w / 2 - s / 2, h / 2 - s / 2, s, s); g.restore(); }
  });
  const bottom = boxFace(1024, 448, () => {});
  return { front, back, side, top, bottom };
}

const BoxHero = ({ mode, onPick, options }) => {
  const heroRef = React.useRef(null), stageRef = React.useRef(null), canvasHost = React.useRef(null);
  const pRef = React.useRef(0), titleRef = React.useRef(null), optsRef = React.useRef(null);
  const [p, setP] = React.useState(0);
  const [ready, setReady] = React.useState(false);

  // scroll progress 0 → 1 across the pinned run
  React.useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0; const hero = heroRef.current, stage = stageRef.current; if (!hero || !stage) return;
      const run = hero.offsetHeight - stage.offsetHeight;
      const v = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / Math.max(1, run)));
      pRef.current = v; setP(v);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure(); addEventListener("scroll", on, { passive: true }); addEventListener("resize", on);
    return () => { removeEventListener("scroll", on); removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, []);

  // three.js scene
  React.useEffect(() => {
    if (!window.THREE) return;
    const host = canvasHost.current; let dead = false, raf = 0, visible = true;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, devicePixelRatio)); renderer.outputEncoding = THREE.sRGBEncoding;
    
    host.appendChild(renderer.domElement); renderer.domElement.style.cssText = "display:block;width:100%;height:100%;touch-action:pan-y;cursor:grab";
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(30, 1, .1, 100); const CAM_Z = 8; cam.position.set(0, .5, CAM_Z); cam.lookAt(0, 0, 0);
    scene.add(new THREE.HemisphereLight(0xfffaf2, 0xd8d0c2, .75));
    const key = new THREE.DirectionalLight(0xffffff, .9); key.position.set(3, 6, 4); scene.add(key);
    const fill = new THREE.DirectionalLight(0xfff1e6, .35); fill.position.set(-4, 2, 3); scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, .45); rim.position.set(-2, 3, -5); scene.add(rim);
    const sc2 = document.createElement("canvas"); sc2.width = sc2.height = 256;
    const sg = sc2.getContext("2d"), grad = sg.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, "rgba(26,26,24,.34)"); grad.addColorStop(.45, "rgba(26,26,24,.14)"); grad.addColorStop(1, "rgba(26,26,24,0)");
    sg.fillStyle = grad; sg.fillRect(0, 0, 256, 256);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc2), transparent: true, depthWrite: false }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = .002;

    const W = 1.6, H = 1.8, D = .7;
    const rig = new THREE.Group(); scene.add(rig); rig.add(ground);
    const mat = (map) => new THREE.MeshStandardMaterial({ map, roughness: .82, metalness: 0 });
    const plain = new THREE.MeshStandardMaterial({ color: BOX_PAPER, roughness: .85 });
    const box = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), [plain, plain, plain, plain, plain, plain]);
    box.position.y = H / 2; rig.add(box);
    buildBoxTextures().then(t => {
      if (dead) return;
      box.material = [mat(t.side), mat(t.side), mat(t.top), mat(t.bottom), mat(t.front), mat(t.back)];
      setReady(true);
    });

    // drag to turn, with inertia; idles into a slow spin
    let rotY = -.45, vel = 0, dragging = false, lastX = 0, idleAt = 0;
    const el = renderer.domElement;
    const down = (e) => { dragging = true; lastX = e.clientX; vel = 0; el.setPointerCapture(e.pointerId); el.style.cursor = "grabbing"; };
    const move = (e) => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; vel = dx * .01; rotY += vel; };
    const up = () => { dragging = false; idleAt = performance.now(); el.style.cursor = "grab"; };
    el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);

    const size = () => { const r = host.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); cam.aspect = r.width / Math.max(1, r.height); cam.updateProjectionMatrix(); };
    const ro = new ResizeObserver(size); ro.observe(host); size();
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(tick); }); io.observe(host);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let sm = 0;
    function tick(now) {
      raf = 0; if (dead || !visible) return;
      if (!dragging) { vel *= .94; rotY += vel; if (!reduce && Math.abs(vel) < .002 && now - idleAt > 1400) { const target = -0.45 + Math.sin(now * .00018) * .3; rotY += (target - rotY) * .006; } }
      sm += (pRef.current - sm) * .08;
      const e0 = Math.min(1, sm / .8), e = e0 * e0 * (3 - 2 * e0);
      // fit the carton into the gap between the title and the options (or the scroll cue)
      const vh = host.clientHeight || 1, vw = host.clientWidth || 1;
      const tb = titleRef.current ? titleRef.current.offsetTop + titleRef.current.offsetHeight + 16 : 80;
      const ob = optsRef.current ? optsRef.current.offsetTop - 20 : vh - 90;
      const top = tb, bot = ob;
      const band = Math.max(40, bot - top);
      const wpp = 2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) / vh;
      const sc = Math.max(.05, Math.min(band * .84 * wpp / H, vw * .7 * wpp / Math.hypot(W, D)));
      const yc = (top + bot) / 2;
      rig.rotation.y = rotY; rig.scale.setScalar(sc);
      rig.position.y = (vh / 2 - yc) * wpp - sc * H / 2;
      renderer.render(scene, cam); raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => { dead = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); renderer.dispose(); host.innerHTML = ""; };
  }, []);

  const reveal = Math.min(1, Math.max(0, (p - .3) / .4));
  const introFade = 1 - Math.min(1, p / .25);

  return (
    <section ref={heroRef} className="bx-hero" data-screen-label="Retail hero" style={{position:"relative",background:"var(--surface-sunken)"}}>
      <div ref={stageRef} className="bx-stage" style={{position:"relative",height:"calc(100vh - var(--topbar-h))",minHeight:520,overflow:"hidden",display:"flex",flexDirection:"column"}}>
        <div ref={titleRef} style={{textAlign:"center",padding:"clamp(16px,4vh,44px) 24px 0",flexShrink:0,position:"relative",zIndex:2}}>
          <h1 style={{...disp,fontSize:"clamp(32px,4.4vw,64px)",lineHeight:1,margin:0,color:"var(--ink)"}}>COFFEE LAB</h1>
          <p style={{...over,fontSize:10.5,color:"var(--ink-muted)",margin:"12px 0 0"}}>Create your coffee blend · Roasted to order</p>
        </div>
        <div ref={canvasHost} style={{position:"absolute",inset:0,opacity:ready?1:0,transition:"opacity 600ms var(--ease)"}}/>
        <div ref={optsRef} className="bx-opts" style={{position:"absolute",left:0,right:0,bottom:0,padding:"0 24px clamp(20px,4vh,40px)",zIndex:3,
          }}>
          <div style={{maxWidth:880,margin:"0 auto"}}>
            <div style={{...over,fontSize:10.5,color:"var(--ink-muted)",marginBottom:12,textAlign:"center"}}><span style={{color:"var(--brand)"}}>1</span> · What would you like?</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:10}}>
              {options.map(m => {
                const on = mode === m.id;
                return (
                  <button key={m.id} className="opt-card bx-opt" onClick={() => onPick(m.id)} style={{padding:16,textAlign:"left",cursor:"pointer",display:"flex",flexDirection:"column",gap:8,
                    border:on?"1.5px solid var(--brand)":"1px solid var(--hairline)",borderRadius:"var(--r-md)",background:on?"var(--brand-soft)":"var(--surface)",fontFamily:"var(--font-sans)",boxShadow:"var(--shadow-sm)",transition:"all var(--dur) var(--ease)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span className="opt-ico" style={{width:32,height:32,borderRadius:"var(--r-md)",background:on?"var(--surface)":"var(--surface-sunken)",display:"inline-flex",alignItems:"center",justifyContent:"center",color:on?"var(--brand)":"var(--roast-3)",flexShrink:0}}><I name={m.icon} size={17} stroke={2}/></span>
                      <span className="opt-title" style={{...disp,fontSize:16,color:"var(--ink)",lineHeight:1.05,flex:1}}>{m.title}</span>
                      <span style={{color:on?"var(--brand)":"var(--ink-subtle)"}}><I name="arrow" size={15} stroke={2}/></span>
                    </div>
                    <div className="opt-desc bx-desc" style={{fontSize:12.5,lineHeight:1.5,color:"var(--ink-muted)"}}>{m.desc}</div>
                    <div className="opt-meta" style={{...over,fontSize:9.5,color:"var(--ink-subtle)",marginTop:2}}>{m.meta}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
const reduceMotionOK = () => !matchMedia("(prefers-reduced-motion: reduce)").matches;

Object.assign(window, { BoxHero, buildBoxTextures });
