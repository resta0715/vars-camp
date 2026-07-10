import type { InstructorAvailability } from "@/types/database";

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

export function weekdayLabel(dayOfWeek: number): string {
  return WEEKDAY_LABELS[dayOfWeek] ?? "";
}

// "HH:MM" / "HH:MM:SS" -> 0時からの経過分
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":");
  return parseInt(h, 10) * 60 + parseInt(m || "0", 10);
}

export function minutesToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// 2つの区間 [aStart, aEnd) [bStart, bEnd) が重なるか（端が接するだけは重ならない扱い）
export function rangesOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export interface ScheduledSeminarLite {
  id: string;
  title: string;
  scheduled_at: string | null;
  duration_minutes: number;
}

export interface ScheduledHoldLite {
  id: string;
  title: string | null;
  starts_at: string;
  duration_minutes: number;
}

export type ScheduleConflict =
  | { type: "seminar"; item: ScheduledSeminarLite }
  | { type: "hold"; item: ScheduledHoldLite };

// 同一講師の既存研修と時間が重複する最初の研修を返す（無ければ null）
export function findConflict(
  scheduledAtIso: string,
  durationMinutes: number,
  existing: ScheduledSeminarLite[],
  excludeId?: string
): ScheduledSeminarLite | null {
  const start = new Date(scheduledAtIso).getTime();
  if (Number.isNaN(start)) return null;
  const end = start + durationMinutes * 60_000;

  for (const s of existing) {
    if (!s.scheduled_at) continue;
    if (excludeId && s.id === excludeId) continue;
    const es = new Date(s.scheduled_at).getTime();
    if (Number.isNaN(es)) continue;
    const ee = es + s.duration_minutes * 60_000;
    if (rangesOverlap(start, end, es, ee)) return s;
  }
  return null;
}

export function findHoldConflict(
  scheduledAtIso: string,
  durationMinutes: number,
  holds: ScheduledHoldLite[],
  excludeHoldId?: string
): ScheduledHoldLite | null {
  const start = new Date(scheduledAtIso).getTime();
  if (Number.isNaN(start)) return null;
  const end = start + durationMinutes * 60_000;

  for (const h of holds) {
    if (excludeHoldId && h.id === excludeHoldId) continue;
    const hs = new Date(h.starts_at).getTime();
    if (Number.isNaN(hs)) continue;
    const he = hs + h.duration_minutes * 60_000;
    if (rangesOverlap(start, end, hs, he)) return h;
  }
  return null;
}

export function findScheduleConflict(
  scheduledAtIso: string,
  durationMinutes: number,
  seminars: ScheduledSeminarLite[],
  holds: ScheduledHoldLite[],
  excludeSeminarId?: string,
  excludeHoldId?: string
): ScheduleConflict | null {
  const seminarConflict = findConflict(
    scheduledAtIso,
    durationMinutes,
    seminars,
    excludeSeminarId
  );
  if (seminarConflict) return { type: "seminar", item: seminarConflict };

  const holdConflict = findHoldConflict(
    scheduledAtIso,
    durationMinutes,
    holds,
    excludeHoldId
  );
  if (holdConflict) return { type: "hold", item: holdConflict };

  return null;
}

// 指定日時(ローカル)が、講師の公開枠のいずれかに完全に収まるか判定。
// スロットが1件も無い場合は「制限なし」とみなし true を返す。
export function isWithinAvailability(
  // datetime-local の値（例 "2026-07-01T14:00"）またはISO文字列
  scheduledLocal: string,
  durationMinutes: number,
  slots: InstructorAvailability[]
): boolean {
  if (!slots || slots.length === 0) return true;

  const date = new Date(scheduledLocal);
  if (Number.isNaN(date.getTime())) return false;

  const startMin = date.getHours() * 60 + date.getMinutes();
  const endMin = startMin + durationMinutes;
  const dow = date.getDay(); // 0=日 .. 6=土
  const ymd = toLocalYmd(date);

  return slots.some((slot) => {
    const slotStart = timeToMinutes(slot.start_time);
    const slotEnd = timeToMinutes(slot.end_time);
    const fits = startMin >= slotStart && endMin <= slotEnd;
    if (!fits) return false;

    if (slot.is_recurring) {
      return slot.day_of_week === dow;
    }
    return slot.specific_date === ymd;
  });
}

export function toLocalYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// 講師の公開枠を人間向けの文字列に整形
export function describeAvailability(slots: InstructorAvailability[]): string[] {
  return slots.map((s) => {
    const time = `${s.start_time.slice(0, 5)}〜${s.end_time.slice(0, 5)}`;
    if (s.is_recurring) {
      return `毎週${weekdayLabel(s.day_of_week ?? 0)}曜 ${time}`;
    }
    return `${s.specific_date} ${time}`;
  });
}

// Postgres 排他制約違反のエラーコード
export const PG_EXCLUSION_VIOLATION = "23P01";
