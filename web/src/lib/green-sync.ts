import "server-only";
// Keeps Shopify itself honest about Our coffees. With Settings → "Sync coffee
// stock to Shopify" on, every Our coffees variant that's linked to green is
// inventory-tracked (sell when out of stock: off) at the green location, with
// its quantity set to the whole bags the green on hand can roast. Shopify's own
// checkout, POS and any other channel then stop selling a size as soon as the
// green runs short. Green stays the only real inventory: these counts are
// recomputed from it after every order and every green change, so the
// decrement Shopify applies to a variant on sale is simply overwritten.
import { randomUUID } from "node:crypto";
import type { GreenLot, StockCoffee } from "@/lib/domain/types";
import { SHOP_SIZES } from "@/lib/domain/coffee";
import { bagsFromGreen, linkCoffee, type RoastLoss } from "@/lib/domain/green";
import { env, isDemo } from "@/lib/env";
import { admin, gql } from "@/lib/shopify/client";
import { GREEN_LEVEL, GREEN_NODE, GREEN_QUERY, lotFromProduct, type GreenNode } from "@/lib/shopify/green-product";
import { sizeFromOption, subParts } from "@/lib/shopify/mapping";
import { greenLocation } from "@/lib/green-admin";
import { getSettings } from "@/lib/settings";

const STATE = gql`
  query GreenSyncState($green: String!, $loc: ID!, $handle: String!) {
    products(first: 250, query: $green) { nodes { ...GreenNode ...GreenLevel } }
    collectionByIdentifier(identifier: { handle: $handle }) {
      products(first: 100) {
        nodes {
          id
          title
          description
          roast: metafield(namespace: "blended", key: "roast_level") { value }
          kind: metafield(namespace: "blended", key: "kind") { value }
          subtitle: metafield(namespace: "blended", key: "subtitle") { value }
          recipe: metafield(namespace: "blended", key: "recipe") { value }
          variants(first: 20) {
            nodes {
              id
              inventoryPolicy
              selectedOptions { name value }
              inventoryItem { id tracked inventoryLevel(locationId: $loc) { quantities(names: ["available"]) { name quantity } } }
            }
          }
        }
      }
    }
  }
  ${GREEN_NODE}
  ${GREEN_LEVEL}
`;
type VariantNode = {
  id: string; inventoryPolicy: "DENY" | "CONTINUE"; selectedOptions: { name: string; value: string }[];
  inventoryItem: { id: string; tracked: boolean; inventoryLevel: { quantities: { name: string; quantity: number }[] } | null };
};
type CoffeeNode = {
  id: string; title: string; description: string;
  roast: { value: string } | null; kind: { value: string } | null; subtitle: { value: string } | null; recipe: { value: string } | null;
  variants: { nodes: VariantNode[] };
};
type State = { products: { nodes: GreenNode[] }; collectionByIdentifier: { products: { nodes: CoffeeNode[] } } | null };

const TRACK = gql`
  mutation GreenSyncTrack($id: ID!, $tracked: Boolean!) {
    inventoryItemUpdate(id: $id, input: { tracked: $tracked }) { userErrors { field message } }
  }
`;
const ACTIVATE = gql`
  mutation GreenSyncActivate($item: ID!, $loc: ID!, $available: Int, $key: String!) {
    inventoryActivate(inventoryItemId: $item, locationId: $loc, available: $available) @idempotent(key: $key) { userErrors { field message } }
  }
`;
const SET = gql`
  mutation GreenSyncSet($input: InventorySetQuantitiesInput!, $key: String!) {
    inventorySetQuantities(input: $input) @idempotent(key: $key) { userErrors { field message code } }
  }
`;
const POLICY = gql`
  mutation GreenSyncPolicy($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) { userErrors { field message } }
  }
`;
type UE = { userErrors: { message: string; code?: string }[] };
const fail = (what: string, p: UE) => { if (p.userErrors.length) throw new Error(`${what}: ${p.userErrors.map((e) => e.message).join("; ")}`); };

export interface SyncRow {
  name: string;
  linked: boolean;
  /** Per size: bags the green can make, what Shopify had, and whether it's tracked there. */
  sizes: { size: string; bags: number | null; shopify: number | null; tracked: boolean }[];
}
export interface SyncResult { rows: SyncRow[]; changed: number; ran: boolean }

const coffeeOf = (p: CoffeeNode): Pick<StockCoffee, "name" | "kind" | "recipe" | "blurb" | "roast"> => ({
  name: p.title, blurb: p.description, recipe: p.recipe?.value || undefined,
  kind: p.kind?.value?.toLowerCase().startsWith("blend") ? "blend" : p.kind?.value ? "single" : subParts(p.subtitle?.value || "").kind,
  roast: Number(p.roast?.value) || 3,
});

async function state() {
  const loc = await greenLocation();
  const r = await admin<State>(STATE, { variables: { green: GREEN_QUERY, loc, handle: env.stockCollection } });
  const lots: GreenLot[] = r.products.nodes.map(lotFromProduct);
  return { loc, lots, coffees: r.collectionByIdentifier?.products.nodes ?? [] };
}

/**
 * Compare (and, with `apply`, write) each linked variant's Shopify stock against
 * the bags its green can make. Coffees not linked to green are left alone.
 */
export async function syncStockFromGreen(opts: { apply: boolean; loss?: RoastLoss; force?: boolean } = { apply: true }): Promise<SyncResult> {
  if (isDemo()) return { rows: [], changed: 0, ran: false };
  const settings = await getSettings();
  if (opts.apply && !settings.syncStock && !opts.force) return { rows: [], changed: 0, ran: false };
  const loss = opts.loss ?? settings.roastLoss;
  const { loc, lots, coffees } = await state();
  const byId = new Map(lots.map((l) => [l.id, l]));
  const rows: SyncRow[] = [], sets: { inventoryItemId: string; locationId: string; quantity: number; changeFromQuantity: number }[] = [];
  let changed = 0;
  for (const p of coffees) {
    const c = coffeeOf(p), link = linkCoffee(c, lots);
    const row: SyncRow = { name: p.title, linked: !!link, sizes: [] };
    const policy: { id: string; inventoryPolicy: "DENY" }[] = [];
    for (const v of p.variants.nodes) {
      const opt = v.selectedOptions.find((o) => /size|weight/i.test(o.name)) ?? v.selectedOptions[0];
      const size = SHOP_SIZES.find((s) => s.id === (opt && sizeFromOption(opt.value)));
      if (!size) continue;
      const level = v.inventoryItem.inventoryLevel, have = level ? level.quantities.find((q) => q.name === "available")?.quantity ?? 0 : null;
      const bags = !link ? null : link.missing.length ? 0 : bagsFromGreen(link.sel, size.lb, c.roast, byId, loss);
      row.sizes.push({ size: size.label, bags, shopify: v.inventoryItem.tracked ? have : null, tracked: v.inventoryItem.tracked });
      if (!opts.apply || bags == null) continue;
      if (!v.inventoryItem.tracked) { fail("Track stock", (await admin<{ inventoryItemUpdate: UE }>(TRACK, { variables: { id: v.inventoryItem.id, tracked: true } })).inventoryItemUpdate); changed++; }
      if (have == null) {
        fail("Stock at location", (await admin<{ inventoryActivate: UE }>(ACTIVATE, { variables: { item: v.inventoryItem.id, loc, available: bags, key: randomUUID() } })).inventoryActivate);
        changed++;
      } else if (have !== bags) sets.push({ inventoryItemId: v.inventoryItem.id, locationId: loc, quantity: bags, changeFromQuantity: have });
      if (v.inventoryPolicy !== "DENY") policy.push({ id: v.id, inventoryPolicy: "DENY" });
    }
    if (policy.length) { fail("Stop overselling", (await admin<{ productVariantsBulkUpdate: UE }>(POLICY, { variables: { productId: p.id, variants: policy } })).productVariantsBulkUpdate); changed += policy.length; }
    rows.push(row);
  }
  for (let i = 0; i < sets.length; i += 250) {
    const r = (await admin<{ inventorySetQuantities: UE }>(SET, { variables: { key: randomUUID(), input: {
      name: "available", reason: "correction", referenceDocumentUri: "blended://green-sync", quantities: sets.slice(i, i + 250),
    } } })).inventorySetQuantities;
    // Someone else (an order, another sync) moved a count since we read it: their webhook syncs again.
    if (r.userErrors.some((e) => e.code === "CHANGE_FROM_QUANTITY_STALE")) continue;
    fail("Set coffee stock", r);
    changed += Math.min(250, sets.length - i);
  }
  return { rows, changed, ran: opts.apply };
}

/** Turning the sync off hands Our coffees back to untracked stock, as before. */
export async function stopStockSync() {
  if (isDemo()) return 0;
  const { lots, coffees } = await state();
  let n = 0;
  for (const p of coffees) {
    if (!linkCoffee(coffeeOf(p), lots)) continue;
    for (const v of p.variants.nodes) {
      if (!v.inventoryItem.tracked) continue;
      fail("Untrack stock", (await admin<{ inventoryItemUpdate: UE }>(TRACK, { variables: { id: v.inventoryItem.id, tracked: false } })).inventoryItemUpdate);
      n++;
    }
  }
  return n;
}

/** Run a sync without failing the caller (webhooks, saves): problems are logged. */
export const syncQuietly = (why: string) => syncStockFromGreen({ apply: true }).catch((e: unknown) => {
  console.error(`[green-sync ${why}]`, e instanceof Error ? e.message : e);
  return null;
});
