"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarClock, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { AvailabilitySlotsPanel } from "@/components/scheduling/availability-slots-panel";
import { InstructorHoldsPanel } from "@/components/scheduling/instructor-holds-panel";
import { createClient } from "@/lib/supabase/client";

export default function InstructorAvailabilityPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth/login?redirect=/instructor/availability");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (!profile || !["instructor", "admin"].includes(profile.role)) {
        router.replace("/dashboard");
        return;
      }
      setUserId(user.id);
      setLoading(false);
    })();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-400">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        読み込み中...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/instructor"
            className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            講師パネルに戻る
          </Link>

          <div className="mb-8">
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <CalendarClock className="h-7 w-7 text-brand-600" />
              スケジュール管理
            </h1>
            <p className="mt-1 text-gray-500">
              予約可能な公開枠の設定と、研修確定前の仮予約（時間ブロック）ができます。
            </p>
          </div>

          <section className="mb-12">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">公開枠（予約可能な時間帯）</h2>
            {userId && <AvailabilitySlotsPanel instructorId={userId} selfManaged />}
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">仮予約（時間を押さえる）</h2>
            {userId && <InstructorHoldsPanel instructorId={userId} />}
          </section>
        </div>
      </main>
    </div>
  );
}
