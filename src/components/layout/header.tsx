"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, Calendar, BookOpen, LogIn, LogOut, Shield, GraduationCap, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const DEV_EMAILS = ["mdit2416@gmail.com"];

interface HeaderProps {
  user?: { full_name: string; avatar_url: string; role: string; email?: string } | null;
}

export function Header({ user }: HeaderProps) {
  const isDevUser = user ? DEV_EMAILS.includes(user.email || "") : false;
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-brand">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">
            vars <span className="text-brand-600">camp</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/schedule"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
          >
            <Calendar className="h-4 w-4" />
            研修スケジュール
          </Link>
          <Link
            href="/seminars"
            className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
          >
            研修一覧
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              {(user.role === "admin" || isDevUser) && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
                    <Shield className="mr-1.5 h-3.5 w-3.5" />
                    管理パネル
                  </Button>
                </Link>
              )}
              {(user.role === "instructor" || user.role === "admin" || isDevUser) && (
                <Link href="/instructor">
                  <Button variant="outline" size="sm">
                    <GraduationCap className="mr-1.5 h-3.5 w-3.5" />
                    講師パネル
                  </Button>
                </Link>
              )}
              <Link href="/dashboard">
                <Button size="sm">
                  <User className="mr-1.5 h-3.5 w-3.5" />
                  マイページ
                </Button>
              </Link>
              <button
                onClick={handleLogout}
                className="ml-1 rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                title="ログアウト"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  <LogIn className="mr-1.5 h-4 w-4" />
                  ログイン
                </Button>
              </Link>
              <Link href="/auth/login?mode=signup">
                <Button size="sm">無料で始める</Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link
              href="/schedule"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => setMobileOpen(false)}
            >
              研修スケジュール
            </Link>
            <Link
              href="/seminars"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => setMobileOpen(false)}
            >
              研修一覧
            </Link>
            {user ? (
              <>
                {(user.role === "admin" || isDevUser) && (
                  <Link
                    href="/admin"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    onClick={() => setMobileOpen(false)}
                  >
                    管理パネル
                  </Link>
                )}
                {(user.role === "instructor" || user.role === "admin" || isDevUser) && (
                  <Link
                    href="/instructor"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setMobileOpen(false)}
                  >
                    講師パネル
                  </Link>
                )}
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full" size="sm">
                    マイページ
                  </Button>
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 text-left"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                <Button className="w-full" size="sm">
                  ログイン / 無料登録
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
