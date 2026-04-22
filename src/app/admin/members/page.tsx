"use client";

import { useState, useEffect } from "react";
import { Users, Search, Shield, GraduationCap, CreditCard, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { Profile, UserRole } from "@/types/database";

const roleConfig: Record<UserRole, { label: string; color: string; icon: typeof User }> = {
  admin: { label: "管理者", color: "bg-red-100 text-red-700", icon: Shield },
  instructor: { label: "講師", color: "bg-green-100 text-green-700", icon: GraduationCap },
  subscriber: { label: "サブスク", color: "bg-brand-100 text-brand-700", icon: CreditCard },
  free: { label: "無料", color: "bg-gray-100 text-gray-600", icon: User },
};

export default function MembersPage() {
  const [members, setMembers] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setMembers(data || []);
    setLoading(false);
  };

  const updateRole = async (userId: string, newRole: UserRole) => {
    if (!confirm(`このユーザーの権限を「${roleConfig[newRole].label}」に変更しますか？`)) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      alert("更新に失敗しました: " + error.message);
      return;
    }

    setMembers((prev) =>
      prev.map((m) => (m.id === userId ? { ...m, role: newRole } : m))
    );
  };

  const filtered = members.filter((m) => {
    const matchSearch =
      !search ||
      m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.salon_name?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || m.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">会員管理</h1>
        <Badge variant="secondary">{members.length}名</Badge>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="名前・メール・サロン名で検索"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterRole === null ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterRole(null)}
          >
            すべて
          </Button>
          {(Object.keys(roleConfig) as UserRole[]).map((role) => (
            <Button
              key={role}
              variant={filterRole === role ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterRole(role === filterRole ? null : role)}
            >
              {roleConfig[role].label}
            </Button>
          ))}
        </div>
      </div>

      {/* Members Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-400">読み込み中...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">該当する会員がいません</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left font-medium text-gray-500">名前</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">メール</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">サロン</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">権限</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => {
                    const rc = roleConfig[m.role];
                    return (
                      <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs font-bold">
                              {m.full_name?.charAt(0) || "?"}
                            </div>
                            <span className="font-medium text-gray-900">
                              {m.full_name || "未設定"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{m.email}</td>
                        <td className="px-4 py-3 text-gray-500">{m.salon_name || "-"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${rc.color}`}>
                            {rc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={m.role}
                            onChange={(e) => updateRole(m.id, e.target.value as UserRole)}
                            className="rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                          >
                            <option value="free">無料</option>
                            <option value="subscriber">サブスク</option>
                            <option value="instructor">講師</option>
                            <option value="admin">管理者</option>
                          </select>
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
