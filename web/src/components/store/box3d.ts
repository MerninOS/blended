"use client";
// The BLENDED coffee bag, drawn in the browser with three.js (BoxHero.jsx):
// a frosted flat-bottom pouch with the blend card clipped to the front. The
// card is painted from the blend (components, ratios, cup radar, roast, size),
// so the checkout preview shows the customer's own blend on the bag.
// Loaded lazily so three stays out of the main bundle.
import type * as THREE_NS from "three";

type Three = typeof THREE_NS;
export const BOX_PAPER = "#F0EDE5", BOX_INK = "#1A1A18", BOX_RED = "#D93D18";
export const BOX_W = 1.6, BOX_H = 1.8, BOX_D = .7;

/** What the card on the front of the bag shows. Radar points are unit offsets from the centre. */
export interface BagCard {
  name: string;
  parts: { name: string; origin: string; pct: number; color: string }[];
  radar: [number, number][];
  words: string[];
  roast: number | null;
  roastName: string | null;
  roastColor: string;
  size: string;
}

export const BAG_CARD_DEFAULT: BagCard = {
  name: "Custom blend",
  parts: [{ name: "Mexico Veracruz", origin: "Mexico", pct: 50, color: "#EE8A1E" }, { name: "Strawberry Jam Co-ferment", origin: "Colombia", pct: 50, color: "#C43C7C" }],
  radar: [[.35, -.49], [.27, -.09], [.31, .1], [.21, .28], [0, .45], [-.33, .45], [-.17, .05], [-.15, -.05], [-.17, -.23], [0, -.37]],
  words: ["Brown sugar", "Berry", "Ferment"], roast: 3, roastName: "Medium", roastColor: "#C9404A", size: "1 lb",
};

const loadImg = (src: string) => new Promise<HTMLImageElement | null>((r) => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
const cssFont = (v: string, fallback: string) => {
  const f = getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  return f ? `${f}, ${fallback}` : fallback;
};
const text = (g: CanvasRenderingContext2D, s: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = "center", track = 0) => {
  g.font = font; g.fillStyle = color; g.textAlign = align; g.textBaseline = "middle";
  if ("letterSpacing" in g) (g as unknown as { letterSpacing: string }).letterSpacing = track + "px";
  g.fillText(s, x, y);
};

let fontsReady: Promise<{ logo: string; mono: string; mark: HTMLImageElement | null }> | null = null;
function assets() {
  fontsReady ??= (async () => {
    const logo = cssFont("--nf-energy", '"Archivo", sans-serif');
    const mono = cssFont("--nf-martian", "monospace");
    try { await Promise.all([document.fonts.load(`800 100px ${logo}`), document.fonts.load(`500 30px ${mono}`), document.fonts.load(`600 13px ${mono}`)]); } catch { /* fall back */ }
    return { logo, mono, mark: await loadImg("/brand/blended-mark.png") };
  })();
  return fontsReady;
}

// ---- bag shape: pillowed front, gusseted bottom, tapering to the seal ----
const sm = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const bagDepth = (t: number) => 1 - .94 * sm(.52, .9, t);
const bagBulge = (x: number, t: number) => { const u = x / (BOX_W / 2); return .05 * (1 - u * u) * Math.sin(Math.PI * Math.min(1, t / .92)) * (1 - sm(.72, .9, t)); };
const bagSurfZ = (x: number, t: number) => (BOX_D / 2) * bagDepth(t) * (1 - .32 * Math.pow(Math.min(1, Math.abs(x / (BOX_W / 2))), 10)) + bagBulge(x, t);
function bagDeform(geo: THREE_NS.BufferGeometry) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), t = y / BOX_H, u = x / (BOX_W / 2), zn = z / (BOX_D / 2);
    const nz = zn * (BOX_D / 2) * bagDepth(t) * (1 - .32 * Math.pow(Math.min(1, Math.abs(u)), 10)) + zn * bagBulge(x, t);
    p.setXYZ(i, x * (1 - .025 * t), y, nz);
  }
  geo.computeVertexNormals(); return geo;
}

/** Frosted film: heat seal at the top, tear notch + zip on the front. */
function filmCanvas(w: number, h: number, kind: "front" | "back" | "side", mono: string) {
  const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d")!;
  g.fillStyle = kind === "side" ? "#D0C6BB" : "#D9CFC4"; g.fillRect(0, 0, w, h);
  const seal = h * .1; g.fillStyle = "rgba(244,243,240,.88)"; g.fillRect(0, 0, w, seal);
  g.fillStyle = "rgba(255,255,255,.4)"; for (let x = 0; x < w; x += 7) g.fillRect(x, 0, 2, seal);
  g.fillStyle = "rgba(244,243,240,.8)"; g.fillRect(0, h - h * .025, w, h * .025);
  if (kind === "front") {
    const zy = h * .2;
    g.fillStyle = "rgba(250,250,248,.95)"; g.fillRect(0, zy - 16, w, 32);
    g.fillStyle = "#A3232B"; for (let x = 150; x < w - 30; x += 38) { g.beginPath(); g.arc(x, zy, 3.5, 0, 7); g.fill(); }
    g.beginPath(); g.arc(40, zy, 12, 0, 7); g.fill();
    text(g, "PULL TAB TO OPEN ▸", 60, zy, `600 13px ${mono}`, "#A3232B", "left", 1);
    g.strokeStyle = "#A3232B"; g.lineWidth = 2.5; g.beginPath();
    for (let x = 0; x <= w; x += 6) g.lineTo(x, zy + 42 + (x / 6 % 2 ? 2.5 : -2.5)); g.stroke();
    g.fillStyle = "rgba(250,250,248,.5)"; g.fillRect(0, zy + 52, w, 8);
  } else { g.fillStyle = "rgba(250,250,248,.7)"; g.fillRect(0, h * .2 - 12, w, 24); }
  const eg = g.createLinearGradient(0, 0, w, 0), ew = Math.min(.08, 36 / w);
  eg.addColorStop(0, "rgba(250,250,248,.85)"); eg.addColorStop(ew, "rgba(250,250,248,0)"); eg.addColorStop(1 - ew, "rgba(250,250,248,0)"); eg.addColorStop(1, "rgba(250,250,248,.85)");
  g.fillStyle = eg; g.fillRect(0, 0, w, h);
  return c;
}

/** The blend card clipped to the bag: wordmark, blend name, components, radar, roast, size. */
async function paintCard(d: BagCard) {
  const { logo, mono: monoFam, mark } = await assets();
  const w = 1762, h = 824, c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d")!;
  g.fillStyle = BOX_PAPER; g.fillRect(0, 0, w, h);
  const mono = (wt: number, px: number) => `${wt} ${px}px ${monoFam}`;
  let fs = 150; g.font = `800 ${fs}px ${logo}`; while (g.measureText("BLENDED").width > 1380 && fs > 40) { fs -= 2; g.font = `800 ${fs}px ${logo}`; }
  text(g, "BLENDED", 44, 104, g.font, BOX_INK, "left", -2);
  text(g, String(d.name || "Custom blend").toUpperCase().slice(0, 40), 48, 212, mono(500, 42), BOX_RED, "left", 6);
  if (mark) { g.save(); g.globalCompositeOperation = "multiply"; g.drawImage(mark, 1540, 40, 176, 176 * mark.height / mark.width); g.restore(); }
  const n = Math.max(1, d.parts.length), rh = Math.min(128, 380 / n), y0 = 470 - (rh * n) / 2;
  d.parts.forEach((p, i) => {
    const y = y0 + i * rh; g.fillStyle = p.color; g.beginPath();
    if (g.roundRect) g.roundRect(47, y + 2, 132, rh - 10, 4); else g.rect(47, y + 2, 132, rh - 10);
    g.fill();
    const big = Math.min(46, rh * .38);
    let nm = String(p.name).toUpperCase(); g.font = mono(500, big); if ("letterSpacing" in g) (g as unknown as { letterSpacing: string }).letterSpacing = "7px";
    while (g.measureText(nm).width > 760 && nm.length > 4) nm = nm.slice(0, -2).trim() + "…";
    text(g, nm, 222, y + rh * .3, mono(500, big), BOX_INK, "left", 7);
    text(g, String(p.origin || "").toUpperCase(), 222, y + rh * .72, mono(400, Math.min(28, rh * .24)), "rgba(26,26,24,.62)", "left", 3);
    text(g, p.pct + "%", 1110, y + rh * .3, mono(500, big), BOX_INK, "right", 3);
  });
  const cx = 1450, cy = 452, R = 210;
  g.strokeStyle = "rgba(26,26,24,.18)"; g.lineWidth = 2;
  [1, .727, .453].forEach((k) => { g.beginPath(); g.arc(cx, cy, R * k, 0, 7); g.stroke(); });
  const pts = d.radar.map(([x, y]) => [cx + x * R, cy + y * R] as const);
  pts.forEach(([x, y]) => { const a = Math.atan2(y - cy, x - cx); g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); g.stroke(); });
  if (pts.length > 2) {
    g.beginPath(); const N = pts.length;
    for (let i = 0; i < N; i++) {
      const p0 = pts[(i - 1 + N) % N], p1 = pts[i], p2 = pts[(i + 1) % N], p3 = pts[(i + 2) % N];
      if (i === 0) g.moveTo(p1[0], p1[1]);
      g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
    }
    g.closePath(); g.fillStyle = "rgba(196,60,124,.32)"; g.fill(); g.strokeStyle = "#C43C7C"; g.lineWidth = 5; g.lineJoin = "round"; g.stroke();
    g.fillStyle = "#C43C7C"; pts.forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 6.5, 0, 7); g.fill(); });
  }
  text(g, d.words.map((s) => s.toUpperCase()).join("  /  "), 48, 768, mono(500, 38), BOX_INK, "left", 6);
  if (d.roastName) {
    const label = (d.roastName + " roast").toUpperCase(); g.font = mono(500, 36); if ("letterSpacing" in g) (g as unknown as { letterSpacing: string }).letterSpacing = "6px";
    const tw = g.measureText(label).width; text(g, label, 1714, 712, mono(500, 36), BOX_INK, "right", 6);
    for (let i = 0; i < 5; i++) { g.fillStyle = i < Math.round(d.roast || 0) ? d.roastColor : "rgba(26,26,24,.16)"; g.fillRect(1714 - tw - 28 - (5 - i) * 30, 703, 26, 17); }
  }
  text(g, (d.size + " · Whole bean").toUpperCase(), 1714, 768, mono(500, 36), BOX_INK, "right", 6);
  return c;
}

export interface BoxScene {
  three: Three;
  camera: THREE_NS.PerspectiveCamera;
  rig: THREE_NS.Group;
  host: HTMLElement;
}
export interface BoxHandle { dispose: () => void; setCard: (card: BagCard) => void }

/**
 * Mount a turnable bag into `host`. Drag to turn (with inertia); when left
 * alone it sways ~17° either way on a slow cycle instead of spinning.
 * `layout` runs every frame to position/scale the rig.
 */
export async function mountBox(host: HTMLElement, opts: {
  cam: [number, number, number]; look: [number, number, number]; baseRot: number;
  card?: BagCard; layout?: (s: BoxScene) => void; onReady?: () => void;
}): Promise<BoxHandle> {
  const THREE = await import("three");
  let dead = false, raf = 0, visible = true;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .82;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
  host.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%;touch-action:pan-y;cursor:grab";
  renderer.domElement.setAttribute("aria-hidden", "true");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 100);
  camera.position.set(...opts.cam); camera.lookAt(...opts.look);
  // physically-based light units: the design's legacy intensities × π
  scene.add(new THREE.HemisphereLight(0xfff8f0, 0x6e6054, .5 * Math.PI));
  const key = new THREE.DirectionalLight(0xfff6ec, 1.35 * Math.PI); key.position.set(3.5, 6, 3); key.castShadow = true;
  key.shadow.mapSize.set(512, 512); key.shadow.radius = 12; key.shadow.blurSamples = 16; key.shadow.bias = -.0004; key.shadow.normalBias = .02;
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: .5, far: 20 }); scene.add(key);
  const fill = new THREE.DirectionalLight(0xf3efe9, .35 * Math.PI); fill.position.set(-4, 2, 4); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, .5 * Math.PI); rim.position.set(-2.5, 4, -5); scene.add(rim);

  const disposables: { dispose: () => void }[] = [];
  const own = <T extends { dispose: () => void }>(x: T) => { disposables.push(x); return x; };
  const tex = (c: HTMLCanvasElement) => { const t = own(new THREE.CanvasTexture(c)); t.anisotropy = 8; t.colorSpace = THREE.SRGBColorSpace; return t; };

  // soft contact shadow under the bag
  const sc = document.createElement("canvas"); sc.width = sc.height = 256;
  const sg = sc.getContext("2d")!, gr = sg.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, "rgba(26,26,24,.34)"); gr.addColorStop(.45, "rgba(26,26,24,.14)"); gr.addColorStop(1, "rgba(26,26,24,0)");
  sg.fillStyle = gr; sg.fillRect(0, 0, 256, 256);
  const ground = new THREE.Mesh(own(new THREE.PlaneGeometry(3.2, 3.2)), own(new THREE.MeshBasicMaterial({ map: tex(sc), transparent: true, depthWrite: false })));
  ground.rotation.x = -Math.PI / 2; ground.position.y = .002;
  const rig = new THREE.Group(); scene.add(rig); rig.add(ground);

  // the bag
  const { mono } = await assets();
  if (dead) return { dispose: () => {}, setCard: () => {} };
  const shellGeo = own(bagDeform(new THREE.BoxGeometry(BOX_W, BOX_H, BOX_D, 24, 48, 12).translate(0, BOX_H / 2, 0)));
  const film = (c: HTMLCanvasElement) => own(new THREE.MeshPhysicalMaterial({ map: tex(c), color: 0xffffff, metalness: 0, clearcoat: 0, roughness: .95, sheen: .15, sheenRoughness: .9, sheenColor: new THREE.Color(0xffffff) }));
  const side = film(filmCanvas(448, 1152, "side", mono)), plain = film(filmCanvas(256, 256, "back", mono));
  const outer = new THREE.Mesh(shellGeo, [side, side, plain, plain, film(filmCanvas(1024, 1152, "front", mono)), film(filmCanvas(1024, 1152, "back", mono))]);
  outer.castShadow = true; outer.receiveShadow = true;

  // blend card, curved to sit on the pillowed front panel
  const cw = 1.34, ch = cw * 824 / 1762, cyc = BOX_H * .4;
  const cg = own(new THREE.PlaneGeometry(cw, ch, 24, 8)), cp = cg.attributes.position;
  for (let i = 0; i < cp.count; i++) { const x = cp.getX(i), y = cp.getY(i) + cyc; cp.setXYZ(i, x * (1 - .025 * y / BOX_H), y, bagSurfZ(x, y / BOX_H) + .006); }
  cg.computeVertexNormals();
  const cardMat = own(new THREE.MeshPhysicalMaterial({ color: BOX_PAPER, roughness: .75, clearcoat: 0 }));
  const cardFront = new THREE.Mesh(cg, cardMat); cardFront.receiveShadow = true;
  const cardBack = new THREE.Mesh(cg, own(new THREE.MeshStandardMaterial({ color: 0xE4E0D6, roughness: .8, side: THREE.BackSide })));
  const catcher = new THREE.Mesh(own(new THREE.PlaneGeometry(10, 10)), own(new THREE.ShadowMaterial({ opacity: .28 })));
  catcher.rotation.x = -Math.PI / 2; catcher.position.y = .001; catcher.receiveShadow = true;
  rig.add(catcher, cardFront, cardBack, outer);

  let cardTex: THREE_NS.CanvasTexture | null = null, cardSeq = 0;
  const setCard = (d: BagCard) => {
    const seq = ++cardSeq;
    return paintCard(d).then((c) => {
      if (dead || seq !== cardSeq) return;
      const t = new THREE.CanvasTexture(c); t.anisotropy = 8; t.colorSpace = THREE.SRGBColorSpace;
      cardTex?.dispose(); cardTex = t;
      cardMat.map = t; cardMat.color.set(0xffffff); cardMat.needsUpdate = true;
    });
  };
  setCard(opts.card ?? BAG_CARD_DEFAULT).then(() => { if (!dead) opts.onReady?.(); });

  let rotY = opts.baseRot, vel = 0, dragging = false, lastX = 0, idleAt = 0;
  const el = renderer.domElement;
  const down = (e: PointerEvent) => { dragging = true; lastX = e.clientX; vel = 0; el.setPointerCapture(e.pointerId); el.style.cursor = "grabbing"; };
  const move = (e: PointerEvent) => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; vel = dx * .01; rotY += vel; };
  const up = () => { dragging = false; idleAt = performance.now(); el.style.cursor = "grab"; };
  el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move);
  el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);

  const size = () => { const r = host.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); camera.aspect = r.width / Math.max(1, r.height); camera.updateProjectionMatrix(); };
  const ro = new ResizeObserver(size); ro.observe(host); size();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx: BoxScene = { three: THREE, camera, rig, host };
  function tick(now: number) {
    raf = 0; if (dead || !visible) return;
    if (!dragging) {
      vel *= .94; rotY += vel;
      if (!reduce && Math.abs(vel) < .002 && now - idleAt > 1400) { const target = opts.baseRot + Math.sin(now * .00018) * .3; rotY += (target - rotY) * .006; }
    }
    rig.rotation.y = rotY;
    opts.layout?.(ctx);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(tick); });
  io.observe(host);
  raf = requestAnimationFrame(tick);

  return {
    setCard: (d) => { void setCard(d); },
    dispose: () => {
      dead = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up);
      cardTex?.dispose(); disposables.forEach((d) => d.dispose()); renderer.dispose();
      if (el.parentNode === host) host.removeChild(el);
    },
  };
}
