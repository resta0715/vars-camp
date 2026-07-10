"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Plus, Trash2, CalendarClock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import {
  findScheduleConflict,
  type ScheduledSeminarLite,
  type ScheduledHoldLite,
} from "@/lib/scheduling";
import type { InstructorHold } from "@/types/database";

interface InstructorHoldsPanelProps {
  instructorId: string;
}

export function InstructorHoldsPanel({ instructorId }: InstructorHoldsPanelProps) {
  const [holds, setHolds] = useState<InstructorHold[]>([]);
  const [mySeminars, setMySeminars] = useState<ScheduledSeminarLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [startsAt, setStartsAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");

  const loadData = useCallback(async (id: string) => {
    if (!id) {
      setHolds([]);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const [{ data: holdData }, { data: seminarData }] = await Promise.all([
      supabase
        .from("instructor_holds")
        .select("*")
        .eq("instructor_id", id)
        .eq("status", "tentative")
        .order("starts_at", { ascending: true }),
      supabase
        .from("seminars")
        .select("id, title, scheduled_at, duration_minutes")
        .eq("instructor_id", id)
        .not("scheduled_at", "is", null),
    ]);
    setHolds((holdData as InstructorHold[]) || []);
    setMySeminars((seminarData as ScheduledSeminarLite[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData(instructorId);
  }, [instructorId, loadData]);

  const handleAdd = async () => {
    if (!instructorId || !startsAt) {
      setError("日時を選択してください");
      return;
    }
    setError(null);

    const activeHolds: ScheduledHoldLite[] = holds.map((h) => ({
      id: h.id,
      title: h.title,
      starts_at: h.starts_at,
      duration_minutes: h.duration_minutes,
    }));

    const conflict = findScheduleConflict(
      startsAt,
      durationMinutes,
      mySeminars,
      activeHolds
    );
    if (conflict) {
      if (conflict.type === "seminar") {
        const when = conflict.item.scheduled_at
          ? new Date(conflict.item.scheduled_at).toLocaleString("ja-JP")
          : "";
        setError(`既存の研修「${conflict.item.title}」（${when}）と重複しています。`);
      } else {
        const when = new Date(conflict.item.starts_at).toLocaleString("ja-JP");
        setError(
          `既存の仮予約「${conflict.item.title || "（無題）"}」（${when}）と重複しています。`
        );
      }
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("instructor_holds").insert({
      instructor_id: instructorId,
      starts_at: new Date(startsAt).toISOString(),
      duration_minutes: durationMinutes,
      title: title.trim() || null,
      note: note.trim() || null,
      status: "tentative",
    });
    setSaving(false);

    if (insertError) {
      setError("仮予約の追加に失敗しました: " + insertError.message);
      return;
    }

    setStartsAt("");
    setTitle("");
    setNote("");
    await loadData(instructorId);
  };

  const handleRelease = async (id: string) => {
    if (!confirm("この仮予約を解除しますか？時間帯が再び空きます。")) return;
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("instructor_holds")
      .update({ status: "released", updated_at: new Date().toISOString() })
      .eq("id", id);
    if (updateError) {
      alert("解除に失敗しました: " + updateError.message);
      return;
    }
    setHolds((prev) => prev.filter((h) => h.id !== id));
  };

  const upcomingHolds = holds.filter((h) => new Date(h.starts_at) >= new Date());

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">仮予約を追加</CardTitle>
          <CardDescription>
            研修を確定する前に時間帯を押さえられます。仮予約中は同じ時間に別の研修や仮予約は入れられません。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">開始日時 *</label>
            <Input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">所要時間（分）</label>
            <Input
              type="number"
              min={15}
              step={15}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 60)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">タイトル（任意）</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 〇〇サロン様 打ち合わせ"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">メモ（任意）</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="flex w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500"
              placeholder="調整中の内容など"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <Button onClick={handleAdd} disabled={saving || !instructorId} className="w-full">
            <Plus className="mr-1.5 h-4 w-4" />
            {saving ? "追加中..." : "仮予約を押さえる"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">有効な仮予約</CardTitle>
          <CardDescription>
            {upcomingHolds.length === 0 ? "なし" : `${upcomingHolds.length}件`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-gray-400">読み込み中...</p>
          ) : upcomingHolds.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 py-8 text-center">
              <CalendarClock className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-2 text-sm text-gray-400">有効な仮予約はありません。</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingHolds.map((h) => {
                const end = new Date(
                  new Date(h.starts_at).getTime() + h.duration_minutes * 60_000
                );
                return (
                  <div
                    key={h.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-amber-100 bg-amber-50/50 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                          仮予約
                        </Badge>
                        <span className="text-sm font-medium text-gray-900">
                          {h.title || "（無題）"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-600">
                        {format(new Date(h.starts_at), "M/d（E）HH:mm", { locale: ja })}
                        {" 〜 "}
                        {format(end, "HH:mm")}
                        {" ・ "}
                        {h.duration_minutes}分
                      </p>
                      {h.note && (
                        <p className="mt-1 text-xs text-gray-500 line-clamp-2">{h.note}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRelease(h.id)}
                      className="shrink-0 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      title="仮予約を解除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
