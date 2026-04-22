"use client";

import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock, MapPin, Video, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Seminar, Category } from "@/types/database";

interface ScheduleCalendarProps {
  seminars: Seminar[];
  categories: Category[];
  userRole: string | null;
}

const typeLabels: Record<string, { label: string; variant: "realtime" | "ondemand" | "inperson" }> = {
  realtime: { label: "ライブ", variant: "realtime" },
  ondemand: { label: "オンデマンド", variant: "ondemand" },
  in_person: { label: "会場開催", variant: "inperson" },
};

export function ScheduleCalendar({ seminars, categories, userRole }: ScheduleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const filteredSeminars = useMemo(() => {
    if (!filterCategory) return seminars;
    return seminars.filter((s) => s.category_id === filterCategory);
  }, [seminars, filterCategory]);

  const seminarsByDate = useMemo(() => {
    const map = new Map<string, Seminar[]>();
    filteredSeminars.forEach((s) => {
      if (!s.scheduled_at) return;
      const key = format(new Date(s.scheduled_at), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });
    return map;
  }, [filteredSeminars]);

  const selectedSeminars = selectedDate
    ? seminarsByDate.get(format(selectedDate, "yyyy-MM-dd")) || []
    : [];

  const weekDays = ["月", "火", "水", "木", "金", "土", "日"];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Calendar */}
      <div className="lg:col-span-2">
        {/* Category Filter */}
        <div className="mb-4 flex flex-wrap gap-2">
          <Button
            variant={filterCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterCategory(null)}
          >
            すべて
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={filterCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterCategory(cat.id === filterCategory ? null : cat.id)}
              style={
                filterCategory === cat.id
                  ? { backgroundColor: cat.color, borderColor: cat.color }
                  : {}
              }
            >
              {cat.name}
            </Button>
          ))}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="text-lg">
              {format(currentMonth, "yyyy年 M月", { locale: ja })}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px">
              {weekDays.map((d) => (
                <div key={d} className="py-2 text-center text-xs font-medium text-gray-500">
                  {d}
                </div>
              ))}
              {calendarDays.map((day) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const daySeminars = seminarsByDate.get(dateKey) || [];
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);

                return (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedDate(day)}
                    className={`relative min-h-[72px] rounded-lg p-1.5 text-left transition-colors
                      ${isCurrentMonth ? "hover:bg-gray-50" : "text-gray-300"}
                      ${isSelected ? "bg-brand-50 ring-2 ring-brand-500" : ""}
                      ${isToday(day) ? "bg-brand-50/50" : ""}
                    `}
                  >
                    <span
                      className={`text-xs font-medium
                        ${isToday(day) ? "flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white" : ""}
                      `}
                    >
                      {format(day, "d")}
                    </span>
                    {daySeminars.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {daySeminars.slice(0, 3).map((s) => (
                          <div
                            key={s.id}
                            className="truncate rounded px-1 py-0.5 text-[10px] font-medium text-white"
                            style={{
                              backgroundColor:
                                (s.category as any)?.color || "#9333ea",
                            }}
                          >
                            {format(new Date(s.scheduled_at!), "HH:mm")} {s.title}
                          </div>
                        ))}
                        {daySeminars.length > 3 && (
                          <div className="text-[10px] text-gray-400 px-1">
                            +{daySeminars.length - 3}件
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Day Detail */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {selectedDate
                ? format(selectedDate, "M月d日（E）", { locale: ja })
                : "日付を選択"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSeminars.length === 0 ? (
              <p className="text-sm text-gray-400">この日の研修はありません</p>
            ) : (
              <div className="space-y-4">
                {selectedSeminars.map((s) => {
                  const typeInfo = typeLabels[s.seminar_type];
                  return (
                    <a
                      key={s.id}
                      href={`/seminars/${s.id}`}
                      className="block rounded-lg border border-gray-100 p-4 hover:border-brand-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <Badge variant={typeInfo?.variant || "default"}>
                          {typeInfo?.label}
                        </Badge>
                        {s.price === 0 ? (
                          <Badge variant="secondary">無料</Badge>
                        ) : (
                          <span className="text-sm font-semibold text-gray-700">
                            ¥{s.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 font-semibold text-gray-900 text-sm">
                        {s.title}
                      </h3>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {s.scheduled_at && format(new Date(s.scheduled_at), "HH:mm")}
                          〜 {s.duration_minutes}分
                        </div>
                        {s.seminar_type === "in_person" && s.location && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="h-3 w-3" />
                            {s.location}
                          </div>
                        )}
                        {s.seminar_type === "realtime" && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Video className="h-3 w-3" />
                            Zoom開催
                          </div>
                        )}
                      </div>
                      {(s.instructor as any)?.full_name && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                          <Users className="h-3 w-3" />
                          {(s.instructor as any).full_name}
                        </div>
                      )}
                    </a>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
