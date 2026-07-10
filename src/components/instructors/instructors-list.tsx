"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, UserCircle, GraduationCap, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface PublicInstructor {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  industries: string[] | null;
  strengths: string | null;
  training_topics: string | null;
  work_description: string | null;
  salon_name: string | null;
  created_at: string;
}

type SortKey = "newest" | "name";

interface InstructorsListProps {
  instructors: PublicInstructor[];
}

export function InstructorsList({ instructors }: InstructorsListProps) {
  const [search, setSearch] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>("newest");

  const allIndustries = useMemo(() => {
    const set = new Set<string>();
    instructors.forEach((i) => (i.industries || []).forEach((ind) => set.add(ind)));
    return Array.from(set).sort();
  }, [instructors]);

  const toggleIndustry = (ind: string) =>
    setSelectedIndustries((prev) =>
      prev.includes(ind) ? prev.filter((x) => x !== ind) : [...prev, ind]
    );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = instructors.filter((i) => {
      const matchesIndustry =
        selectedIndustries.length === 0 ||
        (i.industries || []).some((ind) => selectedIndustries.includes(ind));
      if (!matchesIndustry) return false;
      if (!q) return true;
      const haystack = [
        i.full_name,
        i.salon_name,
        i.strengths,
        i.training_topics,
        i.work_description,
        (i.industries || []).join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });

    result.sort((a, b) => {
      if (sort === "name") {
        return (a.full_name || "").localeCompare(b.full_name || "", "ja");
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return result;
  }, [instructors, search, selectedIndustries, sort]);

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="名前・強み・研修内容で検索"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-400" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500"
          >
            <option value="newest">新着順</option>
            <option value="name">名前順</option>
          </select>
        </div>
      </div>

      {allIndustries.length > 0 && (
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">業種で絞り込み</span>
            {selectedIndustries.length > 0 && (
              <button
                onClick={() => setSelectedIndustries([])}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
                クリア
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allIndustries.map((ind) => {
              const active = selectedIndustries.includes(ind);
              return (
                <button
                  key={ind}
                  onClick={() => toggleIndustry(ind)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    active
                      ? "border-brand-500 bg-brand-500 text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:bg-brand-50"
                  }`}
                >
                  {ind}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-500">
              {instructors.length === 0
                ? "公開中の講師がまだいません。"
                : "条件に合う講師が見つかりませんでした。"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="mb-3 text-sm text-gray-500">{filtered.length}名の講師</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((inst) => (
              <Link key={inst.id} href={`/instructors/${inst.id}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border border-gray-100 bg-gray-100">
                        {inst.avatar_url ? (
                          <Image
                            src={inst.avatar_url}
                            alt={inst.full_name || "講師"}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <UserCircle className="h-9 w-9 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 truncate">
                          {inst.full_name || "名前未設定"}
                        </p>
                        {inst.salon_name && (
                          <p className="text-xs text-gray-400 truncate">{inst.salon_name}</p>
                        )}
                        {(inst.industries || []).length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {(inst.industries || []).slice(0, 3).map((ind) => (
                              <Badge key={ind} variant="secondary" className="text-[10px]">
                                {ind}
                              </Badge>
                            ))}
                            {(inst.industries || []).length > 3 && (
                              <span className="text-[10px] text-gray-400">
                                +{(inst.industries || []).length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {inst.strengths && (
                      <p className="mt-3 text-xs text-gray-500 line-clamp-3">{inst.strengths}</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
