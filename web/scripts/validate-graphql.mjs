// Validates every gql`…` document in the app against Shopify's published
// schemas (Admin 2026-07, Storefront, Customer Account). Schemas are fetched
// once into .schemas/ from Shopify's npm packages:  npm run schemas
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { buildClientSchema, parse, validate } from "graphql";

const root = new URL("..", import.meta.url).pathname;
const load = (f) => {
  const p = join(root, ".schemas", f);
  if (!existsSync(p)) { console.error(`Missing ${p} — run: npm run schemas`); process.exit(2); }
  const j = JSON.parse(readFileSync(p, "utf8"));
  return buildClientSchema(j.data ?? j, { assumeValid: true });
};
const schemas = { admin: load("admin-2026-07.json"), storefront: load("storefront.json"), customer: load("customer-account.json") };
const STOREFRONT = ["src/lib/catalog.ts"];
const CUSTOMER = ["src/lib/customer-account.ts"];

const files = [];
const walk = (d) => readdirSync(d).forEach((f) => { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (/\.(ts|tsx|mjs)$/.test(f)) files.push(p); });
walk(join(root, "src")); walk(join(root, "scripts"));
const self = new URL(import.meta.url).pathname;

// Fragments (`const X = gql\`fragment …\``) are inlined where a document uses \${X}.
const fragments = new Map();
for (const f of files) for (const m of readFileSync(f, "utf8").matchAll(/const (\w+) = gql`(\s*fragment[\s\S]*?)`/g)) fragments.set(m[1], m[2]);

let docs = 0, bad = 0;
for (const f of files.filter((x) => x !== self)) {
  const rel = relative(root, f);
  const src = readFileSync(f, "utf8");
  const fileApi = STOREFRONT.includes(rel) ? "storefront" : CUSTOMER.includes(rel) ? "customer" : "admin";
  for (const m of src.matchAll(/gql`([\s\S]*?)`/g)) {
    // A document can opt into another API with a leading "# admin" / "# storefront" comment.
    const which = m[1].match(/^\s*#\s*(admin|storefront|customer)\b/)?.[1] ?? fileApi;
    if (/^\s*fragment\b/.test(m[1])) continue; // validated where it's used
    docs++;
    try {
      const doc = m[1].replace(/\$\{(\w+)\}/g, (_, n) => { if (!fragments.has(n)) throw new Error(`unknown fragment \${${n}}`); return fragments.get(n); });
      const errs = validate(schemas[which], parse(doc));
      if (errs.length) { bad++; console.error(`✗ ${rel} [${which}]\n  ${errs.map((e) => e.message).join("\n  ")}`); }
    } catch (e) { bad++; console.error(`✗ ${rel} [${which}] parse: ${e.message}`); }
  }
}
console.log(`${docs - bad}/${docs} GraphQL documents valid`);
process.exit(bad ? 1 : 0);
