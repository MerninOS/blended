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

let docs = 0, bad = 0;
for (const f of files.filter((x) => x !== self)) {
  const rel = relative(root, f);
  const src = readFileSync(f, "utf8");
  const which = STOREFRONT.includes(rel) ? "storefront" : CUSTOMER.includes(rel) ? "customer" : "admin";
  for (const m of src.matchAll(/gql`([\s\S]*?)`/g)) {
    docs++;
    try {
      const errs = validate(schemas[which], parse(m[1]));
      if (errs.length) { bad++; console.error(`✗ ${rel} [${which}]\n  ${errs.map((e) => e.message).join("\n  ")}`); }
    } catch (e) { bad++; console.error(`✗ ${rel} [${which}] parse: ${e.message}`); }
  }
}
console.log(`${docs - bad}/${docs} GraphQL documents valid`);
process.exit(bad ? 1 : 0);
