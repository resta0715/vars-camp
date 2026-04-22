import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  FolderOpen,
  Settings,
  ArrowLeft,
  BookOpen,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const sidebarItems = [
  { href: "/admin", icon: LayoutDashboard, label: "ダッシュボード" },
  { href: "/admin/members", icon: Users, label: "会員管理" },
  { href: "/admin/instructors", icon: GraduationCap, label: "講師管理" },
  { href: "/admin/seminars", icon: Calendar, label: "研修管理" },
  { href: "/admin/categories", icon: FolderOpen, label: "カテゴリ管理" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const DEV_EMAILS = ["mdit2416@gmail.com", "test@vars-camp.dev"];
  const isDevUser = DEV_EMAILS.includes(user.email || "");
  if (profile?.role !== "admin" && !isDevUser) redirect("/dashboard");

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 bg-white">
        <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-gray-900">vars camp</span>
            <span className="ml-1 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
              ADMIN
            </span>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-2">
            ログイン中: {profile?.full_name || user.email}
          </p>
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-3 w-3" />
            サイトに戻る
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 bg-gray-50 p-8">
        {children}
      </main>
    </div>
  );
}
