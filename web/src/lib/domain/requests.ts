// Payloads the browser sends to the checkout endpoints. Only identifiers and
// choices travel — every price is recomputed on the server.
import type { SelItem, ShopSizeId } from "./types";

export type RetailLine =
  | { kind: "stock"; skuId: string; sizeId: ShopSizeId; qty: number }
  | { kind: "blend"; name: string; sel: SelItem[]; roast: number | null; sizeId: ShopSizeId; qty: number };

export interface RetailCheckoutRequest { lines: RetailLine[] }
export interface CheckoutResponse { url?: string; orderName?: string; error?: string; demo?: boolean }

export interface ShipTo { company: string; contact: string; phone: string; line1: string; line2: string; city: string; state: string; zip: string }

export interface WholesaleOrderRequest {
  mode: "stock" | "blend";
  skuId?: string;
  sel?: SelItem[];
  roast?: number | null;
  blendName?: string;
  lbs: number;
  bagId: string;
  packId: "stock" | "label" | "own";
  labelSize?: string;
  artwork?: { fileId: string | null; filename: string } | null;
  ownBags?: number;
  ownEta?: string;
  needBy: string;
  ship: ShipTo;
  po?: string;
}
