"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, GraduationCap, CreditCard, User, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

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
  const router = useRouter();
  const [switching, setSwitching] = useState<string | null>(null);

  const switchRole = async (newRole: string) => {
    if (newRole === currentRole) return;
    setSwitching(newRole);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      alert("切り替え失敗: " + error.message);
      setSwitching(null);
      return;
    }

    router.refresh();
    setSwitching(null);
  };

  return (
    <div className="rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 p-4">
      <p className="text-xs font-semibold text-orange-600 mb-3 flex items-center gap-1.5">
        <RefreshCw className="h-3.5 w-3.5" />
        開発用：権限切り替え
      </p>
      <div className="grid grid-cols-2 gap-2">
        {roles.map((role) => {
          const isActive = currentRole === role.value;
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
                ${switching === role.value ? "opacity-50" : ""}
              `}
            >
              <role.icon className="h-4 w-4" />
              <div className="text-left">
                <span className="block">{role.label}</span>
                {isActive && <span className="text-[10px] opacity-70">現在の権限</span>}
              </div>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] text-orange-400">
        ※ 切り替え後、ページをリロードすると反映されます
      </p>
    </div>
  );
}
