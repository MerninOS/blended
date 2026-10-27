// Add a green lot to Shopify from a lot file, the same product /admin/green → Add coffee makes.
//
//   npm run add:green -- scripts/green/decaf-mexico-veracruz.json            # create it
//   npm run add:green -- scripts/green/decaf-mexico-veracruz.json --dry-run  # print the input only
//
// A lot file is a GreenLot (src/lib/domain/types.ts) in JSON: id (the handle), name, origin,
// process, price ($/lb green) and notes are required; avail is green lb on hand (default 0).
// Anything else is left at the admin's defaults. A lot whose handle is already in Shopify is
// skipped: change it in the admin, where stock edits are compare-and-set.
import { readFileSync } from "node:fs";
import type { GreenLot } from "../src/lib/domain/types.ts";
import { PRODUCT_SET, greenProductInput, lbToG, resolveLocation } from "../src/lib/shopify/green-product.ts";
import { adminQ, check } from "./shopify-admin.ts";

const gql = String.raw;
const args = process.argv.slice(2);
const dry = args.includes("--dry-run");
const files = args.filter((a) => !a.startsWith("--"));
if (!files.length) { console.error("Usage: npm run add:green -- <lot.json>... [--dry-run]"); process.exit(1); }

const BY_HANDLE = gql`
  query GreenByHandle($identifier: ProductIdentifierInput!) { productByIdentifier(identifier: $identifier) { id status } }
`;

function readLot(path: string): GreenLot {
  const x = JSON.parse(readFileSync(path, "utf8")) as Partial<GreenLot>;
  for (const k of ["id", "name", "origin", "process", "price", "notes"] as const) {
    if (x[k] == null || x[k] === "") throw new Error(`${path}: "${k}" is required`);
  }
  return {
    lot: "", roast: 3, wholesale: null, retail: null, avail: 0, minG: null, kind: "anchor",
    role: null, tag: null, listed: true, image: null, ...x,
  } as GreenLot;
}

for (const path of files) {
  const l = readLot(path);
  if (dry) {
    console.log(JSON.stringify(greenProductInput(l, l.id, "gid://shopify/Location/<green location>", lbToG(l.avail), l.image ? { originalSource: l.image } : null), null, 2));
    continue;
  }
  const existing = (await adminQ(BY_HANDLE, { identifier: { handle: l.id } })).productByIdentifier;
  if (existing) { console.log(`• ${l.name}: already in Shopify (${existing.id}, ${existing.status}), skipped`); continue; }
  const loc = await resolveLocation(adminQ, process.env.SHOPIFY_LOCATION_ID);
  const r = await adminQ(PRODUCT_SET, { input: greenProductInput(l, l.id, loc, lbToG(l.avail), l.image ? { originalSource: l.image } : null) });
  check(r.productSet, `Green lot ${l.name}`);
  console.log(`✓ ${l.name} → ${r.productSet.product.id} (${l.listed ? "listed" : "hidden"}, ${l.avail} lb green)`);
}
