"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import {
  ARCHIVE_PERMISSIONS,
  CONTACT_PREFERENCES,
  DELIVERY_PREFERENCES,
  EMPTY_APPLICATION_FORM,
  INTEREST_LEVELS,
  LECTURE_FREQUENCIES,
  QA_PREFERENCES,
  TIME_SLOTS,
  parseIndustriesInput,
  type InstructorApplicationFormData,
} from "@/lib/instructor-application";

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
  const router = useRouter();
  const [form, setForm] = useState<InstructorApplicationFormData>(EMPTY_APPLICATION_FORM);
  const [industriesInput, setIndustriesInput] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [authChecking, setAuthChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    const timeout = window.setTimeout(() => {
      if (active) setAuthChecking(false);
    }, 3000);

    (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const user = session?.user;
        if (!active || !user) return;

        setLoggedIn(true);
        setUserEmail(user.email || "");
        setContactEmail(user.email || "");

        const profilePromise = supabase
          .from("profiles")
          .select("full_name, phone, salon_location")
          .eq("id", user.id)
          .single();

        const { data: profile } = await Promise.race([
          profilePromise,
          new Promise<{ data: null }>((resolve) =>
            window.setTimeout(() => resolve({ data: null }), 2500)
          ),
        ]);

        if (profile) {
          setForm((prev) => ({
            ...prev,
            full_name: profile.full_name || prev.full_name,
            phone: profile.phone || prev.phone,
            salon_location: profile.salon_location || prev.salon_location,
          }));
        }
      } catch {
        // Supabase 未接続時もゲスト送信は可能
      } finally {
        if (active) setAuthChecking(false);
      }
    })();

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, []);

  const update = <K extends keyof InstructorApplicationFormData>(
    key: K,
    value: InstructorApplicationFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const industries = parseIndustriesInput(industriesInput);
    const payload = { ...form, industries };

    if (!loggedIn && !createAccount && !contactEmail.trim()) {
      setError("メールアドレスを入力してください");
      return;
    }

    if (createAccount && !loggedIn) {
      if (!contactEmail.trim()) {
        setError("アカウント作成にはメールアドレスが必要です");
        return;
      }
      if (password.length < 8) {
        setError("パスワードは8文字以上で設定してください");
        return;
      }
      if (password !== passwordConfirm) {
        setError("パスワードが一致しません");
        return;
      }
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      let isAuthenticated = loggedIn;

      if (createAccount && !loggedIn) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: contactEmail.trim(),
          password,
          options: { data: { full_name: form.full_name.trim() } },
        });
        if (signUpError) {
          setError(signUpError.message);
          setSubmitting(false);
          return;
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: contactEmail.trim(),
          password,
        });
        if (signInError) {
          setError(
            "アカウントは作成されましたがログインできませんでした。確認メールをご確認いただくか、ログイン画面からお試しください。"
          );
          setSubmitting(false);
          return;
        }
        isAuthenticated = true;
        setAccountCreated(true);
      }

      const endpoint = isAuthenticated ? "/api/instructor/apply" : "/api/instructor/apply/guest";
      const body = isAuthenticated ? payload : { ...payload, email: contactEmail.trim() };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "送信に失敗しました");
        setSubmitting(false);
        return;
      }

      setDone(true);
      if (isAuthenticated) {
        router.refresh();
      }
    } catch {
      setError("通信エラーが発生しました。しばらくしてから再度お試しください。");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="p-8 text-center">
          <CheckCircle className="mx-auto h-14 w-14 text-green-600" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">アンケートを送信しました</h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            ご協力ありがとうございます。ご記入いただいた連絡方法に沿って、運営からご連絡いたします。
          </p>
          {accountCreated && (
            <p className="mt-2 text-sm text-brand-700">
              アカウントも作成済みです。次回からメールとパスワードでログインできます。
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/for-instructors">講師募集ページへ</Link>
            </Button>
            {loggedIn || accountCreated ? (
              <Button variant="outline" asChild>
                <Link href="/dashboard">ダッシュボードへ</Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8">
      {authChecking && (
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          ログイン状態を確認中...
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
          <CardDescription>お名前・連絡先をご記入ください</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FieldLabel required>お名前</FieldLabel>
            <Input
              value={form.full_name}
              onChange={(e) => update("full_name", e.target.value)}
              placeholder="山田 太郎"
              required
            />
          </div>
          <div>
            <FieldLabel required>電話番号</FieldLabel>
            <Input
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="090-1234-5678"
              required
            />
          </div>
          <div>
            <FieldLabel required>所在地</FieldLabel>
            <Input
              value={form.salon_location}
              onChange={(e) => update("salon_location", e.target.value)}
              placeholder="東京都渋谷区"
              required
            />
          </div>
          <div>
            <FieldLabel required>業態</FieldLabel>
            <Input
              value={form.business_type}
              onChange={(e) => update("business_type", e.target.value)}
              placeholder="美容室 / ネイルサロン など"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel required>業種（カンマ区切り）</FieldLabel>
            <Input
              value={industriesInput}
              onChange={(e) => setIndustriesInput(e.target.value)}
              placeholder="美容室, ヘアカラー"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel>Webサイト・SNS</FieldLabel>
            <Input
              value={form.website_url}
              onChange={(e) => update("website_url", e.target.value)}
              placeholder="https://"
            />
          </div>
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
              placeholder="経営数字、集客、技術指導など"
            />
          </div>
          <div>
            <FieldLabel>講座にしたいテーマ</FieldLabel>
            <textarea
              className={`${fieldClass} min-h-[88px]`}
              value={form.training_topics}
              onChange={(e) => update("training_topics", e.target.value)}
            />
          </div>
          <div>
            <FieldLabel>お仕事内容</FieldLabel>
            <textarea
              className={`${fieldClass} min-h-[88px]`}
              value={form.work_description}
              onChange={(e) => update("work_description", e.target.value)}
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
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>連絡先・アカウント</CardTitle>
          <CardDescription>
            {loggedIn
              ? `ログイン中: ${userEmail}`
              : "アンケート送信にはメールアドレスが必要です。希望される方はパスワードを設定してアカウントも作成できます。"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!loggedIn && (
            <>
              <div>
                <FieldLabel required>メールアドレス</FieldLabel>
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  required
                />
              </div>
              <label className="flex items-start gap-3 rounded-lg border border-brand-100 bg-brand-50/50 p-4">
                <input
                  type="checkbox"
                  checked={createAccount}
                  onChange={(e) => setCreateAccount(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">
                  <span className="font-medium text-gray-900">アカウントも作成する</span>
                  <br />
                  パスワードを設定すると、次回からメールとパスワードでログインできます（任意）
                </span>
              </label>
              {createAccount && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <FieldLabel required>パスワード（8文字以上）</FieldLabel>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={8}
                      required
                    />
                  </div>
                  <div>
                    <FieldLabel required>パスワード（確認）</FieldLabel>
                    <Input
                      type="password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      minLength={8}
                      required
                    />
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500">
                すでに Google / LINE で登録済みの方は{" "}
                <Link href="/auth/login?redirect=/for-instructors/apply" className="text-brand-600 underline">
                  ログイン
                </Link>
                してから送信してください。
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col items-center gap-4 pb-8">
        <Button type="submit" size="lg" disabled={submitting} className="min-w-[200px]">
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
          送信内容は運営が確認し、ご記入の連絡方法でご連絡します。
        </p>
      </div>
    </form>
  );
}
