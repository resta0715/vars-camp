"use client";

import nextDynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { IndustryLinksInput } from "@/components/instructors/industry-links-input";
import {
  ARCHIVE_PERMISSIONS,
  CONTACT_PREFERENCES,
  DELIVERY_PREFERENCES,
  EMPTY_APPLICATION_FORM,
  INTEREST_LEVELS,
  LECTURE_FREQUENCIES,
  normalizeIndustryLinks,
  QA_PREFERENCES,
  TIME_SLOTS,
  type InstructorApplicationFormData,
} from "@/lib/instructor-application";

const InstructorPhotoUpload = nextDynamic(
  () =>
    import("@/components/instructors/instructor-photo-upload").then((mod) => ({
      default: mod.InstructorPhotoUpload,
    })),
  { ssr: false }
);

const fieldClass =
  "flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500";
const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className={labelClass}>
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}

function SelectField({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <select
      className={fieldClass}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function InstructorApplicationForm() {
  const uploadSessionId = useMemo(() => crypto.randomUUID(), []);
  const [form, setForm] = useState<InstructorApplicationFormData>(EMPTY_APPLICATION_FORM);
  const [contactEmail, setContactEmail] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const user = session?.user;
        if (!active || !user) return;

        setLoggedIn(true);
        setUserEmail(user.email || "");

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (active && profile) {
          setUserRole(profile.role);
        }
      } catch {
        // 未ログイン送信は可能
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const update = <K extends keyof InstructorApplicationFormData>(
    key: K,
    value: InstructorApplicationFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setLoggedIn(false);
    setUserEmail("");
    setUserRole(null);
    setSigningOut(false);
    window.location.reload();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (loggedIn) {
      setError("美容師会員アカウントでログイン中です。ログアウトしてから送信してください。");
      return;
    }

    const industry_links = normalizeIndustryLinks(form.industry_links);
    if (industry_links.length === 0) {
      setError("業種・専門分野を1つ以上入力してください");
      return;
    }

    if (!contactEmail.trim()) {
      setError("メールアドレスを入力してください");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/instructor/apply/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, industry_links, email: contactEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "送信に失敗しました");
        setSubmitting(false);
        return;
      }

      setDone(true);
    } catch {
      setError("通信エラーが発生しました。しばらくしてから再度お試しください。");
    } finally {
      setSubmitting(false);
    }
  };

  const blockReason = loggedIn
    ? userRole === "admin"
      ? `管理者アカウント（${userEmail}）でログイン中です。講師申込は別の手続きのため、ログアウトしてから送信してください。`
      : userRole === "instructor"
        ? `講師アカウント（${userEmail}）でログイン中です。新規申込はログアウトしてから送信してください。`
        : `美容師会員アカウント（${userEmail}）でログイン中です。講師申込と美容師会員登録は別のため、ログアウトしてから送信してください。`
    : null;

  if (done) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="p-8 text-center">
          <CheckCircle className="mx-auto h-14 w-14 text-green-600" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">アンケートを送信しました</h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            ご協力ありがとうございます。ご記入いただいた連絡方法に沿って、運営からご連絡いたします。
          </p>
          <p className="mt-2 text-xs text-gray-500">
            承認後、講師として公開されます。美容師会員登録とは別の手続きです。
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/for-instructors">講師募集ページへ</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8">
      {blockReason && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
          <p>{blockReason}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            ログアウトして申込む
          </Button>
        </div>
      )}

      {!loggedIn && (
        <div className="rounded-lg border border-brand-100 bg-brand-50/50 px-4 py-3 text-sm text-gray-700">
          講師申込は<strong className="font-semibold">未ログイン</strong>で送信してください。
          美容師会員登録（研修受講）とは別の手続きです。
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
          <CardDescription>お名前・ご連絡先をご記入ください</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <InstructorPhotoUpload
            avatarUrl={form.avatar_url}
            onAvatarUrlChange={(url) => update("avatar_url", url)}
            uploadSessionId={uploadSessionId}
            onError={setError}
          />
          <div className="sm:col-span-2">
            <FieldLabel required>お名前</FieldLabel>
            <Input
              value={form.full_name}
              onChange={(e) => update("full_name", e.target.value)}
              placeholder="山田 太郎"
              required
              disabled={Boolean(blockReason)}
            />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel>電話番号（サイト上に表示してよい方のみ）</FieldLabel>
            <Input
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="090-1234-5678"
              disabled={Boolean(blockReason)}
            />
            <p className="mt-1.5 text-xs text-gray-500">
              任意です。入力された場合のみ、講師プロフィール等に表示されることがあります。
            </p>
          </div>
          <div>
            <FieldLabel required>所在地</FieldLabel>
            <Input
              value={form.salon_location}
              onChange={(e) => update("salon_location", e.target.value)}
              placeholder="東京都渋谷区"
              required
              disabled={Boolean(blockReason)}
            />
          </div>
          <IndustryLinksInput
            links={form.industry_links}
            onChange={(industry_links) => update("industry_links", industry_links)}
            label={<FieldLabel required>業種・専門分野と Web/SNS</FieldLabel>}
            description="業種（専門分野）と、対応する Web サイトや SNS の URL をセットで登録できます。"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>講師としてのご経験・強み</CardTitle>
          <CardDescription>任意項目です。わかる範囲でご記入ください</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <FieldLabel>得意分野・強み</FieldLabel>
            <textarea
              className={`${fieldClass} min-h-[88px]`}
              value={form.strengths}
              onChange={(e) => update("strengths", e.target.value)}
              placeholder="経営、マーケティング、組織づくり など"
              disabled={Boolean(blockReason)}
            />
          </div>
          <div>
            <FieldLabel>講座にしたいテーマ</FieldLabel>
            <textarea
              className={`${fieldClass} min-h-[88px]`}
              value={form.training_topics}
              onChange={(e) => update("training_topics", e.target.value)}
              placeholder="サロン経営、スタッフ育成、数字の見える化 など"
              disabled={Boolean(blockReason)}
            />
          </div>
          <div>
            <FieldLabel>お仕事内容</FieldLabel>
            <textarea
              className={`${fieldClass} min-h-[88px]`}
              value={form.work_description}
              onChange={(e) => update("work_description", e.target.value)}
              placeholder="コンサルティング、セミナー講師、執筆・メディア など"
              disabled={Boolean(blockReason)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ご希望・参加について</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FieldLabel required>参加への関心度</FieldLabel>
            <SelectField
              value={form.interest_level}
              onChange={(v) => update("interest_level", v)}
              options={INTEREST_LEVELS}
              placeholder="選択してください"
            />
          </div>
          <div>
            <FieldLabel required>希望の開始時間帯</FieldLabel>
            <SelectField
              value={form.preferred_time_slot}
              onChange={(v) => update("preferred_time_slot", v)}
              options={TIME_SLOTS}
              placeholder="選択してください"
            />
          </div>
          <div>
            <FieldLabel required>質問の受け方</FieldLabel>
            <SelectField
              value={form.qa_preference}
              onChange={(v) => update("qa_preference", v)}
              options={QA_PREFERENCES}
              placeholder="選択してください"
            />
          </div>
          <div>
            <FieldLabel>配信の希望</FieldLabel>
            <SelectField
              value={form.delivery_preference}
              onChange={(v) => update("delivery_preference", v)}
              options={DELIVERY_PREFERENCES}
              placeholder="選択してください"
            />
          </div>
          <div>
            <FieldLabel>アーカイブの可否</FieldLabel>
            <SelectField
              value={form.archive_permission}
              onChange={(v) => update("archive_permission", v)}
              options={ARCHIVE_PERMISSIONS}
              placeholder="選択してください"
            />
          </div>
          <div>
            <FieldLabel required>講義の希望頻度</FieldLabel>
            <SelectField
              value={form.lecture_frequency}
              onChange={(v) => update("lecture_frequency", v)}
              options={LECTURE_FREQUENCIES}
              placeholder="選択してください"
            />
          </div>
          <div>
            <FieldLabel required>ご連絡方法</FieldLabel>
            <SelectField
              value={form.contact_preference}
              onChange={(v) => update("contact_preference", v)}
              options={CONTACT_PREFERENCES}
              placeholder="選択してください"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.line_intro_ok}
                onChange={(e) => update("line_intro_ok", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
                disabled={Boolean(blockReason)}
              />
              公式LINEでのご紹介を希望する
            </label>
          </div>
          <div className="sm:col-span-2">
            <FieldLabel>その他・ご質問</FieldLabel>
            <textarea
              className={`${fieldClass} min-h-[100px]`}
              value={form.application_notes}
              onChange={(e) => update("application_notes", e.target.value)}
              disabled={Boolean(blockReason)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>連絡先メール</CardTitle>
          <CardDescription>
            運営からの連絡先です。美容師会員登録のアカウントとは連動しません。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldLabel required>メールアドレス</FieldLabel>
          <Input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="example@gmail.com"
            required
            disabled={Boolean(blockReason)}
          />
          <p className="mt-2 text-xs text-gray-500">
            研修を受講する美容師の方は
            <Link href="/auth/login?mode=signup" className="mx-1 text-brand-600 underline">
              美容師会員登録
            </Link>
            をご利用ください（講師申込とは別です）。
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col items-center gap-4 pb-8">
        <Button
          type="submit"
          size="lg"
          disabled={submitting || Boolean(blockReason)}
          className="min-w-[200px]"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              送信中...
            </>
          ) : (
            "アンケートを送信する"
          )}
        </Button>
        <p className="text-center text-xs text-gray-500">
          送信内容は運営が確認し、承認後に講師一覧へ公開されます。
        </p>
      </div>
    </form>
  );
}
