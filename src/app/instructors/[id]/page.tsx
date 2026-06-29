import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ArrowLeft, UserCircle, Briefcase, Sparkles, GraduationCap, Calendar } from "lucide-react";
import { createPublicClient } from "@/lib/supabase/public";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const revalidate = 60;

export default async function InstructorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createPublicClient();

  const { data: instructor } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, industries, strengths, training_topics, work_description, salon_name, salon_location, is_public")
    .eq("id", id)
    .eq("is_public", true)
    .single();

  if (!instructor) notFound();

  const { data: seminars } = await supabase
    .from("seminars")
    .select("id, title, seminar_type, scheduled_at, duration_minutes, category:categories!seminars_category_id_fkey(name, color)")
    .eq("instructor_id", id)
    .eq("is_published", true)
    .eq("is_approved", true)
    .order("scheduled_at", { ascending: false })
    .limit(10);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/instructors"
            className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            講師一覧に戻る
          </Link>

          {/* プロフィール */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-full border border-gray-100 bg-gray-100">
                  {instructor.avatar_url ? (
                    <Image
                      src={instructor.avatar_url}
                      alt={instructor.full_name || "講師"}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <UserCircle className="h-16 w-16 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {instructor.full_name || "名前未設定"}
                  </h1>
                  {instructor.salon_name && (
                    <p className="mt-1 text-sm text-gray-500">{instructor.salon_name}</p>
                  )}
                  {(instructor.industries || []).length > 0 && (
                    <div className="mt-3 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                      {(instructor.industries || []).map((ind: string) => (
                        <Badge key={ind} variant="secondary">{ind}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 詳細セクション */}
          <div className="mt-6 space-y-4">
            {instructor.strengths && (
              <Section icon={Sparkles} title="強み" body={instructor.strengths} />
            )}
            {instructor.training_topics && (
              <Section icon={GraduationCap} title="研修内容" body={instructor.training_topics} />
            )}
            {instructor.work_description && (
              <Section icon={Briefcase} title="仕事内容" body={instructor.work_description} />
            )}
          </div>

          {/* 担当研修 */}
          {seminars && seminars.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">担当している研修</h2>
              <div className="space-y-3">
                {seminars.map((s: any) => (
                  <Link key={s.id} href={`/seminars/${s.id}`}>
                    <Card className="transition-shadow hover:shadow-md">
                      <CardContent className="flex items-center gap-3 py-4">
                        <div
                          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg text-white"
                          style={{ backgroundColor: s.category?.color || "#9333ea" }}
                        >
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-gray-900">{s.title}</p>
                          <p className="text-xs text-gray-500">
                            {s.category?.name}
                            {s.scheduled_at &&
                              ` ・ ${format(new Date(s.scheduled_at), "M/d（E）HH:mm", { locale: ja })}`}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
          <Icon className="h-4 w-4 text-brand-500" />
          {title}
        </h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{body}</p>
      </CardContent>
    </Card>
  );
}
