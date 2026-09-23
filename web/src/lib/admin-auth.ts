import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sign, verify } from "@/lib/crypto";
import { env, sessionSecret } from "@/lib/env";

export const ADMIN_COOKIE = "blended_admin";
const TTL = 60 * 60 * 12; // 12h

/** Admin is open in local demo mode only when no password has been set. */
export const adminOpen = () => !env.adminPassword && !env.isProd;

export async function isAdmin(): Promise<boolean> {
  if (adminOpen()) return true;
  const v = await verify((await cookies()).get(ADMIN_COOKIE)?.value, sessionSecret());
  return !!v && v.startsWith("admin:") && Number(v.slice(6)) > Date.now();
}

/** Data-access guard: call at the top of every admin page and server action. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function startAdminSession(password: string): Promise<boolean> {
  const expected = env.adminPassword;
  if (!expected) return adminOpen();
  const a = new TextEncoder().encode(password), b = new TextEncoder().encode(expected);
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  if (diff !== 0) return false;
  (await cookies()).set(ADMIN_COOKIE, await sign(`admin:${Date.now() + TTL * 1000}`, sessionSecret()), {
    httpOnly: true, secure: env.isProd, sameSite: "lax", path: "/", maxAge: TTL,
  });
  return true;
}

export async function endAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}
