"use server";
import { revalidatePath, revalidateTag, updateTag } from "next/cache";
import type { GreenLot } from "@/lib/domain/types";
import type { Stage } from "@/lib/domain/orders";
import { requireAdmin } from "@/lib/admin-auth";
import { setOrderStage } from "@/lib/orders";
import { deleteGreenLot, saveGreenLot } from "@/lib/green-admin";
import { finalizeUpload, stageUpload } from "@/lib/shopify/files";
import { registerWebhooks, saveSettings, type StoreSettings } from "@/lib/settings";
import { CACHE_TAGS, admin } from "@/lib/shopify/client";
import { env, isDemo } from "@/lib/env";
import { setupStore } from "@/lib/store-setup";
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
    kind: l.kind === "limited" || l.kind === "soon" ? l.kind : "anchor", tag: l.tag ? String(l.tag).slice(0, 30) : null, listed: !!l.listed,
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
  try { await saveSettings(s); revalidateTag(CACHE_TAGS.settings, "max"); revalidatePath("/admin/settings"); return { ok: true }; } catch (e) { return fail(e); }
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
  } catch (e) { return { ...fail(e), log: lines }; }
}
