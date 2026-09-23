import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminOpen, isAdmin } from "@/lib/admin-auth";
import { env } from "@/lib/env";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false } };

export default async function LoginPage() {
  if (adminOpen() || (await isAdmin())) redirect("/admin/orders");
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "var(--surface-sunken)" }}>
      <LoginForm configured={!!env.adminPassword} />
    </div>
  );
}
