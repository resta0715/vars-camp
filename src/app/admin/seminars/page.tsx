"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { CheckCircle, XCircle, Eye, Search, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface SeminarRow {
  id: string;
  title: string;
  seminar_type: string;
  scheduled_at: string | null;
  duration_minutes: number;
  price: number;
  is_published: boolean;
  is_approved: boolean;
  instructor: { full_name: string } | null;
  category: { name: string; color: string } | null;
  bookings: { count: number }[];
}

const typeLabels: Record<string, string> = {
  realtime: "ライブ",
  ondemand: "オンデマンド",
  in_person: "会場開催",
};

export default function AdminSeminarsPage() {
  const [seminars, setSeminars] = useState<SeminarRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSeminars();
  }, []);

  const fetchSeminars = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("seminars")
      .select(`
        id, title, seminar_type, scheduled_at, duration_minutes, price, is_published, is_approved,
        instructor:profiles!seminars_instructor_id_fkey(full_name),
        category:categories!seminars_category_id_fkey(name, color),
        bookings(count)
      `)
      .order("created_at", { ascending: false });
    setSeminars((data as any) || []);
    setLoading(false);
  };

  const toggleApproval = async (id: string, approve: boolean) => {
    const supabase = createClient();
    await supabase.from("seminars").update({ is_approved: approve }).eq("id", id);
    setSeminars((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_approved: approve } : s))
    );
  };

  const togglePublish = async (id: string, publish: boolean) => {
    const supabase = createClient();
    await supabase.from("seminars").update({ is_published: publish }).eq("id", id);
    setSeminars((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_published: publish } : s))
    );
  };

  const filtered = seminars.filter((s) =>
    !search || s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">研修管理</h1>
        <Badge variant="secondary">{seminars.length}件</Badge>
      </div>

      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="研修名で検索"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-400">読み込み中...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">研修がありません</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left font-medium text-gray-500">研修名</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">講師</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">タイプ</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">日時</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">予約</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">状態</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => {
                    const cat = s.category as any;
                    const inst = s.instructor as any;
                    return (
                      <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{s.title}</p>
                            {cat && (
                              <span
                                className="mt-0.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
                                style={{ backgroundColor: cat.color }}
                              >
                                {cat.name}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{inst?.full_name || "-"}</td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary">{typeLabels[s.seminar_type]}</Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {s.scheduled_at
                            ? format(new Date(s.scheduled_at), "M/d（E）HH:mm", { locale: ja })
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {s.bookings?.[0]?.count || 0}名
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            {s.is_published ? (
                              <Badge variant="realtime">公開</Badge>
                            ) : (
                              <Badge variant="secondary">非公開</Badge>
                            )}
                            {s.is_published && !s.is_approved && (
                              <Badge variant="outline" className="border-yellow-300 text-yellow-700">承認待ち</Badge>
                            )}
                            {s.is_approved && (
                              <Badge variant="default">承認済み</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {s.is_published && !s.is_approved && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => toggleApproval(s.id, true)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {s.is_approved && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => toggleApproval(s.id, false)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => togglePublish(s.id, !s.is_published)}
                            >
                              {s.is_published ? "非公開" : "公開"}
                            </Button>
                            <a href={`/seminars/${s.id}`} target="_blank">
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
