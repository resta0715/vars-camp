import { createClient } from "@/lib/supabase/server";
import { Users, GraduationCap, Calendar, CreditCard, TrendingUp, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleSwitcher } from "@/components/admin/role-switcher";

export const metadata = { title: "管理者ダッシュボード | vars camp" };

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user?.id || "")
    .single();

  const { count: totalMembers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: subscribers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "subscriber");

  const { count: instructors } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "instructor");

  const { count: totalSeminars } = await supabase
    .from("seminars")
    .select("*", { count: "exact", head: true });

  const { count: pendingSeminars } = await supabase
    .from("seminars")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true)
    .eq("is_approved", false);

  const { count: totalBookings } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("status", "confirmed");

  const stats = [
    { label: "総会員数", value: totalMembers || 0, icon: Users, color: "bg-blue-100 text-blue-600" },
    { label: "サブスク会員", value: subscribers || 0, icon: CreditCard, color: "bg-brand-100 text-brand-600" },
    { label: "講師", value: instructors || 0, icon: GraduationCap, color: "bg-green-100 text-green-600" },
    { label: "研修数", value: totalSeminars || 0, icon: Calendar, color: "bg-orange-100 text-orange-600" },
    { label: "承認待ち", value: pendingSeminars || 0, icon: TrendingUp, color: "bg-red-100 text-red-600" },
    { label: "予約数", value: totalBookings || 0, icon: UserPlus, color: "bg-cyan-100 text-cyan-600" },
  ];

  // 最新の会員
  const { data: recentMembers } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, salon_name, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  // 今後の研修
  const { data: upcomingSeminars } = await supabase
    .from("seminars")
    .select(`
      id, title, scheduled_at, seminar_type, is_approved,
      instructor:profiles!seminars_instructor_id_fkey(full_name),
      category:categories!seminars_category_id_fkey(name, color)
    `)
    .eq("is_published", true)
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(5);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">管理者ダッシュボード</h1>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {stats.map((stat) => (
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

      {/* Dev Role Switcher */}
      {profile && (
        <div className="mb-8">
          <RoleSwitcher currentRole={profile.role} userId={profile.id} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Members */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">最新の会員</CardTitle>
          </CardHeader>
          <CardContent>
            {!recentMembers || recentMembers.length === 0 ? (
              <p className="text-sm text-gray-400">まだ会員がいません</p>
            ) : (
              <div className="space-y-3">
                {recentMembers.map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {m.full_name || "名前未設定"}
                      </p>
                      <p className="text-xs text-gray-500">{m.email}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      m.role === "admin" ? "bg-red-100 text-red-700" :
                      m.role === "instructor" ? "bg-green-100 text-green-700" :
                      m.role === "subscriber" ? "bg-brand-100 text-brand-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {m.role === "admin" ? "管理者" :
                       m.role === "instructor" ? "講師" :
                       m.role === "subscriber" ? "サブスク" : "無料"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Seminars */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">今後の研修</CardTitle>
          </CardHeader>
          <CardContent>
            {!upcomingSeminars || upcomingSeminars.length === 0 ? (
              <p className="text-sm text-gray-400">予定されている研修はありません</p>
            ) : (
              <div className="space-y-3">
                {upcomingSeminars.map((s) => {
                  const cat = s.category as any;
                  const inst = s.instructor as any;
                  return (
                    <div key={s.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{s.title}</p>
                        <p className="text-xs text-gray-500">
                          {inst?.full_name} ・ {cat?.name}
                        </p>
                      </div>
                      {!s.is_approved && (
                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                          承認待ち
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
