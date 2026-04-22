import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  ArrowLeft, Calendar, Clock, MapPin, Video, Users, Tag,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingButton } from "@/components/seminars/booking-button";

const typeLabels: Record<string, { label: string; variant: "realtime" | "ondemand" | "inperson" }> = {
  realtime: { label: "ライブ研修", variant: "realtime" },
  ondemand: { label: "オンデマンド", variant: "ondemand" },
  in_person: { label: "会場開催", variant: "inperson" },
};

export default async function SeminarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  const { data: seminar } = await supabase
    .from("seminars")
    .select(`
      *,
      instructor:profiles!seminars_instructor_id_fkey(id, full_name, avatar_url, bio, salon_name),
      category:categories!seminars_category_id_fkey(id, name, slug, color)
    `)
    .eq("id", id)
    .single();

  if (!seminar) notFound();

  // 予約数
  const { count: bookingCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("seminar_id", id)
    .eq("status", "confirmed");

  // ユーザーの予約状態
  let userBooking = null;
  if (user) {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("seminar_id", id)
      .eq("user_id", user.id)
      .eq("status", "confirmed")
      .single();
    userBooking = data;
  }

  // サブスク状態
  let isSubscriber = false;
  if (user) {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();
    isSubscriber = !!sub || profile?.role === "subscriber";
  }

  const typeInfo = typeLabels[seminar.seminar_type];
  const instructor = seminar.instructor as any;
  const category = seminar.category as any;
  const isFull = seminar.capacity ? (bookingCount || 0) >= seminar.capacity : false;

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={profile} />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/schedule"
            className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            スケジュールに戻る
          </Link>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant={typeInfo?.variant}>{typeInfo?.label}</Badge>
                {category && (
                  <Badge
                    variant="outline"
                    style={{ borderColor: category.color, color: category.color }}
                  >
                    {category.name}
                  </Badge>
                )}
                {seminar.tags?.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    <Tag className="mr-1 h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>

              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                {seminar.title}
              </h1>

              {/* Meta Info */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                {seminar.scheduled_at && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(seminar.scheduled_at), "yyyy年M月d日（E）", {
                      locale: ja,
                    })}
                  </div>
                )}
                {seminar.scheduled_at && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {format(new Date(seminar.scheduled_at), "HH:mm")}〜（{seminar.duration_minutes}分）
                  </div>
                )}
                {seminar.seminar_type === "realtime" && (
                  <div className="flex items-center gap-1.5">
                    <Video className="h-4 w-4" />
                    Zoom開催
                  </div>
                )}
                {seminar.seminar_type === "in_person" && seminar.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {seminar.location}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {bookingCount || 0}名 参加予定
                  {seminar.capacity && ` / 定員${seminar.capacity}名`}
                </div>
              </div>

              {/* Description */}
              <div className="mt-8 prose prose-gray max-w-none">
                <h2 className="text-lg font-semibold text-gray-900">研修内容</h2>
                <div className="mt-3 whitespace-pre-wrap text-gray-600 leading-relaxed">
                  {seminar.description || "詳細は準備中です。"}
                </div>
              </div>

              {/* Instructor */}
              {instructor && (
                <div className="mt-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    講師
                  </h2>
                  <Card>
                    <CardContent className="flex items-start gap-4 py-4">
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-lg font-bold">
                        {instructor.full_name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {instructor.full_name}
                        </p>
                        {instructor.salon_name && (
                          <p className="text-sm text-gray-500">
                            {instructor.salon_name}
                          </p>
                        )}
                        {instructor.bio && (
                          <p className="mt-2 text-sm text-gray-600">
                            {instructor.bio}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Sidebar - Booking */}
            <div>
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="mb-4">
                    {seminar.price === 0 ? (
                      <p className="text-2xl font-bold text-green-600">無料</p>
                    ) : isSubscriber ? (
                      <div>
                        <p className="text-2xl font-bold text-brand-600">
                          無料
                          <span className="ml-2 text-sm font-normal text-gray-400 line-through">
                            ¥{seminar.price.toLocaleString()}
                          </span>
                        </p>
                        <p className="text-xs text-brand-600 mt-1">
                          サブスク会員特典
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          ¥{seminar.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          サブスク会員なら無料
                        </p>
                      </div>
                    )}
                  </div>

                  <BookingButton
                    seminarId={seminar.id}
                    isLoggedIn={!!user}
                    isSubscriber={isSubscriber}
                    isBooked={!!userBooking}
                    isFull={isFull}
                    price={seminar.price}
                    seminarType={seminar.seminar_type}
                  />

                  {isFull && (
                    <p className="mt-3 text-center text-sm text-red-500">
                      この研修は満席です
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
