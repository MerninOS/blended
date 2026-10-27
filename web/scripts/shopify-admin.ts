// Admin API client for the command-line scripts (the app uses src/lib/shopify/client.ts).
// Reads SHOPIFY_STORE_DOMAIN plus SHOPIFY_ADMIN_ACCESS_TOKEN, or SHOPIFY_CLIENT_ID/SECRET
// exchanged with the client-credentials grant.
const domain = process.env.SHOPIFY_STORE_DOMAIN;
const version = process.env.SHOPIFY_API_VERSION || "2026-07";

export function requireStore() {
  if (!domain || domain === "your-store.myshopify.com") {
    console.error("Set SHOPIFY_STORE_DOMAIN (and admin credentials) in .env.local or the environment");
    process.exit(1);
  }
  return domain;
}

let token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
async function getToken() {
  if (token) return token;
  const res = await fetch(`https://${requireStore()}/admin/oauth/access_token`, {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: process.env.SHOPIFY_CLIENT_ID!, client_secret: process.env.SHOPIFY_CLIENT_SECRET! }),
  });
  if (!res.ok) throw new Error(`token exchange failed: ${res.status} ${await res.text()}`);
  token = (await res.json()).access_token;
  return token!;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function adminQ(query: string, variables: Record<string, unknown> = {}): Promise<any> {
  const res = await fetch(`https://${requireStore()}/admin/api/${version}/graphql.json`, {
    method: "POST", headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": await getToken() },
    body: JSON.stringify({ query, variables }),
  });
  const j = await res.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors));
  return j.data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const check = (payload: any, what: string) => {
  if (payload?.userErrors?.length) throw new Error(`${what}: ${payload.userErrors.map((e: { message: string }) => e.message).join("; ")}`);
};
