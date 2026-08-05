import nextDynamic from "next/dynamic";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { InstructorApplicationFormSkeleton } from "@/components/instructors/instructor-application-form-skeleton";
import { pageTitle } from "@/lib/brand";

const InstructorApplicationForm = nextDynamic(
  () =>
    import("@/components/instructors/instructor-application-form").then((mod) => ({
      default: mod.InstructorApplicationForm,
    })),
  { loading: () => <InstructorApplicationFormSkeleton /> }
);

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: pageTitle("講師様アンケート"),
  description:
    "講師登壇希望者向けのアンケートです。美容師会員登録とは別の手続きで、運営承認後に講師として公開されます。",
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
            <h1 className="text-3xl font-bold text-gray-900">Vアカデミー 講師様アンケート</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-gray-600">
              登壇を希望される講師の方専用です。
              <strong className="font-medium text-gray-800">美容師会員登録（研修受講）とは別</strong>
              のお手続きで、内容確認後に運営が承認します。
            </p>
            <p className="mx-auto mt-2 max-w-xl text-xs text-gray-500">
              すでに美容師会員の方も、ここから講師登録を申し込めます（承認までは受講者アカウントのままです）。
            </p>
          </div>
          <InstructorApplicationForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
