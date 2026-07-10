"use client";

import { useState, useEffect } from "react";
import { AvailabilitySlotsPanel } from "@/components/scheduling/availability-slots-panel";
import { InstructorHoldsPanel } from "@/components/scheduling/instructor-holds-panel";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

export default function AdminAvailabilityPage() {
  const [instructors, setInstructors] = useState<Profile[]>([]);
  const [instructorId, setInstructorId] = useState("");

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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">公開枠管理</h1>
        <p className="mt-1 text-gray-500">
          講師ごとに研修を入れられる時間帯の解放と、仮予約の確認ができます。
        </p>
      </div>

      <Card className="mb-8">
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

      {instructorId && (
        <>
          <section className="mb-12">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">公開枠</h2>
            <AvailabilitySlotsPanel instructorId={instructorId} />
          </section>
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">仮予約</h2>
            <InstructorHoldsPanel instructorId={instructorId} />
          </section>
        </>
      )}
    </div>
  );
}
