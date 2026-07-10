import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { InstructorApplicationForm } from "@/components/instructors/instructor-application-form";

export const metadata: Metadata = {
  title: "講師様アンケート | vars camp",
  description:
    "講師候補の方へのアンケートです。ご希望をお聞かせください。必要に応じてアカウント作成もできます。",
};

export default function InstructorApplyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/for-instructors"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600"
          >
            <ArrowLeft className="h-4 w-4" />
            講師募集ページへ戻る
          </Link>
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <ClipboardList className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Vars camp 講師様アンケート</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-gray-600">
              オンラインセミナーと「繋ぐ会」の仕組みづくりに向けて、ご希望や実情をお聞かせください。
              アカウント作成は任意です。希望される方はパスワードを設定して登録できます。
            </p>
          </div>
          <InstructorApplicationForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
