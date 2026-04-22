import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScheduleCalendar } from "@/components/schedule/calendar";

export const metadata = {
  title: "研修スケジュール | vars camp",
};

export default async function SchedulePage() {
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
        instructor:profiles!seminars_instructor_id_fkey(id, full_name, avatar_url),
        category:categories!seminars_category_id_fkey(id, name, slug, color, icon)
      `)
      .eq("is_published", true)
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true }),
    supabase.from("categories").select("*").order("sort_order"),
  ]);
  const profile = profileResult?.data || null;

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={profile} />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">研修スケジュール</h1>
            <p className="mt-2 text-gray-500">
              今後の研修予定を確認して、気になる研修に参加しましょう。
            </p>
          </div>

          <ScheduleCalendar
            seminars={seminars || []}
            categories={categories || []}
            userRole={profile?.role || null}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
