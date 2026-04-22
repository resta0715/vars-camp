import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Calendar, Clock, Video, MapPin, Play, BookOpen, Settings,
  ArrowRight, Sparkles, TrendingUp, CreditCard,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoleSwitcher } from "@/components/admin/role-switcher";

const DEV_EMAILS = ["mdit2416@gmail.com", "test@vars-camp.dev"];

export const metadata = {
  title: "マイページ | vars camp",
};

const typeLabels: Record<string, { label: string; variant: "realtime" | "ondemand" | "inperson" }> = {
  realtime: { label: "ライブ", variant: "realtime" },
  ondemand: { label: "オンデマンド", variant: "ondemand" },
  in_person: { label: "会場", variant: "inperson" },
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

  const [
    { data: subscription },
    { data: upcomingBookings },
    { data: recommendedSeminars },
    { data: ondemandSeminars },
  ] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single(),
    supabase
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
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("seminars")
      .select(`
        *,
        instructor:profiles!seminars_instructor_id_fkey(full_name, avatar_url),
        category:categories!seminars_category_id_fkey(name, color)
      `)
      .eq("is_published", true)
      .eq("is_approved", true)
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(4),
    supabase
      .from("seminars")
      .select(`
        *,
        category:categories!seminars_category_id_fkey(name, color)
      `)
      .eq("is_published", true)
      .eq("seminar_type", "ondemand")
      .limit(3),
  ]);

  const isSubscriber = profile.role === "subscriber" || !!subscription;
  const isDevUser = DEV_EMAILS.includes(profile.email || "");
  const greeting = new Date().getHours() < 12 ? "おはようございます" : new Date().getHours() < 18 ? "こんにちは" : "こんばんは";

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={profile} />

      {isDevUser && (
        <div className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <RoleSwitcher currentRole={profile.role} userId={profile.id} />
        </div>
      )}

      <main className="flex-1 bg-gray-50">
        {/* Hero Banner */}
        <div className="gradient-hero">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-brand-200 text-sm">{greeting}</p>
                <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                  {profile.full_name || "ゲスト"}さん
                </h1>
                <p className="mt-1 text-brand-200 text-sm">
                  {profile.salon_name || ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className={`rounded-xl px-4 py-2 ${isSubscriber ? "bg-white/20" : "bg-white/10"}`}>
                  <p className="text-xs text-brand-200">現在のプラン</p>
                  <p className="text-sm font-bold text-white">
                    {isSubscriber ? "サブスク会員" : "無料会員"}
                  </p>
                </div>
                {!isSubscriber && (
                  <Link href="/pricing">
                    <Button size="sm" className="bg-white text-brand-700 hover:bg-brand-50">
                      <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                      アップグレード
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Quick Actions */}
          <div className="mb-8 grid gap-3 sm:grid-cols-4">
            <Link href="/schedule" className="group">
              <Card className="h-full hover:shadow-md hover:border-brand-200 transition-all">
                <CardContent className="flex items-center gap-3 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 group-hover:bg-brand-200 transition-colors">
                    <Calendar className="h-5 w-5 text-brand-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">スケジュール</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/seminars" className="group">
              <Card className="h-full hover:shadow-md hover:border-brand-200 transition-all">
                <CardContent className="flex items-center gap-3 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors">
                    <BookOpen className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">研修を探す</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/seminars?type=ondemand" className="group">
              <Card className="h-full hover:shadow-md hover:border-brand-200 transition-all">
                <CardContent className="flex items-center gap-3 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                    <Play className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">オンデマンド</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/settings" className="group">
              <Card className="h-full hover:shadow-md hover:border-brand-200 transition-all">
                <CardContent className="flex items-center gap-3 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                    <Settings className="h-5 w-5 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">プロフィール設定</span>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              {/* Upcoming Bookings */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-brand-500" />
                    予約中の研修
                  </h2>
                </div>
                {!upcomingBookings || upcomingBookings.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-10 text-center">
                      <Calendar className="mx-auto h-10 w-10 text-gray-300" />
                      <p className="mt-3 text-sm text-gray-500">予約中の研修はありません</p>
                      <Link href="/schedule" className="mt-4 inline-block">
                        <Button variant="outline" size="sm">
                          スケジュールを見る
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
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
                          <Card className="hover:shadow-md transition-all hover:border-brand-200">
                            <CardContent className="flex items-center gap-4 py-4">
                              <div
                                className="flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center rounded-xl text-white text-xs font-bold"
                                style={{ backgroundColor: seminar.category?.color || "#9333ea" }}
                              >
                                {seminar.scheduled_at && (
                                  <>
                                    <span className="text-sm">{format(new Date(seminar.scheduled_at), "M/d")}</span>
                                    <span className="text-[10px] opacity-80">{format(new Date(seminar.scheduled_at), "E", { locale: ja })}</span>
                                  </>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate">{seminar.title}</h3>
                                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {seminar.scheduled_at && format(new Date(seminar.scheduled_at), "HH:mm")}
                                    〜 {seminar.duration_minutes}分
                                  </span>
                                  {seminar.seminar_type === "realtime" && (
                                    <span className="flex items-center gap-1"><Video className="h-3 w-3" />Zoom</span>
                                  )}
                                  {seminar.seminar_type === "in_person" && seminar.location && (
                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{seminar.location}</span>
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
              </section>

              {/* Recommended Seminars */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-orange-500" />
                    おすすめの研修
                  </h2>
                  <Link href="/seminars" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
                    すべて見る <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {(recommendedSeminars || []).map((s) => {
                    const typeInfo = typeLabels[s.seminar_type];
                    const cat = s.category as any;
                    const inst = s.instructor as any;
                    return (
                      <Link key={s.id} href={`/seminars/${s.id}`}>
                        <Card className="h-full hover:shadow-md transition-all hover:border-brand-200">
                          <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant={typeInfo?.variant}>{typeInfo?.label}</Badge>
                              {s.price === 0 ? (
                                <Badge variant="secondary">無料</Badge>
                              ) : isSubscriber ? (
                                <Badge className="bg-brand-100 text-brand-700 border-0">会員無料</Badge>
                              ) : (
                                <span className="text-xs font-semibold text-gray-600">¥{s.price.toLocaleString()}</span>
                              )}
                            </div>
                            {cat && (
                              <span className="inline-block rounded px-2 py-0.5 text-[10px] font-medium text-white mb-2" style={{ backgroundColor: cat.color }}>
                                {cat.name}
                              </span>
                            )}
                            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{s.title}</h3>
                            <div className="mt-2 space-y-1">
                              {s.scheduled_at && (
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(s.scheduled_at), "M/d（E）HH:mm", { locale: ja })}
                                </p>
                              )}
                              {inst?.full_name && (
                                <p className="text-xs text-gray-400">講師: {inst.full_name}</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* On-demand */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Play className="h-4 w-4 text-blue-500" />
                    オンデマンド動画
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!ondemandSeminars || ondemandSeminars.length === 0 ? (
                    <p className="text-sm text-gray-400">動画はまだありません</p>
                  ) : (
                    <div className="space-y-3">
                      {ondemandSeminars.map((s) => {
                        const cat = s.category as any;
                        return (
                          <Link key={s.id} href={`/seminars/${s.id}`} className="block group">
                            <div className="flex items-start gap-3 rounded-lg p-2 -mx-2 hover:bg-gray-50 transition-colors">
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                                <Play className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-brand-600">
                                  {s.title}
                                </p>
                                {cat && <p className="text-[10px] text-gray-400 mt-0.5">{cat.name}</p>}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Subscription CTA (for free users) */}
              {!isSubscriber && (
                <Card className="border-brand-200 bg-gradient-to-br from-brand-50 to-white">
                  <CardContent className="pt-6">
                    <TrendingUp className="h-8 w-8 text-brand-500 mb-3" />
                    <h3 className="font-bold text-gray-900">サブスク会員になる</h3>
                    <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                      月額¥9,800で全研修が見放題。ライブもオンデマンドも、すべてのコンテンツにアクセスできます。
                    </p>
                    <Link href="/pricing" className="mt-4 block">
                      <Button size="sm" className="w-full">
                        詳しく見る
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
