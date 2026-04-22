"use client";

import { useState, useEffect } from "react";
import { Search, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface Instructor {
  id: string;
  full_name: string | null;
  email: string | null;
  salon_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  seminar_count: number;
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    const supabase = createClient();
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email, salon_name, bio, avatar_url, created_at")
      .eq("role", "instructor")
      .order("created_at", { ascending: false });

    if (!profiles) {
      setLoading(false);
      return;
    }

    const instructorsWithCount = await Promise.all(
      profiles.map(async (p) => {
        const { count } = await supabase
          .from("seminars")
          .select("*", { count: "exact", head: true })
          .eq("instructor_id", p.id);
        return { ...p, seminar_count: count || 0 };
      })
    );

    setInstructors(instructorsWithCount);
    setLoading(false);
  };

  const filtered = instructors.filter(
    (i) =>
      !search ||
      i.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      i.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">講師管理</h1>
        <Badge variant="secondary">{instructors.length}名</Badge>
      </div>

      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="名前・メールで検索"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400">読み込み中...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-400">
              講師がまだいません。会員管理ページで講師権限を付与してください。
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((inst) => (
            <Card key={inst.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 text-lg font-bold">
                    {inst.full_name?.charAt(0) || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 truncate">
                      {inst.full_name || "名前未設定"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{inst.email}</p>
                    {inst.salon_name && (
                      <p className="text-xs text-gray-400 mt-0.5">{inst.salon_name}</p>
                    )}
                  </div>
                </div>
                {inst.bio && (
                  <p className="mt-3 text-xs text-gray-500 line-clamp-2">{inst.bio}</p>
                )}
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-xs text-gray-400">研修数</span>
                  <span className="text-sm font-semibold text-gray-900">{inst.seminar_count}件</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
