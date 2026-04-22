"use client";

import { useState } from "react";
import { Shield, GraduationCap, CreditCard, User, RefreshCw, Loader2, CheckCircle } from "lucide-react";

const roles = [
  { value: "admin", label: "Vars管理者", icon: Shield, color: "bg-red-100 text-red-700 border-red-200" },
  { value: "instructor", label: "講師", icon: GraduationCap, color: "bg-green-100 text-green-700 border-green-200" },
  { value: "subscriber", label: "サブスク会員", icon: CreditCard, color: "bg-brand-100 text-brand-700 border-brand-200" },
  { value: "free", label: "無料会員（美容師）", icon: User, color: "bg-gray-100 text-gray-700 border-gray-200" },
] as const;

interface RoleSwitcherProps {
  currentRole: string;
  userId: string;
}

export function RoleSwitcher({ currentRole, userId }: RoleSwitcherProps) {
  const [activeRole, setActiveRole] = useState(currentRole);
  const [switching, setSwitching] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const switchRole = async (newRole: string) => {
    if (newRole === activeRole || switching) return;
    setSwitching(newRole);
    setMessage(null);

    try {
      const res = await fetch("/api/dev/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "切り替え失敗" });
        setSwitching(null);
        return;
      }

      setActiveRole(newRole);
      setMessage({ type: "success", text: `${roles.find(r => r.value === newRole)?.label}に切り替えました` });
      setSwitching(null);

      setTimeout(() => window.location.reload(), 800);
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "通信エラー" });
      setSwitching(null);
    }
  };

  return (
    <div className="rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 p-4">
      <p className="text-xs font-semibold text-orange-600 mb-3 flex items-center gap-1.5">
        <RefreshCw className="h-3.5 w-3.5" />
        開発用：権限切り替え
      </p>
      {message && (
        <div className={`mb-3 rounded-lg px-3 py-2 text-xs ${
          message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
        }`}>
          {message.type === "success" && <CheckCircle className="inline h-3.5 w-3.5 mr-1" />}
          {message.text}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        {roles.map((role) => {
          const isActive = activeRole === role.value;
          const isLoading = switching === role.value;
          return (
            <button
              key={role.value}
              onClick={() => switchRole(role.value)}
              disabled={switching !== null}
              className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2.5 text-xs font-medium transition-all
                ${isActive
                  ? `${role.color} ring-2 ring-offset-1 ring-orange-400`
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                }
                ${isLoading ? "opacity-50" : ""}
                ${switching !== null && !isLoading ? "cursor-not-allowed opacity-40" : ""}
              `}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <role.icon className="h-4 w-4" />
              )}
              <div className="text-left">
                <span className="block">{role.label}</span>
                {isActive && <span className="text-[10px] opacity-70">現在</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
