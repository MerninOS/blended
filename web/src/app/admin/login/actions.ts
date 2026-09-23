"use server";
import { redirect } from "next/navigation";
import { startAdminSession } from "@/lib/admin-auth";

export async function login(_: { error: string | null }, form: FormData): Promise<{ error: string | null }> {
  const ok = await startAdminSession(String(form.get("password") ?? ""));
  if (!ok) return { error: "That password isn't right." };
  redirect("/admin/orders");
}
