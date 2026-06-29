"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Plus,
  Loader2,
  Eye,
  EyeOff,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

export default function InstructorProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    avatar_url: "",
    strengths: "",
    training_topics: "",
    work_description: "",
    is_public: false,
  });
  const [industries, setIndustries] = useState<string[]>([]);
  const [industryInput, setIndustryInput] = useState("");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth/login?redirect=/instructor/profile");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profile || !["instructor", "admin"].includes(profile.role)) {
        router.replace("/dashboard");
        return;
      }

      setUserId(user.id);
      setForm({
        full_name: profile.full_name || "",
        avatar_url: profile.avatar_url || "",
        strengths: profile.strengths || "",
        training_topics: profile.training_topics || "",
        work_description: profile.work_description || "",
        is_public: profile.is_public ?? false,
      });
      setIndustries(profile.industries || []);
      setLoading(false);
    })();
  }, [router]);

  const update = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const addIndustry = (value: string) => {
    const v = value.trim();
    if (!v) return;
    if (industries.includes(v)) return;
    setIndustries((prev) => [...prev, v]);
    setIndustryInput("");
  };

  const removeIndustry = (value: string) =>
    setIndustries((prev) => prev.filter((i) => i !== value));

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (!file.type.startsWith("image/")) {
      setError("画像ファイルを選択してください");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("画像サイズは5MB以下にしてください");
      return;
    }
    setError(null);
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("instructor-photos")
      .upload(path, file, { upsert: true });
    if (uploadError) {
      setError("写真のアップロードに失敗しました: " + uploadError.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("instructor-photos").getPublicUrl(path);
    update("avatar_url", data.publicUrl);
    setUploading(false);
  };

  const handleSave = async () => {
    if (!userId) return;
    if (!form.full_name.trim()) {
      setError("名前を入力してください");
      return;
    }
    setError(null);
    setSaved(false);
    setSaving(true);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name.trim(),
        avatar_url: form.avatar_url || null,
        industries,
        strengths: form.strengths || null,
        training_topics: form.training_topics || null,
        work_description: form.work_description || null,
        is_public: form.is_public,
      })
      .eq("id", userId);
    setSaving(false);
    if (updateError) {
      setError("保存に失敗しました: " + updateError.message);
      return;
    }
    setSaved(true);
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-400">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        読み込み中...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link
          href="/instructor"
          className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          講師パネルに戻る
        </Link>

        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">講師プロフィール</h1>
          {/* 公開 / 非公開 トグル */}
          <button
            type="button"
            onClick={() => update("is_public", !form.is_public)}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              form.is_public
                ? "border-green-300 bg-green-50 text-green-700"
                : "border-gray-300 bg-gray-50 text-gray-500"
            }`}
          >
            {form.is_public ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {form.is_public ? "公開中" : "非公開"}
          </button>
        </div>

        <div className="space-y-6">
          {/* 写真 + 名前 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-5">
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                  {form.avatar_url ? (
                    <Image
                      src={form.avatar_url}
                      alt="顔写真"
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <UserCircle className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoSelect}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-1.5 h-4 w-4" />
                    )}
                    {uploading ? "アップロード中..." : "顔写真をアップロード"}
                  </Button>
                  {form.avatar_url && (
                    <button
                      type="button"
                      onClick={() => update("avatar_url", "")}
                      className="ml-3 text-xs text-gray-400 hover:text-red-500"
                    >
                      削除
                    </button>
                  )}
                  <p className="mt-1.5 text-xs text-gray-400">任意・5MBまで・正方形推奨</p>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  名前 *
                </label>
                <Input
                  value={form.full_name}
                  onChange={(e) => update("full_name", e.target.value)}
                  placeholder="例: 山田 太郎"
                />
              </div>
            </CardContent>
          </Card>

          {/* 業種（複数） */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">業種</CardTitle>
              <CardDescription>複数選択・入力できます。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {industries.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {industries.map((ind) => (
                    <Badge key={ind} variant="secondary" className="gap-1 py-1 pl-2.5 pr-1">
                      {ind}
                      <button
                        type="button"
                        onClick={() => removeIndustry(ind)}
                        className="rounded-full p-0.5 hover:bg-gray-300/60"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={industryInput}
                  onChange={(e) => setIndustryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addIndustry(industryInput);
                    }
                  }}
                  placeholder="業種を入力してEnter（例: 美容室）"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addIndustry(industryInput)}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 強み・研修内容・仕事内容 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">自己紹介</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field
                label="強み"
                value={form.strengths}
                onChange={(v) => update("strengths", v)}
                placeholder="得意分野や実績、他にはない強みを記入してください"
              />
              <Field
                label="研修内容"
                value={form.training_topics}
                onChange={(v) => update("training_topics", v)}
                placeholder="提供できる研修のテーマ・内容を記入してください"
              />
              <Field
                label="仕事内容"
                value={form.work_description}
                onChange={(v) => update("work_description", v)}
                placeholder="普段の仕事内容・経歴などを記入してください"
              />
            </CardContent>
          </Card>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {saved && !error && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              プロフィールを保存しました。
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pb-10">
            <span className="text-xs text-gray-400">
              {form.is_public ? "現在この内容は公開されます" : "現在この内容は非公開です"}
            </span>
            <Button onClick={handleSave} disabled={saving || uploading}>
              <Save className="mr-1.5 h-4 w-4" />
              {saving ? "保存中..." : "保存する"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="flex w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500"
        placeholder={placeholder}
      />
    </div>
  );
}
