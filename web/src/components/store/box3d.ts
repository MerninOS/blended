"use client";
// The BLENDED carton, drawn in the browser with three.js (BoxHero.jsx +
// BlendCard.jsx BoxViewer). Loaded lazily so three stays out of the main bundle.
import type * as THREE_NS from "three";

type Three = typeof THREE_NS;
export const BOX_PAPER = "#F0EDE5", BOX_INK = "#1A1A18", BOX_RED = "#D93D18";
export const BOX_W = 1.6, BOX_H = 1.8, BOX_D = .7;

const loadImg = (src: string) => new Promise<HTMLImageElement | null>((r) => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
const cssFont = (v: string, fallback: string) => {
  const f = getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  return f ? `${f}, ${fallback}` : fallback;
};

let texturePromise: Promise<Record<"front" | "back" | "side" | "top" | "bottom", HTMLCanvasElement>> | null = null;

/** Paint the five carton faces once per page; each scene wraps them in its own textures. */
function paintFaces() {
  if (texturePromise) return texturePromise;
  texturePromise = (async () => {
    const logoFam = cssFont("--nf-energy", '"Archivo", sans-serif');
    const monoFam = cssFont("--nf-martian", "monospace");
    try { await Promise.all([document.fonts.load(`800 100px ${logoFam}`), document.fonts.load(`600 34px ${monoFam}`), document.fonts.load(`500 26px ${monoFam}`)]); } catch { /* fall back */ }
    const mark = await loadImg("/brand/blended-mark.png");
    const face = (w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) => {
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      const g = c.getContext("2d")!; g.fillStyle = BOX_PAPER; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 2200; i++) { g.fillStyle = `rgba(26,26,24,${Math.random() * .035})`; g.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); }
      draw(g, w, h); return c;
    };
    const text = (g: CanvasRenderingContext2D, s: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = "center", track = 0) => {
      g.font = font; g.fillStyle = color; g.textAlign = align; g.textBaseline = "middle";
      if ("letterSpacing" in g) (g as unknown as { letterSpacing: string }).letterSpacing = track + "px";
      g.fillText(s, x, y);
    };
    const logo = `800 150px ${logoFam}`;
    return {
      front: face(1024, 1152, (g, w) => {
        if (mark) { const s = 330; g.save(); g.globalCompositeOperation = "multiply"; g.drawImage(mark, w / 2 - s / 2, 190, s, s); g.restore(); }
        text(g, "BLENDED", w / 2, 640, logo, BOX_INK, "center", -2);
        text(g, "COFFEE LAB", w / 2, 740, `600 34px ${monoFam}`, BOX_RED, "center", 8);
        g.fillStyle = BOX_INK; g.fillRect(96, 960, w - 192, 2);
        text(g, "WHOLE BEAN · ROASTED TO ORDER", w / 2, 1010, `500 26px ${monoFam}`, BOX_INK, "center", 4);
      }),
      back: face(1024, 1152, (g, w) => {
        text(g, "YOUR COFFEE,", 96, 220, `800 72px ${logoFam}`, BOX_INK, "left");
        text(g, "YOUR RATIOS.", 96, 300, `800 72px ${logoFam}`, BOX_RED, "left");
        [["LOT", "________"], ["ROAST", "________"], ["RATIO", "________"], ["ROASTED", "__ / __ / __"]].forEach(([k, v], i) => {
          const y = 480 + i * 96; g.fillStyle = "rgba(26,26,24,.25)"; g.fillRect(96, y + 34, w - 192, 2);
          text(g, k, 96, y, `600 30px ${monoFam}`, BOX_INK, "left", 4);
          text(g, v, w - 96, y, `400 30px ${monoFam}`, "rgba(26,26,24,.5)", "right");
        });
        text(g, "blended.coffee", w / 2, 1040, `500 28px ${monoFam}`, BOX_INK, "center", 2);
      }),
      side: face(448, 1152, (g, w, h) => {
        g.fillStyle = BOX_RED; g.fillRect(0, 0, w, h);
        g.save(); g.translate(w / 2, h / 2); g.rotate(-Math.PI / 2);
        text(g, "BLENDED", 0, 0, logo, BOX_PAPER, "center", -2);
        g.restore();
      }),
      top: face(1024, 448, (g, w, h) => {
        if (mark) { const s = 200; g.save(); g.globalCompositeOperation = "multiply"; g.drawImage(mark, w / 2 - s / 2, h / 2 - s / 2, s, s); g.restore(); }
      }),
      bottom: face(1024, 448, () => {}),
    };
  })();
  return texturePromise;
}

export interface BoxScene {
  three: Three;
  camera: THREE_NS.PerspectiveCamera;
  rig: THREE_NS.Group;
  host: HTMLElement;
  dispose: () => void;
}

/**
 * Mount a turnable carton into `host`. Drag to turn (with inertia); when left
 * alone it sways ~17° either way on a slow cycle instead of spinning.
 * `layout` runs every frame to position/scale the rig.
 */
export async function mountBox(host: HTMLElement, opts: {
  cam: [number, number, number]; look: [number, number, number]; baseRot: number;
  layout?: (s: BoxScene) => void; onReady?: () => void;
}): Promise<() => void> {
  const THREE = await import("three");
  let dead = false, raf = 0, visible = true;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%;touch-action:pan-y;cursor:grab";
  renderer.domElement.setAttribute("aria-hidden", "true");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 100);
  camera.position.set(...opts.cam); camera.lookAt(...opts.look);
  // physically-based light units: legacy intensities × π
  scene.add(new THREE.HemisphereLight(0xfffaf2, 0xd8d0c2, .75 * Math.PI));
  const key = new THREE.DirectionalLight(0xffffff, .9 * Math.PI); key.position.set(3, 6, 4); scene.add(key);
  const fill = new THREE.DirectionalLight(0xfff1e6, .35 * Math.PI); fill.position.set(-4, 2, 3); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, .45 * Math.PI); rim.position.set(-2, 3, -5); scene.add(rim);

  // soft contact shadow
  const sc = document.createElement("canvas"); sc.width = sc.height = 256;
  const sg = sc.getContext("2d")!, gr = sg.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, "rgba(26,26,24,.34)"); gr.addColorStop(.45, "rgba(26,26,24,.14)"); gr.addColorStop(1, "rgba(26,26,24,0)");
  sg.fillStyle = gr; sg.fillRect(0, 0, 256, 256);
  const shadowTex = new THREE.CanvasTexture(sc);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = .002;

  const rig = new THREE.Group(); scene.add(rig); rig.add(ground);
  const plain = new THREE.MeshStandardMaterial({ color: BOX_PAPER, roughness: .85 });
  const geo = new THREE.BoxGeometry(BOX_W, BOX_H, BOX_D);
  const box = new THREE.Mesh(geo, [plain, plain, plain, plain, plain, plain]);
  box.position.y = BOX_H / 2; rig.add(box);
  const disposables: { dispose: () => void }[] = [geo, plain, shadowTex, ground.geometry, ground.material as THREE_NS.Material];

  paintFaces().then((f) => {
    if (dead) return;
    const mat = (c: HTMLCanvasElement) => {
      const t = new THREE.CanvasTexture(c); t.anisotropy = 8; t.colorSpace = THREE.SRGBColorSpace;
      const m = new THREE.MeshStandardMaterial({ map: t, roughness: .82, metalness: 0 });
      disposables.push(t, m); return m;
    };
    const side = mat(f.side);
    box.material = [side, side, mat(f.top), mat(f.bottom), mat(f.front), mat(f.back)];
    opts.onReady?.();
  });

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
  const ctx: BoxScene = { three: THREE, camera, rig, host, dispose: () => {} };
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

  return () => {
    dead = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
    el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up);
    disposables.forEach((d) => d.dispose()); renderer.dispose();
    if (el.parentNode === host) host.removeChild(el);
  };
}
