// Web Crypto helpers (work in route handlers, server actions and proxy.ts).
// Cookies holding tokens are AES-GCM encrypted; flag cookies are HMAC-signed.

const enc = new TextEncoder();
const dec = new TextDecoder();

const b64u = (buf: ArrayBuffer | Uint8Array) => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = ""; bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const unb64u = (s: string) => {
  const b = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4));
  return Uint8Array.from(b, (c) => c.charCodeAt(0));
};

async function keyFor(secret: string, usage: "enc" | "sig") {
  const raw = await crypto.subtle.digest("SHA-256", enc.encode(`${usage}:${secret}`));
  return usage === "enc"
    ? crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"])
    : crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function seal(data: unknown, secret: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await keyFor(secret, "enc"), enc.encode(JSON.stringify(data)));
  return `${b64u(iv)}.${b64u(ct)}`;
}

export async function unseal<T>(token: string | undefined, secret: string): Promise<T | null> {
  if (!token) return null;
  try {
    const [iv, ct] = token.split(".");
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64u(iv) }, await keyFor(secret, "enc"), unb64u(ct));
    return JSON.parse(dec.decode(pt)) as T;
  } catch { return null; }
}

export async function sign(payload: string, secret: string): Promise<string> {
  const sig = await crypto.subtle.sign("HMAC", await keyFor(secret, "sig"), enc.encode(payload));
  return `${b64u(enc.encode(payload))}.${b64u(sig)}`;
}

export async function verify(token: string | undefined, secret: string): Promise<string | null> {
  if (!token) return null;
  try {
    const [p, s] = token.split(".");
    const payload = unb64u(p);
    const ok = await crypto.subtle.verify("HMAC", await keyFor(secret, "sig"), unb64u(s), payload);
    return ok ? dec.decode(payload) : null;
  } catch { return null; }
}

export const randomString = (bytes = 32) => b64u(crypto.getRandomValues(new Uint8Array(bytes)));
export const sha256b64u = async (s: string) => b64u(await crypto.subtle.digest("SHA-256", enc.encode(s)));

/** Constant-time compare of Shopify webhook HMAC (base64). */
export async function verifyShopifyHmac(body: string, hmacHeader: string | null, secret: string) {
  if (!hmacHeader) return false;
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(body)));
  let expected = ""; mac.forEach((b) => (expected += String.fromCharCode(b)));
  const a = btoa(expected), b = hmacHeader;
  if (a.length !== b.length) return false;
  let diff = 0; for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
