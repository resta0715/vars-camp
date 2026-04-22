import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Plus, Calendar, Users, BarChart3, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "講師パネル | vars camp",
};

export default async function InstructorDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || !["instructor", "admin"].includes(profile.role)) {
    redirect("/dashboard");
  }

  // 自分の研修一覧
  const { data: mySeminars } = await supabase
    .from("seminars")
    .select(`
      *,
      category:categories!seminars_category_id_fkey(name, color),
      bookings:bookings(count)
    `)
    .eq("instructor_id", user.id)
    .order("scheduled_at", { ascending: false })
    .limit(20);

  const upcomingSeminars = (mySeminars || []).filter(
    (s) => s.scheduled_at && new Date(s.scheduled_at) > new Date()
  );
  const pastSeminars = (mySeminars || []).filter(
    (s) => s.scheduled_at && new Date(s.scheduled_at) <= new Date()
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header user={profile} />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">講師パネル</h1>
              <p className="mt-1 text-gray-500">研修の作成・管理ができます</p>
            </div>
            <Link href="/instructor/seminars/new">
              <Button>
                <Plus className="mr-1.5 h-4 w-4" />
                新しい研修を作成
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
                    <Calendar className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{upcomingSeminars.length}</p>
                    <p className="text-xs text-gray-500">予定の研修</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{pastSeminars.length}</p>
                    <p className="text-xs text-gray-500">実施済み</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {(mySeminars || []).reduce(
                        (sum, s) => sum + ((s.bookings as any)?.[0]?.count || 0),
                        0
                      )}
                    </p>
                    <p className="text-xs text-gray-500">総予約数</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {(mySeminars || []).reduce((sum, s) => sum + s.duration_minutes, 0)}分
                    </p>
                    <p className="text-xs text-gray-500">総研修時間</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Seminars */}
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            今後の研修
          </h2>
          {upcomingSeminars.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-4 text-gray-500">今後の研修はまだありません</p>
                <Link href="/instructor/seminars/new" className="mt-4 inline-block">
                  <Button size="sm">最初の研修を作成</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {upcomingSeminars.map((seminar) => (
                <Link key={seminar.id} href={`/instructor/seminars/${seminar.id}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="flex items-center gap-4 py-4">
                      <div
                        className="flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center rounded-lg text-white text-xs font-bold"
                        style={{ backgroundColor: (seminar.category as any)?.color || "#9333ea" }}
                      >
                        {seminar.scheduled_at && (
                          <>
                            <span>{format(new Date(seminar.scheduled_at), "M/d")}</span>
                            <span className="text-[10px] opacity-80">
                              {format(new Date(seminar.scheduled_at), "HH:mm")}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {seminar.title}
                          </h3>
                          {!seminar.is_published && (
                            <Badge variant="secondary">非公開</Badge>
                          )}
                          {!seminar.is_approved && seminar.is_published && (
                            <Badge variant="outline">承認待ち</Badge>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {(seminar.category as any)?.name} ・ {seminar.duration_minutes}分 ・ 
                          予約 {(seminar.bookings as any)?.[0]?.count || 0}名
                          {seminar.capacity && ` / ${seminar.capacity}名`}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
