import "server-only";
// Green catalog, admin side. Each lot is a Shopify product (see
// shopify/green-product.ts): listing = ACTIVE, hiding = DRAFT, deleting
// archives it so its inventory history stays in Shopify. "On hand" edits are a
// compare-and-set on Shopify inventory, so an order deducting green in the
// meantime is never overwritten.
import { randomUUID } from "node:crypto";
import type { GreenLot } from "@/lib/domain/types";
import { env, isDemo } from "@/lib/env";
import { admin, assertNoUserErrors, gql } from "@/lib/shopify/client";
import {
  GREEN_LEVEL, GREEN_NODE, GREEN_QUERY, PRODUCT_SET, adjustGreen, gToLb, greenMetafields, greenProductInput, lbToG, lotFromProduct, resolveLocation,
  type AdminQ, type GreenNode,
} from "@/lib/shopify/green-product";
import { demoStore } from "@/lib/demo-store";

export const adminQ: AdminQ = (query, variables) => admin(query, { variables });

let location: Promise<string> | null = null;
/** Inventory location green is counted at (cached per server instance). */
export function greenLocation() {
  location ??= resolveLocation(adminQ, env.locationId).catch((e) => { location = null; throw e; });
  return location;
}

const LIST = gql`
  query AdminGreenLots($query: String!, $loc: ID!) {
    products(first: 250, query: $query, sortKey: TITLE) { nodes { ...GreenNode ...GreenLevel } }
  }
  ${GREEN_NODE}
  ${GREEN_LEVEL}
`;

export async function listGreenLotsAdmin(): Promise<GreenLot[]> {
  if (isDemo()) return demoStore.green();
  const r = await admin<{ products: { nodes: GreenNode[] } }>(LIST, { variables: { query: GREEN_QUERY, loc: await greenLocation() } });
  return r.products.nodes.map(lotFromProduct);
}

const slug = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").slice(0, 60) || "lot";

const HANDLE_TAKEN = gql`
  query GreenHandleTaken($identifier: ProductIdentifierInput!) { productByIdentifier(identifier: $identifier) { id } }
`;
const PRODUCT = gql`
  query GreenProduct($id: ID!) {
    product(id: $id) {
      id
      media(first: 10) { nodes { id } }
      variants(first: 1) { nodes { inventoryItem { id } } }
    }
  }
`;
const UPDATE = gql`
  mutation GreenLotUpdate($product: ProductUpdateInput!) {
    productUpdate(product: $product) { product { id handle } userErrors { field message } }
  }
`;
const CLEAR_FIELDS = gql`
  mutation GreenLotClearFields($metafields: [MetafieldIdentifierInput!]!) {
    metafieldsDelete(metafields: $metafields) { userErrors { field message } }
  }
`;
const FILES = gql`
  mutation GreenLotImage($files: [FileUpdateInput!]!) {
    fileUpdate(files: $files) { userErrors { field message } }
  }
`;
const SET_QTY = gql`
  mutation GreenSetOnHand($input: InventorySetQuantitiesInput!, $key: String!) {
    inventorySetQuantities(input: $input) @idempotent(key: $key) { userErrors { field message code } }
  }
`;
const ACTIVATE = gql`
  mutation GreenActivate($item: ID!, $loc: ID!, $available: Int, $key: String!) {
    inventoryActivate(inventoryItemId: $item, locationId: $loc, available: $available) @idempotent(key: $key) {
      userErrors { field message }
    }
  }
`;

type UE = { userErrors: { message: string; code?: string | null }[] };

/** imageFileId: a MediaImage GID from an upload, "" to clear, undefined to keep. */
export async function saveGreenLot(lot: GreenLot, imageFileId?: string): Promise<GreenLot> {
  if (isDemo()) {
    const saved = { ...lot, id: lot.gid ? lot.id : lot.id || slug(lot.name) };
    demoStore.saveLot(saved);
    return saved;
  }
  const loc = await greenLocation();
  const grams = lbToG(lot.avail);

  if (!lot.gid) {
    let handle = slug(lot.name);
    if ((await admin<{ productByIdentifier: { id: string } | null }>(HANDLE_TAKEN, { variables: { identifier: { handle } } })).productByIdentifier)
      handle = `${handle}-${randomUUID().slice(0, 4)}`;
    const r = await admin<{ productSet: { product: { id: string; handle: string } | null } & UE }>(PRODUCT_SET, {
      variables: { input: greenProductInput(lot, handle, loc, grams, imageFileId ? { id: imageFileId } : null) },
    });
    assertNoUserErrors(r.productSet, "Could not add coffee");
    const p = r.productSet.product!;
    return { ...lot, gid: p.id, id: p.handle, onHandG: grams };
  }

  const cur = (await admin<{ product: { id: string; media: { nodes: { id: string }[] }; variants: { nodes: { inventoryItem: { id: string } }[] } } | null }>(PRODUCT, { variables: { id: lot.gid } })).product;
  if (!cur) throw new Error("This coffee no longer exists in Shopify — reload the page.");
  const { set, clear } = greenMetafields(lot);
  const u = await admin<{ productUpdate: UE }>(UPDATE, {
    variables: { product: { id: lot.gid, title: lot.name, status: lot.listed ? "ACTIVE" : "DRAFT", metafields: set } },
  });
  assertNoUserErrors(u.productUpdate, "Could not save");
  if (clear.length) await admin(CLEAR_FIELDS, { variables: { metafields: clear.map((key) => ({ ownerId: lot.gid, namespace: "blended", key })) } });

  if (imageFileId !== undefined) {
    const files = [
      ...cur.media.nodes.filter((m) => m.id !== imageFileId).map((m) => ({ id: m.id, referencesToRemove: [lot.gid] })),
      ...(imageFileId ? [{ id: imageFileId, referencesToAdd: [lot.gid] }] : []),
    ];
    if (files.length) assertNoUserErrors((await admin<{ fileUpdate: UE }>(FILES, { variables: { files } })).fileUpdate, "Could not update the photo");
  }

  // Only touch inventory when the on-hand number was actually edited.
  let onHandG = lot.onHandG ?? null;
  const item = cur.variants.nodes[0]?.inventoryItem.id;
  if (item && (onHandG == null || gToLb(onHandG) !== gToLb(grams))) {
    if (onHandG == null) {
      const a = await admin<{ inventoryActivate: UE }>(ACTIVATE, { variables: { item, loc, available: grams, key: randomUUID() } });
      assertNoUserErrors(a.inventoryActivate, "Could not stock this coffee");
    } else {
      const s = await admin<{ inventorySetQuantities: UE }>(SET_QTY, { variables: { key: randomUUID(), input: {
        name: "available", reason: "correction",
        quantities: [{ inventoryItemId: item, locationId: loc, quantity: grams, changeFromQuantity: onHandG }],
      } } });
      if (s.inventorySetQuantities.userErrors.some((e) => e.code === "CHANGE_FROM_QUANTITY_STALE"))
        throw new Error("Stock for this coffee changed in Shopify since you opened it (an order may have used some). Reload and try again.");
      assertNoUserErrors(s.inventorySetQuantities, "Could not update stock");
    }
    onHandG = grams;
  }
  return { ...lot, onHandG, avail: onHandG == null ? lot.avail : gToLb(onHandG) };
}

/** Archive rather than delete, so Shopify keeps the lot's inventory history. */
export async function deleteGreenLot(lot: GreenLot) {
  if (isDemo()) { demoStore.deleteLot(lot.id); return; }
  if (!lot.gid) return;
  const r = await admin<{ productUpdate: UE }>(UPDATE, { variables: { product: { id: lot.gid, status: "ARCHIVED" } } });
  assertNoUserErrors(r.productUpdate, "Could not delete");
}

/** Deduct (sign -1) or put back (+1) the green an order's blends used. */
export async function moveGreenForOrder(orderGid: string, usageG: Map<string, number>, sign: 1 | -1) {
  const id = orderGid.split("/").pop();
  return adjustGreen(adminQ, {
    locationId: await greenLocation(), usageG, sign,
    reason: sign < 0 ? "other" : "restock",
    orderGid,
    key: `blended-green-${sign < 0 ? "deduct" : "restock"}-${id}`,
  });
}
