import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Calendar, Clock, Video, MapPin, Play, BookOpen, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "マイページ | vars camp",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/auth/login");

  // サブスクリプション状態を取得
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  // 予約した研修（今後の分）
  const { data: upcomingBookings } = await supabase
    .from("bookings")
    .select(`
      *,
      seminar:seminars!bookings_seminar_id_fkey(
        *,
        instructor:profiles!seminars_instructor_id_fkey(full_name, avatar_url),
        category:categories!seminars_category_id_fkey(name, color)
      )
    `)
    .eq("user_id", user.id)
    .eq("status", "confirmed")
    .gte("seminar.scheduled_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(5);

  const isSubscriber = profile.role === "subscriber" || !!subscription;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header user={profile} />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Welcome */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                こんにちは、{profile.full_name || "ゲスト"}さん
              </h1>
              <p className="mt-1 text-gray-500">
                {profile.salon_name || "サロン名未設定"}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard/settings">
                <Button variant="outline" size="sm">
                  <Settings className="mr-1.5 h-4 w-4" />
                  設定
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Plan Status */}
            <Card className={isSubscriber ? "border-brand-200 bg-brand-50/30" : ""}>
              <CardHeader>
                <CardTitle className="text-base">現在のプラン</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant={isSubscriber ? "default" : "secondary"}>
                      {isSubscriber ? "サブスク会員" : "無料会員"}
                    </Badge>
                    {isSubscriber && subscription?.current_period_end && (
                      <p className="mt-2 text-xs text-gray-500">
                        次回更新: {format(new Date(subscription.current_period_end), "yyyy/MM/dd")}
                      </p>
                    )}
                  </div>
                  {!isSubscriber && (
                    <Link href="/pricing">
                      <Button size="sm">アップグレード</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">クイックアクション</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/schedule" className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50 transition-colors">
                  <Calendar className="h-5 w-5 text-brand-500" />
                  <span className="text-sm font-medium">スケジュールを見る</span>
                </Link>
                <Link href="/seminars?type=ondemand" className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50 transition-colors">
                  <Play className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium">オンデマンド動画</span>
                </Link>
                <Link href="/seminars" className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50 transition-colors">
                  <BookOpen className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">研修を探す</span>
                </Link>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">受講状況</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-brand-600">
                      {upcomingBookings?.length || 0}
                    </p>
                    <p className="text-xs text-gray-500">予約中</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">0</p>
                    <p className="text-xs text-gray-500">受講済み</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Seminars */}
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              予約中の研修
            </h2>
            {!upcomingBookings || upcomingBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-4 text-gray-500">予約中の研修はありません</p>
                  <Link href="/schedule" className="mt-4 inline-block">
                    <Button variant="outline" size="sm">
                      スケジュールを見る
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map((booking) => {
                  const seminar = booking.seminar as any;
                  if (!seminar) return null;
                  return (
                    <Link key={booking.id} href={`/seminars/${seminar.id}`}>
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="flex items-center gap-4 py-4">
                          <div
                            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg text-white text-sm font-bold"
                            style={{ backgroundColor: seminar.category?.color || "#9333ea" }}
                          >
                            {seminar.scheduled_at &&
                              format(new Date(seminar.scheduled_at), "M/d")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {seminar.title}
                            </h3>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {seminar.scheduled_at &&
                                  format(new Date(seminar.scheduled_at), "HH:mm")}
                                〜 {seminar.duration_minutes}分
                              </span>
                              {seminar.seminar_type === "realtime" && (
                                <span className="flex items-center gap-1">
                                  <Video className="h-3 w-3" />
                                  Zoom
                                </span>
                              )}
                              {seminar.seminar_type === "in_person" && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {seminar.location}
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge variant="realtime">予約済み</Badge>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
