import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { createPublicClient } from "@/lib/supabase/public";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { InstructorsList } from "@/components/instructors/instructors-list";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "講師一覧 | vars camp",
  description: "業種や専門分野から、学びたい講師を見つけましょう。",
};

export default async function InstructorsPage() {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, avatar_url, industries, strengths, training_topics, work_description, salon_name, created_at"
    )
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  const instructors = data || [];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        <div className="gradient-hero">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-white">講師一覧</h1>
            <p className="mt-2 text-brand-100">
              業種や専門分野から、学びたい講師を見つけましょう。
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {error ? (
            <Card>
              <CardContent className="py-16 text-center">
                <GraduationCap className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-4 text-gray-600">講師一覧の読み込みに失敗しました。</p>
                <p className="mt-2 text-sm text-gray-400">しばらくしてから再度お試しください。</p>
              </CardContent>
            </Card>
          ) : (
            <InstructorsList instructors={instructors} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
