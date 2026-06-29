"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Clock, CalendarDays, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { weekdayLabel } from "@/lib/scheduling";
import type { InstructorAvailability, Profile } from "@/types/database";

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

export default function AdminAvailabilityPage() {
  const [instructors, setInstructors] = useState<Profile[]>([]);
  const [instructorId, setInstructorId] = useState("");
  const [slots, setSlots] = useState<InstructorAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [mode, setMode] = useState<"recurring" | "specific">("recurring");
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [specificDate, setSpecificDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("18:00");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("*")
      .in("role", ["instructor", "admin"])
      .order("full_name")
      .then(({ data }) => {
        if (data) {
          setInstructors(data);
          if (data.length > 0) setInstructorId(data[0].id);
        }
      });
  }, []);

  const loadSlots = useCallback(async (id: string) => {
    if (!id) {
      setSlots([]);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("instructor_availability")
      .select("*")
      .eq("instructor_id", id)
      .order("is_recurring", { ascending: false })
      .order("day_of_week", { ascending: true })
      .order("specific_date", { ascending: true })
      .order("start_time", { ascending: true });
    setSlots((data as InstructorAvailability[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSlots(instructorId);
  }, [instructorId, loadSlots]);

  const handleAdd = async () => {
    if (!instructorId) {
      alert("講師を選択してください");
      return;
    }
    if (startTime >= endTime) {
      alert("終了時刻は開始時刻より後にしてください");
      return;
    }
    if (mode === "specific" && !specificDate) {
      alert("日付を選択してください");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("instructor_availability").insert({
      instructor_id: instructorId,
      day_of_week: mode === "recurring" ? dayOfWeek : null,
      specific_date: mode === "specific" ? specificDate : null,
      is_recurring: mode === "recurring",
      start_time: startTime,
      end_time: endTime,
    });
    setSaving(false);
    if (error) {
      alert("追加に失敗しました: " + error.message);
      return;
    }
    await loadSlots(instructorId);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この公開枠を削除しますか？")) return;
    const supabase = createClient();
    const { error } = await supabase.from("instructor_availability").delete().eq("id", id);
    if (error) {
      alert("削除に失敗しました: " + error.message);
      return;
    }
    setSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const recurringSlots = slots.filter((s) => s.is_recurring);
  const specificSlots = slots.filter((s) => !s.is_recurring);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">公開枠管理</h1>
        <p className="mt-1 text-gray-500">
          講師ごとに、研修を入れられる曜日・時間帯を解放します。枠を設定すると、講師はその範囲内でのみ研修を作成できます（未設定の場合は制限なし）。
        </p>
      </div>

      {/* 講師選択 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">対象の講師</label>
          <select
            value={instructorId}
            onChange={(e) => setInstructorId(e.target.value)}
            className="flex h-9 w-full max-w-sm rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500"
          >
            {instructors.length === 0 && <option value="">講師がいません</option>}
            {instructors.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.full_name || inst.email} ({inst.role})
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 追加フォーム */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">公開枠を追加</CardTitle>
            <CardDescription>毎週繰り返し、または特定日の枠を設定できます。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("recurring")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                  mode === "recurring" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-500"
                }`}
              >
                <Repeat className="h-4 w-4" />
                毎週繰り返し
              </button>
              <button
                type="button"
                onClick={() => setMode("specific")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                  mode === "specific" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-500"
                }`}
              >
                <CalendarDays className="h-4 w-4" />
                特定日
              </button>
            </div>

            {mode === "recurring" ? (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">曜日</label>
                <div className="flex flex-wrap gap-1.5">
                  {WEEKDAYS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDayOfWeek(d)}
                      className={`h-9 w-9 rounded-lg border text-sm font-medium transition-all ${
                        dayOfWeek === d
                          ? "border-brand-500 bg-brand-500 text-white"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {weekdayLabel(d)}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">日付</label>
                <Input type="date" value={specificDate} onChange={(e) => setSpecificDate(e.target.value)} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">開始時刻</label>
                <Input type="time" step={900} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">終了時刻</label>
                <Input type="time" step={900} value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>

            <Button onClick={handleAdd} disabled={saving || !instructorId} className="w-full">
              <Plus className="mr-1.5 h-4 w-4" />
              {saving ? "追加中..." : "この枠を追加"}
            </Button>
          </CardContent>
        </Card>

        {/* 現在の枠一覧 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">設定済みの公開枠</CardTitle>
            <CardDescription>
              {slots.length === 0 ? "未設定（＝制限なし）" : `${slots.length}件`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="py-8 text-center text-sm text-gray-400">読み込み中...</p>
            ) : slots.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 py-8 text-center">
                <Clock className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-2 text-sm text-gray-400">
                  公開枠が未設定です。この講師はどの日時でも研修を作成できます。
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recurringSlots.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold text-gray-400">毎週繰り返し</p>
                    <div className="space-y-2">
                      {recurringSlots.map((s) => (
                        <SlotRow key={s.id} slot={s} onDelete={() => handleDelete(s.id)} />
                      ))}
                    </div>
                  </div>
                )}
                {specificSlots.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold text-gray-400">特定日</p>
                    <div className="space-y-2">
                      {specificSlots.map((s) => (
                        <SlotRow key={s.id} slot={s} onDelete={() => handleDelete(s.id)} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SlotRow({ slot, onDelete }: { slot: InstructorAvailability; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
      <div className="flex items-center gap-3">
        {slot.is_recurring ? (
          <Badge variant="secondary">{weekdayLabel(slot.day_of_week ?? 0)}曜</Badge>
        ) : (
          <Badge variant="outline">{slot.specific_date}</Badge>
        )}
        <span className="text-sm text-gray-700">
          {slot.start_time.slice(0, 5)} 〜 {slot.end_time.slice(0, 5)}
        </span>
      </div>
      <button
        onClick={onDelete}
        className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
        title="削除"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
