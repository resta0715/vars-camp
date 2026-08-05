"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import {
  ARCHIVE_PERMISSIONS,
  CONTACT_PREFERENCES,
  DELIVERY_PREFERENCES,
  INTEREST_LEVELS,
  LECTURE_FREQUENCIES,
  optionLabel,
  parseIndustryLinksFromProfile,
  QA_PREFERENCES,
  TIME_SLOTS,
} from "@/lib/instructor-application";
import type {
  IndustryLink,
  InstructorApplicationStatus,
  InstructorApplicationSubmission,
  Profile,
} from "@/types/database";

type ApplicationSource = "guest" | "member";

type ApplicationRow = {
  key: string;
  source: ApplicationSource;
  id: string;
  status: InstructorApplicationStatus;
  email: string;
  full_name: string;
  phone: string | null;
  salon_location: string | null;
  avatar_url: string | null;
  industry_links: IndustryLink[];
  strengths: string | null;
  training_topics: string | null;
  work_description: string | null;
  interest_level: string;
  preferred_time_slot: string;
  qa_preference: string;
  delivery_preference: string | null;
  archive_permission: string | null;
  lecture_frequency: string;
  contact_preference: string;
  line_intro_ok: boolean | null;
  application_notes: string | null;
  submitted_at: string;
};

const statusConfig: Record<
  InstructorApplicationStatus,
  { label: string; className: string }
> = {
  pending: { label: "審査中", className: "bg-amber-100 text-amber-800" },
  approved: { label: "承認済", className: "bg-green-100 text-green-800" },
  rejected: { label: "却下", className: "bg-gray-100 text-gray-600" },
};

function toMemberRow(profile: Profile): ApplicationRow {
  return {
    key: `member:${profile.id}`,
    source: "member",
    id: profile.id,
    status: profile.instructor_application_status || "pending",
    email: profile.email || "",
    full_name: profile.full_name || "",
    phone: profile.phone,
    salon_location: profile.salon_location,
    avatar_url: profile.avatar_url,
    industry_links: parseIndustryLinksFromProfile(profile),
    strengths: profile.strengths,
    training_topics: profile.training_topics,
    work_description: profile.work_description,
    interest_level: profile.interest_level || "",
    preferred_time_slot: profile.preferred_time_slot || "",
    qa_preference: profile.qa_preference || "",
    delivery_preference: profile.delivery_preference,
    archive_permission: profile.archive_permission,
    lecture_frequency: profile.lecture_frequency || "",
    contact_preference: profile.contact_preference || "",
    line_intro_ok: profile.line_intro_ok,
    application_notes: profile.application_notes,
    submitted_at: profile.applied_at || profile.updated_at,
  };
}

function toGuestRow(submission: InstructorApplicationSubmission): ApplicationRow {
  return {
    key: `guest:${submission.id}`,
    source: "guest",
    id: submission.id,
    status: submission.status || "pending",
    email: submission.email,
    full_name: submission.full_name,
    phone: submission.phone || null,
    salon_location: submission.salon_location,
    avatar_url: submission.avatar_url,
    industry_links: parseIndustryLinksFromProfile(submission),
    strengths: submission.strengths,
    training_topics: submission.training_topics,
    work_description: submission.work_description,
    interest_level: submission.interest_level,
    preferred_time_slot: submission.preferred_time_slot,
    qa_preference: submission.qa_preference,
    delivery_preference: submission.delivery_preference,
    archive_permission: submission.archive_permission,
    lecture_frequency: submission.lecture_frequency,
    contact_preference: submission.contact_preference,
    line_intro_ok: submission.line_intro_ok,
    application_notes: submission.application_notes,
    submitted_at: submission.created_at,
  };
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900 whitespace-pre-wrap">{value}</dd>
    </div>
  );
}

function ApplicationDetail({ row }: { row: ApplicationRow }) {
  return (
    <div className="grid gap-4 border-t border-gray-100 bg-gray-50 px-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
      {row.avatar_url && (
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="mb-2 text-xs font-medium text-gray-500">顔写真</dt>
          <dd>
            <Image
              src={row.avatar_url}
              alt={row.full_name}
              width={96}
              height={96}
              className="h-24 w-24 rounded-lg object-cover border border-gray-200"
              unoptimized
            />
          </dd>
        </div>
      )}
      <DetailItem label="活動拠点" value={row.salon_location} />
      <DetailItem label="電話番号" value={row.phone} />
      <DetailItem
        label="業種・専門分野"
        value={
          row.industry_links.length > 0 ? (
            <ul className="space-y-1">
              {row.industry_links.map((link, index) => (
                <li key={`${link.name}-${index}`}>
                  <span className="font-medium">{link.name}</span>
                  {link.url && (
                    <a
                      href={link.url.startsWith("@") ? `https://instagram.com/${link.url.slice(1)}` : link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 inline-flex items-center gap-0.5 text-brand-600 hover:underline"
                    >
                      {link.url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : null
        }
      />
      <DetailItem label="強み・経験" value={row.strengths} />
      <DetailItem label="研修テーマ案" value={row.training_topics} />
      <DetailItem label="仕事内容" value={row.work_description} />
      <DetailItem
        label="興味度"
        value={optionLabel(INTEREST_LEVELS, row.interest_level)}
      />
      <DetailItem
        label="希望時間帯"
        value={optionLabel(TIME_SLOTS, row.preferred_time_slot)}
      />
      <DetailItem
        label="Q&A対応"
        value={optionLabel(QA_PREFERENCES, row.qa_preference)}
      />
      <DetailItem
        label="配信形式"
        value={optionLabel(DELIVERY_PREFERENCES, row.delivery_preference)}
      />
      <DetailItem
        label="アーカイブ可否"
        value={optionLabel(ARCHIVE_PERMISSIONS, row.archive_permission)}
      />
      <DetailItem
        label="登壇頻度"
        value={optionLabel(LECTURE_FREQUENCIES, row.lecture_frequency)}
      />
      <DetailItem
        label="連絡手段"
        value={optionLabel(CONTACT_PREFERENCES, row.contact_preference)}
      />
      <DetailItem
        label="LINE紹介OK"
        value={row.line_intro_ok == null ? null : row.line_intro_ok ? "はい" : "いいえ"}
      />
      <DetailItem label="備考・その他" value={row.application_notes} />
    </div>
  );
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InstructorApplicationStatus | "all">("all");
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actingKey, setActingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const [guestResult, memberResult] = await Promise.all([
      supabase
        .from("instructor_application_submissions")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("*")
        .not("instructor_application_status", "is", null)
        .order("applied_at", { ascending: false }),
    ]);

    if (guestResult.error || memberResult.error) {
      setError(guestResult.error?.message || memberResult.error?.message || "読み込みに失敗しました");
      setApplications([]);
      setLoading(false);
      return;
    }

    const rows = [
      ...(guestResult.data || []).map((item) =>
        toGuestRow(item as InstructorApplicationSubmission)
      ),
      ...(memberResult.data || []).map((item) => toMemberRow(item as Profile)),
    ].sort(
      (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    );

    setApplications(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filtered = useMemo(() => {
    return applications.filter((row) => {
      const matchStatus = statusFilter === "all" || row.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        row.full_name.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        row.salon_location?.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [applications, search, statusFilter]);

  const pendingCount = applications.filter((row) => row.status === "pending").length;

  const updateStatus = async (row: ApplicationRow, status: InstructorApplicationStatus) => {
    const label = status === "approved" ? "承認" : "却下";
    const extra =
      status === "approved"
        ? "（アンケート内容をそのまま講師一覧に公開します）"
        : "";
    if (!confirm(`${row.full_name} さんの申込を${label}しますか？${extra}`)) return;

    setActingKey(row.key);

    const response = await fetch("/api/admin/applications/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: row.source,
        id: row.id,
        status,
      }),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      alert("更新に失敗しました: " + (result.error || "不明なエラー"));
      setActingKey(null);
      return;
    }

    setApplications((prev) =>
      prev.map((item) => (item.key === row.key ? { ...item, status } : item))
    );
    setActingKey(null);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">講師申込</h1>
          <p className="mt-1 text-sm text-gray-500">
            美容師会員登録とは別の、講師登壇希望のアンケートです。承認後に講師一覧へ公開されます。
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
              審査中 {pendingCount}件
            </Badge>
          )}
          <Badge variant="secondary">{applications.length}件</Badge>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="名前・メール・拠点で検索"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "すべて"],
              ["pending", "審査中"],
              ["approved", "承認済"],
              ["rejected", "却下"],
            ] as const
          ).map(([value, label]) => (
            <Button
              key={value}
              variant={statusFilter === value ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-400">読み込み中...</div>
          ) : error ? (
            <div className="p-12 text-center text-red-500">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <ClipboardList className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-400">該当する申込がありません</p>
              <p className="mt-2 text-xs text-gray-400">
                講師申込は未ログイン送信のみです（美容師会員登録とは別）
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map((row) => {
                const isExpanded = expandedKey === row.key;
                const status = statusConfig[row.status];
                const isActing = actingKey === row.key;

                return (
                  <div key={row.key}>
                    <div className="flex flex-wrap items-center gap-3 px-4 py-4 hover:bg-gray-50">
                      <button
                        type="button"
                        onClick={() => setExpandedKey(isExpanded ? null : row.key)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                          {row.avatar_url ? (
                            <Image
                              src={row.avatar_url}
                              alt=""
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-full object-cover"
                              unoptimized
                            />
                          ) : (
                            row.full_name.charAt(0) || "?"
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-gray-900">{row.full_name}</span>
                            <Badge variant="outline" className="text-[10px]">
                              {row.source === "guest" ? "未ログイン" : "ログイン済み"}
                            </Badge>
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </div>
                          <p className="truncate text-sm text-gray-500">{row.email}</p>
                          <p className="text-xs text-gray-400">
                            {row.salon_location || "拠点未入力"} ·{" "}
                            {new Date(row.submitted_at).toLocaleString("ja-JP")}
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        )}
                      </button>

                      {row.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={isActing}
                            onClick={() => updateStatus(row, "approved")}
                          >
                            <Check className="mr-1 h-3.5 w-3.5" />
                            承認
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isActing}
                            onClick={() => updateStatus(row, "rejected")}
                          >
                            <X className="mr-1 h-3.5 w-3.5" />
                            却下
                          </Button>
                        </div>
                      )}
                    </div>
                    {isExpanded && <ApplicationDetail row={row} />}
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
