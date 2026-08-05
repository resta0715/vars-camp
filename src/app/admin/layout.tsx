import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { canAccessAdmin } from "@/lib/admin-access";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!canAccessAdmin(profile?.role, user.email)) {
    redirect("/dashboard");
  }

  const userLabel = profile?.full_name || user.email || "";

  return <AdminShell userLabel={userLabel}>{children}</AdminShell>;
}
