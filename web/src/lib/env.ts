import "server-only";

// All Shopify/secret config is read server-side only. When the store isn't
// configured the app runs in demo mode on the design's fixture data.
const v = (k: string) => process.env[k]?.trim() || undefined;
/** "example.com/" → "https://example.com" (localhost keeps http). */
const origin = (u: string) => (/^https?:\/\//i.test(u) ? u : `${/^(localhost|127\.0\.0\.1)(:|$)/.test(u) ? "http" : "https"}://${u}`).replace(/\/+$/, "");

export const env = {
  storeDomain: v("SHOPIFY_STORE_DOMAIN"),                 // "blended.myshopify.com"
  apiVersion: v("SHOPIFY_API_VERSION") || "2026-07",
  storefrontToken: v("SHOPIFY_STOREFRONT_PRIVATE_TOKEN"),  // Headless channel, private token
  adminToken: v("SHOPIFY_ADMIN_ACCESS_TOKEN"),             // static token, or…
  adminClientId: v("SHOPIFY_CLIENT_ID"),                   // …Dev Dashboard app credentials
  adminClientSecret: v("SHOPIFY_CLIENT_SECRET"),           // (also the webhook HMAC secret)
  webhookSecret: v("SHOPIFY_WEBHOOK_SECRET") || v("SHOPIFY_CLIENT_SECRET"),
  customerClientId: v("SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID"),
  customerClientSecret: v("SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET"), // optional: confidential client
  appUrl: origin(v("APP_URL") || v("NEXT_PUBLIC_SITE_URL") || v("VERCEL_PROJECT_PRODUCTION_URL") || "localhost:3000"),
  sessionSecret: v("SESSION_SECRET"),
  adminPassword: v("ADMIN_PASSWORD"),
  stockCollection: v("SHOPIFY_STOCK_COLLECTION") || "our-coffees",
  locationId: v("SHOPIFY_LOCATION_ID"),                   // where green is counted; default: primary location
  wholesaleTag: v("SHOPIFY_WHOLESALE_TAG") || "wholesale",
  currency: v("SHOPIFY_CURRENCY") || "USD",
  isProd: process.env.NODE_ENV === "production",
};

export const hasStorefront = () => !!(env.storeDomain && env.storefrontToken);
export const hasAdmin = () => !!(env.storeDomain && (env.adminToken || (env.adminClientId && env.adminClientSecret)));
export const hasCustomerAccounts = () => !!(env.storeDomain && env.customerClientId);
/** Demo mode: no store connected, the app serves the design fixtures. */
export const isDemo = () => !hasStorefront() || !hasAdmin();

export function sessionSecret(): string {
  if (env.sessionSecret) return env.sessionSecret;
  if (env.isProd) throw new Error("SESSION_SECRET must be set in production");
  return "dev-only-insecure-session-secret-change-me";
}
