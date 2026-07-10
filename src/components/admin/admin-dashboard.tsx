"use client";

import { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  Calendar,
  CreditCard,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleSwitcher } from "@/components/admin/role-switcher";
import { createClient } from "@/lib/supabase/client";

interface MemberRow {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
}

interface SeminarRow {
  id: string;
  title: string;
  is_approved: boolean;
  instructor: { full_name: string } | null;
  category: { name: string } | null;
}

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ id: string; role: string } | null>(null);
  const [stats, setStats] = useState({
    totalMembers: 0,
    subscribers: 0,
    instructors: 0,
    totalSeminars: 0,
    pendingSeminars: 0,
    totalBookings: 0,
  });
  const [recentMembers, setRecentMembers] = useState<MemberRow[]>([]);
  const [upcomingSeminars, setUpcomingSeminars] = useState<SeminarRow[]>([]);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .single();
      if (prof) setProfile(prof);

      const [
        { count: totalMembers },
        { count: subscribers },
        { count: instructors },
        { count: totalSeminars },
        { count: pendingSeminars },
        { count: totalBookings },
        { data: members },
        { data: seminars },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "subscriber"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "instructor"),
        supabase.from("seminars").select("*", { count: "exact", head: true }),
        supabase
          .from("seminars")
          .select("*", { count: "exact", head: true })
          .eq("is_published", true)
          .eq("is_approved", false),
        supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
        supabase
          .from("profiles")
          .select("id, full_name, email, role")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("seminars")
          .select(`
            id, title, is_approved,
            instructor:profiles!seminars_instructor_id_fkey(full_name),
            category:categories!seminars_category_id_fkey(name)
          `)
          .eq("is_published", true)
          .gte("scheduled_at", new Date().toISOString())
          .order("scheduled_at", { ascending: true })
          .limit(5),
      ]);

      setStats({
        totalMembers: totalMembers || 0,
        subscribers: subscribers || 0,
        instructors: instructors || 0,
        totalSeminars: totalSeminars || 0,
        pendingSeminars: pendingSeminars || 0,
        totalBookings: totalBookings || 0,
      });
      setRecentMembers((members as MemberRow[]) || []);
      setUpcomingSeminars((seminars as SeminarRow[]) || []);
      setLoading(false);
    })();
  }, []);

  const statCards = [
    { label: "総会員数", value: stats.totalMembers, icon: Users, color: "bg-blue-100 text-blue-600" },
    { label: "サブスク会員", value: stats.subscribers, icon: CreditCard, color: "bg-brand-100 text-brand-600" },
    { label: "講師", value: stats.instructors, icon: GraduationCap, color: "bg-green-100 text-green-600" },
    { label: "研修数", value: stats.totalSeminars, icon: Calendar, color: "bg-orange-100 text-orange-600" },
    { label: "承認待ち", value: stats.pendingSeminars, icon: TrendingUp, color: "bg-red-100 text-red-600" },
    { label: "予約数", value: stats.totalBookings, icon: UserPlus, color: "bg-cyan-100 text-cyan-600" },
  ];

  const roleLabel = (role: string) => {
    if (role === "admin") return "管理者";
    if (role === "instructor") return "講師";
    if (role === "subscriber") return "サブスク";
    return "無料";
  };

  const roleColor = (role: string) => {
    if (role === "admin") return "bg-red-100 text-red-700";
    if (role === "instructor") return "bg-green-100 text-green-700";
    if (role === "subscriber") return "bg-brand-100 text-brand-700";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">管理者ダッシュボード</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-white p-6">
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
            ))
          : statCards.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {profile && (
        <div className="mb-8">
          <RoleSwitcher currentRole={profile.role} userId={profile.id} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">最新の会員</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : recentMembers.length === 0 ? (
              <p className="text-sm text-gray-400">まだ会員がいません</p>
            ) : (
              <div className="space-y-3">
                {recentMembers.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {m.full_name || "名前未設定"}
                      </p>
                      <p className="text-xs text-gray-500">{m.email}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${roleColor(m.role)}`}
                    >
                      {roleLabel(m.role)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">今後の研修</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : upcomingSeminars.length === 0 ? (
              <p className="text-sm text-gray-400">予定されている研修はありません</p>
            ) : (
              <div className="space-y-3">
                {upcomingSeminars.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.title}</p>
                      <p className="text-xs text-gray-500">
                        {s.instructor?.full_name} ・ {s.category?.name}
                      </p>
                    </div>
                    {!s.is_approved && (
                      <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                        承認待ち
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
