"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Video, MapPin, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/types/database";

const seminarTypes = [
  {
    value: "realtime",
    label: "ライブ研修",
    description: "Zoomでリアルタイム開催",
    icon: Video,
  },
  {
    value: "ondemand",
    label: "オンデマンド",
    description: "録画動画を配信",
    icon: Play,
  },
  {
    value: "in_person",
    label: "会場開催",
    description: "リアルな会場で対面開催",
    icon: MapPin,
  },
];

export default function NewSeminarPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    seminar_type: "realtime",
    category_id: "",
    scheduled_at: "",
    duration_minutes: 60,
    capacity: "",
    location: "",
    zoom_url: "",
    recording_url: "",
    price: 0,
    tags: "",
  });

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("categories")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        if (data) setCategories(data);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent, publish: boolean) => {
    e.preventDefault();
    setSaving(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("seminars").insert({
      instructor_id: user.id,
      title: form.title,
      description: form.description,
      seminar_type: form.seminar_type,
      category_id: form.category_id || null,
      scheduled_at: form.scheduled_at || null,
      duration_minutes: form.duration_minutes,
      capacity: form.capacity ? parseInt(form.capacity) : null,
      location: form.location || null,
      zoom_url: form.zoom_url || null,
      recording_url: form.recording_url || null,
      price: form.price,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
      is_published: publish,
    });

    if (error) {
      alert("保存に失敗しました: " + error.message);
      setSaving(false);
      return;
    }

    router.push("/instructor");
    router.refresh();
  };

  const update = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

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

        <h1 className="mb-8 text-2xl font-bold text-gray-900">
          新しい研修を作成
        </h1>

        <form className="space-y-6">
          {/* Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">研修タイプ</CardTitle>
              <CardDescription>開催方法を選んでください</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                {seminarTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => update("seminar_type", type.value)}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all
                      ${
                        form.seminar_type === type.value
                          ? "border-brand-500 bg-brand-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <type.icon
                      className={`h-6 w-6 ${
                        form.seminar_type === type.value
                          ? "text-brand-600"
                          : "text-gray-400"
                      }`}
                    />
                    <span className="text-sm font-medium">{type.label}</span>
                    <span className="text-[11px] text-gray-500">
                      {type.description}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  タイトル *
                </label>
                <Input
                  required
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="例: 売上2倍を実現する集客戦略セミナー"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  内容・説明
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={4}
                  className="flex w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500"
                  placeholder="研修の内容、対象者、得られるスキルなどを記入してください"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  カテゴリ
                </label>
                <select
                  value={form.category_id}
                  onChange={(e) => update("category_id", e.target.value)}
                  className="flex h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500"
                >
                  <option value="">カテゴリを選択</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  タグ（カンマ区切り）
                </label>
                <Input
                  value={form.tags}
                  onChange={(e) => update("tags", e.target.value)}
                  placeholder="例: 初心者向け, 経営者, 集客"
                />
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          {form.seminar_type !== "ondemand" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">日程</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      開催日時 *
                    </label>
                    <Input
                      type="datetime-local"
                      required
                      value={form.scheduled_at}
                      onChange={(e) => update("scheduled_at", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      研修時間（分）
                    </label>
                    <Input
                      type="number"
                      min={15}
                      step={15}
                      value={form.duration_minutes}
                      onChange={(e) => update("duration_minutes", parseInt(e.target.value))}
                    />
                  </div>
                </div>

                {form.seminar_type === "in_person" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        会場
                      </label>
                      <Input
                        value={form.location}
                        onChange={(e) => update("location", e.target.value)}
                        placeholder="例: 東京都渋谷区 ◯◯ビル 5F"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        定員
                      </label>
                      <Input
                        type="number"
                        min={1}
                        value={form.capacity}
                        onChange={(e) => update("capacity", e.target.value)}
                        placeholder="空欄 = 無制限"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Zoom / Recording URL */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">配信・動画設定</CardTitle>
              <CardDescription>
                ライブ研修の場合はZoom URLを、オンデマンドの場合は動画URLを設定してください。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.seminar_type === "realtime" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Zoom ミーティングURL
                  </label>
                  <Input
                    value={form.zoom_url}
                    onChange={(e) => update("zoom_url", e.target.value)}
                    placeholder="https://zoom.us/j/..."
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    予約者に開始30分前から表示されます。後から追加も可能です。
                  </p>
                </div>
              )}
              {form.seminar_type === "ondemand" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    動画URL（YouTube限定公開 / Vimeo）
                  </label>
                  <Input
                    value={form.recording_url}
                    onChange={(e) => update("recording_url", e.target.value)}
                    placeholder="https://youtu.be/... または https://vimeo.com/..."
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    YouTubeは「限定公開」でアップロードしてください。サブスク会員と購入者のみ視聴可能になります。
                  </p>
                </div>
              )}
              {form.seminar_type === "in_person" && (
                <p className="text-sm text-gray-400">会場開催のため配信設定は不要です。</p>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">料金設定</CardTitle>
              <CardDescription>
                サブスク会員は無料で参加できます。ここでは無料会員向けの単発価格を設定してください。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-xs">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  単発参加価格（円）
                </label>
                <Input
                  type="number"
                  min={0}
                  step={100}
                  value={form.price}
                  onChange={(e) => update("price", parseInt(e.target.value) || 0)}
                  placeholder="0 = 無料"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  0にすると全員無料で参加できます
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={(e) => handleSubmit(e, false)}
              disabled={saving || !form.title}
            >
              下書き保存
            </Button>
            <Button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={saving || !form.title}
            >
              <Save className="mr-1.5 h-4 w-4" />
              {saving ? "保存中..." : "公開する"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
