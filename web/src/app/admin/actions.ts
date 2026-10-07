"use server";
import { revalidatePath, revalidateTag, updateTag } from "next/cache";
import { after } from "next/server";
import type { CoffeeReviewsData, GreenLot } from "@/lib/domain/types";
import type { Stage } from "@/lib/domain/orders";
import { requireAdmin } from "@/lib/admin-auth";
import { setOrderStage } from "@/lib/orders";
import { deleteGreenLot, listGreenLotsAdmin, saveGreenLot } from "@/lib/green-admin";
import { finalizeUpload, stageUpload } from "@/lib/shopify/files";
import { getSettings, registerWebhooks, saveSettings, type StoreSettings } from "@/lib/settings";
import { cleanRoastLoss, recipeText } from "@/lib/domain/green";
import { isRole, tidyReviews } from "@/lib/domain/coffee";
import type { SelItem } from "@/lib/domain/types";
import { deductOrder } from "@/lib/green-ledger";
import { stopStockSync, syncQuietly, syncStockFromGreen } from "@/lib/green-sync";
import { CACHE_TAGS, admin } from "@/lib/shopify/client";
import { env, isDemo } from "@/lib/env";
import { seedSampleCoffees, setupStore, type AdminQ } from "@/lib/store-setup";
import { DEMO_GREEN, DEMO_STOCK } from "@/lib/fixtures";
import { demoStore } from "@/lib/demo-store";

type Result = { ok: true } | { ok: false, error: string };
const fail = (e: unknown): Result => ({ ok: false, error: e instanceof Error ? e.message : "Something went wrong" });

export async function advanceOrder(orderId: string, stage: Stage, tracking?: { number: string; company: string } | null): Promise<Result> {
  await requireAdmin();
  try { await setOrderStage(orderId, stage, tracking); revalidatePath("/admin/orders"); return { ok: true }; } catch (e) { return fail(e); }
}

function cleanLot(l: GreenLot): GreenLot {
  const n = (v: unknown, d = 0) => { const x = Number(v); return isFinite(x) && x >= 0 ? x : d; };
  const notes: GreenLot["notes"] = {};
  for (const [k, v] of Object.entries(l.notes || {})) { const x = n(v); if (x > 0) notes[k as keyof GreenLot["notes"]] = Math.min(10, x); }
  return {
    ...l, name: String(l.name).trim().slice(0, 80), origin: String(l.origin).trim().slice(0, 80), lot: String(l.lot || "").trim().slice(0, 40),
    process: String(l.process || "Washed").slice(0, 40), roast: Math.max(1, Math.min(5, Math.round(n(l.roast, 3)))), price: n(l.price),
    wholesale: l.wholesale == null ? null : n(l.wholesale), retail: l.retail == null ? null : n(l.retail),
    avail: Math.round(n(l.avail) * 10) / 10, onHandG: l.onHandG == null ? null : Math.round(n(l.onHandG)), minG: l.minG == null ? null : Math.round(n(l.minG)), notes,
    kind: l.kind === "limited" || l.kind === "soon" ? l.kind : "anchor", role: isRole(l.role) ? l.role : null, reviews: l.reviews === undefined ? undefined : tidyReviews(l.reviews), tag: l.tag ? String(l.tag).slice(0, 30) : null, listed: !!l.listed,
  };
}

export async function saveLotAction(lot: GreenLot, imageFileId?: string): Promise<Result & { lot?: GreenLot }> {
  await requireAdmin();
  const l = cleanLot(lot);
  if (!l.name || !l.origin) return { ok: false, error: "Name and origin are required." };
  try {
    const saved = await saveGreenLot(l, imageFileId);
    updateTag(CACHE_TAGS.catalog);
    return { ok: true, lot: saved };
  } catch (e) { return fail(e); }
}

export async function deleteLotAction(lot: GreenLot): Promise<Result> {
  await requireAdmin();
  try { await deleteGreenLot(lot); updateTag(CACHE_TAGS.catalog); return { ok: true }; } catch (e) { return fail(e); }
}

export async function resetDemoCatalog(): Promise<Result> {
  await requireAdmin();
  if (!isDemo()) return { ok: false, error: "Only available in demo mode." };
  demoStore.resetGreen(); updateTag(CACHE_TAGS.catalog); revalidatePath("/admin/green");
  return { ok: true };
}

/** Lot photos: stage an upload target, then turn the upload into a Shopify MediaImage. */
export async function stageLotImage(filename: string, mimeType: string, size: number) {
  await requireAdmin();
  if (isDemo()) return { demo: true as const };
  if (!/^image\/(png|jpe?g|webp|gif)$/.test(mimeType) || size > 20 * 1024 * 1024) throw new Error("Use a PNG, JPG or WebP under 20 MB.");
  return stageUpload(filename, mimeType, size, "IMAGE");
}
export async function finalizeLotImage(resourceUrl: string, filename: string, alt: string) {
  await requireAdmin();
  return finalizeUpload(resourceUrl, filename, alt, "IMAGE");
}

export async function saveSettingsAction(s: StoreSettings): Promise<Result> {
  await requireAdmin();
  try {
    const before = await getSettings();
    await saveSettings(s);
    revalidateTag(CACHE_TAGS.settings, "max");
    revalidateTag(CACHE_TAGS.catalog, "max"); // roast loss changes what the green can make
    // Coffee stock in Shopify: turning the sync on tracks and sets it; off hands it back to untracked.
    if (s.syncStock) await syncStockFromGreen({ apply: true, force: true, loss: cleanRoastLoss(s.roastLoss) });
    else if (before.syncStock) await stopStockSync();
    revalidatePath("/admin/settings"); revalidatePath("/admin/inventory");
    return { ok: true };
  } catch (e) { return fail(e); }
}

// ---------- inventory: recipes, deductions, sync ----------
const SET_RECIPE = `
  mutation SaveRecipe($metafields: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $metafields) { userErrors { field message } } }
`;
/** Save what one of Our coffees is roasted from (blended.recipe), then refresh the shop and Shopify's counts. */
export async function saveRecipeAction(coffeeId: string, gid: string | undefined, sel: SelItem[]): Promise<Result> {
  await requireAdmin();
  try {
    const lots = await listGreenLotsAdmin();
    const clean = sel.map((s) => ({ id: String(s.id), pct: Math.round(Number(s.pct)) })).filter((s) => s.pct > 0);
    if (!clean.length || clean.length > 4) throw new Error("A recipe uses one to four green lots.");
    if (new Set(clean.map((s) => s.id)).size !== clean.length) throw new Error("A lot appears twice.");
    if (clean.some((s) => !lots.some((l) => l.id === s.id))) throw new Error("Pick lots from the green catalog.");
    if (clean.reduce((a, s) => a + s.pct, 0) !== 100) throw new Error("Shares must add up to 100%.");
    const text = recipeText(clean);
    if (isDemo()) demoStore.setRecipe(coffeeId, text);
    else {
      if (!gid) throw new Error("This coffee isn't in Shopify.");
      const r = await admin<{ metafieldsSet: { userErrors: { message: string }[] } }>(SET_RECIPE, { variables: { metafields: [
        { ownerId: gid, namespace: "blended", key: "recipe", type: "single_line_text_field", value: text },
      ] } });
      if (r.metafieldsSet.userErrors.length) throw new Error(r.metafieldsSet.userErrors.map((e) => e.message).join("; "));
      after(() => syncQuietly("recipe"));
    }
    revalidateTag(CACHE_TAGS.catalog, "max"); revalidatePath("/admin/inventory");
    return { ok: true };
  } catch (e) { return fail(e); }
}

/** Save the tasting note and customer reviews on one of Our coffees (blended.reviews); empty removes them. */
export async function saveCoffeeReviewsAction(coffeeId: string, gid: string | undefined, reviews: CoffeeReviewsData | null): Promise<Result & { reviews?: CoffeeReviewsData | null }> {
  await requireAdmin();
  try {
    const clean = tidyReviews(reviews);
    if (isDemo()) demoStore.setReviews(coffeeId, clean);
    else {
      if (!gid) throw new Error("This coffee isn't in Shopify.");
      const r = clean
        ? (await admin<{ metafieldsSet: { userErrors: { message: string }[] } }>(SET_RECIPE, { variables: { metafields: [
            { ownerId: gid, namespace: "blended", key: "reviews", type: "json", value: JSON.stringify(clean) },
          ] } })).metafieldsSet
        : (await admin<{ metafieldsDelete: { userErrors: { message: string }[] } }>(DELETE_FIELDS, { variables: { metafields: [{ ownerId: gid, namespace: "blended", key: "reviews" }] } })).metafieldsDelete;
      if (r.userErrors.length) throw new Error(r.userErrors.map((e) => e.message).join("; "));
    }
    revalidateTag(CACHE_TAGS.catalog, "max"); revalidatePath("/admin/inventory");
    return { ok: true, reviews: clean };
  } catch (e) { return fail(e); }
}
const DELETE_FIELDS = `
  mutation ClearCoffeeFields($metafields: [MetafieldIdentifierInput!]!) { metafieldsDelete(metafields: $metafields) { userErrors { field message } } }
`;

/** Deduct an order's green by hand (an order the webhook missed). */
export async function deductOrderAction(gid: string): Promise<Result> {
  await requireAdmin();
  if (isDemo()) return { ok: false, error: "Connect a Shopify store first." };
  try {
    const r = await deductOrder(gid, { force: true });
    if (!r.done) throw new Error(r.reason);
    revalidatePath("/admin/inventory");
    return { ok: true };
  } catch (e) { return fail(e); }
}

/** Recompute Our coffees' Shopify stock from green now. */
export async function syncNowAction(): Promise<Result & { changed?: number }> {
  await requireAdmin();
  if (isDemo()) return { ok: false, error: "Connect a Shopify store first." };
  try {
    const r = await syncStockFromGreen({ apply: true });
    if (!r.ran) throw new Error("Turn on “Sync Our coffees’ stock to Shopify” in Settings first.");
    revalidatePath("/admin/inventory");
    return { ok: true, changed: r.changed };
  } catch (e) { return fail(e); }
}

export async function registerWebhooksAction(): Promise<Result> {
  await requireAdmin();
  if (isDemo()) return { ok: false, error: "Connect a Shopify store first." };
  try { await registerWebhooks(); revalidatePath("/admin/settings"); return { ok: true }; } catch (e) { return fail(e); }
}

/**
 * Create the green_lot definition, blended.* product fields and the Our coffees
 * collection in Shopify (idempotent). With `seed`, also adds the sample catalog;
 * its photos are pulled by Shopify from this deployment's public URL.
 */
/**
 * Settings → "Add sample coffees": the store setup, then draft coffees built
 * from the store's own green lots (sampleCoffeesFromGreen). Idempotent.
 */
export async function addSampleCoffeesAction(): Promise<Result & { log?: string[] }> {
  await requireAdmin();
  if (isDemo()) return { ok: false, error: "Connect a Shopify store first." };
  const lines: string[] = [];
  try {
    const q: AdminQ = (query, variables) => admin(query, { variables });
    await setupStore({ q, collectionHandle: env.stockCollection, locationId: env.locationId, seed: null, log: (l) => lines.push(l) });
    await seedSampleCoffees(q, await listGreenLotsAdmin(), (l) => lines.push(l));
    lines.push("They're drafts: add a photo, check the prices, then set each one to Active.");
    updateTag(CACHE_TAGS.catalog); revalidatePath("/admin", "layout");
    return { ok: true, log: lines };
  } catch (e) {
    return { ...fail(e), log: lines };
  }
}

export async function setupStoreAction(seed: boolean): Promise<Result & { log?: string[] }> {
  await requireAdmin();
  if (isDemo()) return { ok: false, error: "Connect a Shopify store first." };
  const base = env.appUrl.replace(/\/$/, "");
  const publicUrl = /localhost|127\.0\.0\.1/.test(base) ? null : base;
  const lines: string[] = [];
  try {
    await setupStore({
      q: (query, variables) => admin(query, { variables }),
      collectionHandle: env.stockCollection,
      locationId: env.locationId,
      seed: seed ? { green: DEMO_GREEN, stock: DEMO_STOCK, image: async (p) => (publicUrl ? `${publicUrl}${p}` : null) } : null,
      log: (l) => lines.push(l),
    });
    updateTag(CACHE_TAGS.catalog); revalidatePath("/admin", "layout");
    return { ok: true, log: lines };
  } catch (e) {
    const r = fail(e);
    if (!r.ok && /access denied/i.test(r.error))
      r.error += " — the Shopify app hasn't been granted a permission it needs. See the setup checklist above for which.";
    return { ...r, log: lines };
  }
}
