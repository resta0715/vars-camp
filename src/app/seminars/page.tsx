import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Calendar, Clock, Video, MapPin, Play, Users, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const revalidate = 60;

export const metadata = {
  title: "研修一覧 | vars camp",
};

const typeLabels: Record<string, { label: string; variant: "realtime" | "ondemand" | "inperson" }> = {
  realtime: { label: "ライブ", variant: "realtime" },
  ondemand: { label: "オンデマンド", variant: "ondemand" },
  in_person: { label: "会場開催", variant: "inperson" },
};

export default async function SeminarsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const [profileResult, { data: seminars }, { data: categories }] = await Promise.all([
    user
      ? supabase.from("profiles").select("full_name, avatar_url, role, email").eq("id", user.id).single()
      : Promise.resolve({ data: null }),
    supabase
      .from("seminars")
      .select(`
        *,
        instructor:profiles!seminars_instructor_id_fkey(full_name, avatar_url),
        category:categories!seminars_category_id_fkey(name, color)
      `)
      .eq("is_published", true)
      .order("scheduled_at", { ascending: true }),
    supabase.from("categories").select("*").order("sort_order"),
  ]);
  const profile = profileResult?.data || null;

  const upcomingSeminars = (seminars || []).filter(
    (s) => s.seminar_type !== "ondemand" && s.scheduled_at && new Date(s.scheduled_at) > new Date()
  );
  const ondemandSeminars = (seminars || []).filter(
    (s) => s.seminar_type === "ondemand"
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={profile} />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">研修一覧</h1>
            <p className="mt-2 text-gray-500">
              あなたのサロンの成長に必要な研修を見つけましょう。
            </p>
          </div>

          {/* Upcoming Live/In-Person */}
          <section className="mb-12">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
              <Calendar className="h-5 w-5 text-brand-500" />
              今後のライブ研修
            </h2>
            {upcomingSeminars.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-400">現在予定されている研修はありません</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingSeminars.map((s) => {
                  const typeInfo = typeLabels[s.seminar_type];
                  const instructor = s.instructor as any;
                  const category = s.category as any;
                  return (
                    <Link key={s.id} href={`/seminars/${s.id}`}>
                      <Card className="h-full hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-3">
                            <Badge variant={typeInfo?.variant}>{typeInfo?.label}</Badge>
                            {s.price === 0 ? (
                              <Badge variant="secondary">無料</Badge>
                            ) : (
                              <span className="text-sm font-semibold text-gray-700">
                                ¥{s.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                          {category && (
                            <span
                              className="inline-block rounded px-2 py-0.5 text-[10px] font-medium text-white mb-2"
                              style={{ backgroundColor: category.color }}
                            >
                              {category.name}
                            </span>
                          )}
                          <h3 className="font-semibold text-gray-900 line-clamp-2">
                            {s.title}
                          </h3>
                          <div className="mt-3 space-y-1.5">
                            {s.scheduled_at && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(s.scheduled_at), "M/d（E）HH:mm", { locale: ja })}
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {s.duration_minutes}分
                            </div>
                            {s.seminar_type === "realtime" && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Video className="h-3 w-3" />
                                Zoom
                              </div>
                            )}
                          </div>
                          {instructor?.full_name && (
                            <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 border-t border-gray-100 pt-3">
                              <Users className="h-3 w-3" />
                              {instructor.full_name}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* On-demand */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
              <Play className="h-5 w-5 text-blue-500" />
              オンデマンド動画
            </h2>
            {ondemandSeminars.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-400">オンデマンド動画はまだありません</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ondemandSeminars.map((s) => {
                  const category = s.category as any;
                  const instructor = s.instructor as any;
                  return (
                    <Link key={s.id} href={`/seminars/${s.id}`}>
                      <Card className="h-full hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-3">
                            <Badge variant="ondemand">オンデマンド</Badge>
                            {s.price === 0 ? (
                              <Badge variant="secondary">無料</Badge>
                            ) : (
                              <span className="text-sm font-semibold text-gray-700">
                                ¥{s.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-900 line-clamp-2">
                            {s.title}
                          </h3>
                          {category && (
                            <span className="mt-2 inline-block text-xs text-gray-500">
                              {category.name}
                            </span>
                          )}
                          {instructor?.full_name && (
                            <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 border-t border-gray-100 pt-3">
                              <Users className="h-3 w-3" />
                              {instructor.full_name}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
