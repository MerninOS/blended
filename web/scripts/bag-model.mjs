// Rebuilds public/models/coffee-bag.glb from Meshy's FBX export: keeps only the bag's shape
// (box3d.ts paints its own paper material and shades it flat), welds the vertices, quantizes
// them and meshopt-compresses the result. Run when the model changes:
//   npm i --no-save @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions meshoptimizer
//   node scripts/bag-model.mjs path/to/coffee-bag.fbx
import { readFileSync } from "node:fs";
import { Document, NodeIO } from "@gltf-transform/core";
import { EXTMeshoptCompression, KHRMeshQuantization } from "@gltf-transform/extensions";
import { dedup, meshopt, prune, quantize, reorder, weld } from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";

globalThis.self = globalThis; globalThis.window = globalThis; // FBXLoader expects a browser global
const { FBXLoader } = await import("three/examples/jsm/loaders/FBXLoader.js");

const src = process.argv[2];
if (!src) { console.error("usage: node scripts/bag-model.mjs <model.fbx>"); process.exit(1); }
const out = new URL("../public/models/coffee-bag.glb", import.meta.url).pathname;
const buf = readFileSync(src);
const fbx = new FBXLoader().parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), "");
fbx.updateMatrixWorld(true);
let mesh; fbx.traverse((o) => { if (o.isMesh) mesh ??= o; });
const geo = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);

const doc = new Document(), buffer = doc.createBuffer();
const position = doc.createAccessor().setType("VEC3").setArray(new Float32Array(geo.attributes.position.array)).setBuffer(buffer);
const prim = doc.createPrimitive().setAttribute("POSITION", position);
doc.createScene().addChild(doc.createNode("bag").setMesh(doc.createMesh("bag").addPrimitive(prim)));
await MeshoptEncoder.ready;
await doc.transform(weld(), dedup(), prune(), reorder({ encoder: MeshoptEncoder }), quantize({ quantizePosition: 14 }), meshopt({ encoder: MeshoptEncoder, level: "high" }));
await new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization]).registerDependencies({ "meshopt.encoder": MeshoptEncoder }).write(out, doc);
console.log(`wrote ${out}`);
