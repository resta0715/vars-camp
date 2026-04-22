"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Video, MapPin, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { Category, Profile } from "@/types/database";

const seminarTypes = [
  { value: "realtime", label: "ライブ研修", description: "Zoomでリアルタイム", icon: Video },
  { value: "ondemand", label: "オンデマンド", description: "録画動画を配信", icon: Play },
  { value: "in_person", label: "会場開催", description: "対面開催", icon: MapPin },
];

export default function AdminNewSeminarPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<Profile[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    instructor_id: "",
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
    supabase.from("categories").select("*").order("sort_order").then(({ data }) => {
      if (data) setCategories(data);
    });
    supabase.from("profiles").select("*").in("role", ["instructor", "admin"]).order("full_name").then(({ data }) => {
      if (data) setInstructors(data);
    });
  }, []);

  const handleSubmit = async (publish: boolean) => {
    if (!form.title || !form.instructor_id) {
      alert("タイトルと講師は必須です");
      return;
    }
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase.from("seminars").insert({
      instructor_id: form.instructor_id,
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
      is_approved: true,
    });

    if (error) {
      alert("保存に失敗しました: " + error.message);
      setSaving(false);
      return;
    }

    router.push("/admin/seminars");
    router.refresh();
  };

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div>
      <Link href="/admin/seminars" className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="mr-1 h-4 w-4" />
        研修管理に戻る
      </Link>

      <h1 className="mb-8 text-2xl font-bold text-gray-900">研修を追加</h1>

      <div className="max-w-3xl space-y-6">
        {/* Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">研修タイプ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {seminarTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => update("seminar_type", type.value)}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    form.seminar_type === type.value
                      ? "border-brand-500 bg-brand-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <type.icon className={`h-6 w-6 ${form.seminar_type === type.value ? "text-brand-600" : "text-gray-400"}`} />
                  <span className="text-sm font-medium">{type.label}</span>
                  <span className="text-[11px] text-gray-500">{type.description}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Instructor + Basic */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">講師 *</label>
              <select
                value={form.instructor_id}
                onChange={(e) => update("instructor_id", e.target.value)}
                className="flex h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500"
              >
                <option value="">講師を選択</option>
                {instructors.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.full_name || inst.email} ({inst.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">タイトル *</label>
              <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="研修タイトル" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">内容・説明</label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={5}
                className="flex w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500"
                placeholder="研修の内容を記入"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">カテゴリ</label>
                <select
                  value={form.category_id}
                  onChange={(e) => update("category_id", e.target.value)}
                  className="flex h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500"
                >
                  <option value="">カテゴリを選択</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">タグ（カンマ区切り）</label>
                <Input value={form.tags} onChange={(e) => update("tags", e.target.value)} placeholder="初心者向け, 経営者" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        {form.seminar_type !== "ondemand" && (
          <Card>
            <CardHeader><CardTitle className="text-base">日程</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">開催日時</label>
                  <Input type="datetime-local" value={form.scheduled_at} onChange={(e) => update("scheduled_at", e.target.value)} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">研修時間（分）</label>
                  <Input type="number" min={15} step={15} value={form.duration_minutes} onChange={(e) => update("duration_minutes", parseInt(e.target.value))} />
                </div>
              </div>
              {form.seminar_type === "in_person" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">会場</label>
                    <Input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="東京都渋谷区..." />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">定員</label>
                    <Input type="number" min={1} value={form.capacity} onChange={(e) => update("capacity", e.target.value)} placeholder="空欄 = 無制限" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* URL */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">配信・動画設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.seminar_type === "realtime" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Zoom URL</label>
                <Input value={form.zoom_url} onChange={(e) => update("zoom_url", e.target.value)} placeholder="https://zoom.us/j/..." />
              </div>
            )}
            {form.seminar_type === "ondemand" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">動画URL（YouTube限定公開 / Vimeo）</label>
                <Input value={form.recording_url} onChange={(e) => update("recording_url", e.target.value)} placeholder="https://youtu.be/..." />
                <p className="mt-1.5 text-xs text-gray-500">YouTubeは「限定公開」でアップロードしてください</p>
              </div>
            )}
            {form.seminar_type === "in_person" && (
              <p className="text-sm text-gray-400">会場開催のため配信設定は不要です</p>
            )}
          </CardContent>
        </Card>

        {/* Price */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">料金</CardTitle>
            <CardDescription>サブスク会員は無料。無料会員向けの単発価格です。</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-xs">
              <Input type="number" min={0} step={100} value={form.price} onChange={(e) => update("price", parseInt(e.target.value) || 0)} placeholder="0 = 無料" />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2 pb-8">
          <Button variant="outline" onClick={() => handleSubmit(false)} disabled={saving || !form.title || !form.instructor_id}>
            下書き保存
          </Button>
          <Button onClick={() => handleSubmit(true)} disabled={saving || !form.title || !form.instructor_id}>
            <Save className="mr-1.5 h-4 w-4" />
            {saving ? "保存中..." : "公開する"}
          </Button>
        </div>
      </div>
    </div>
  );
}
