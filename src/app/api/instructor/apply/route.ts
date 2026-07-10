import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateApplicationPayload } from "@/lib/instructor-application";
import type { InstructorApplicationPayload } from "@/types/database";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, instructor_application_status")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "プロフィールが見つかりません" }, { status: 404 });
  }

  if (profile.role === "instructor" || profile.role === "admin") {
    return NextResponse.json(
      { error: "すでに講師として登録されています" },
      { status: 400 }
    );
  }

  let body: InstructorApplicationPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  const validationError = validateApplicationPayload(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const industries = body.industries.map((i) => i.trim()).filter(Boolean);
  if (industries.length === 0) {
    return NextResponse.json({ error: "業種を1つ以上入力してください" }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: body.full_name.trim(),
      salon_name: body.salon_name?.trim() || null,
      phone: body.phone.trim(),
      salon_location: body.salon_location.trim(),
      business_type: body.business_type.trim(),
      industries,
      website_url: body.website_url?.trim() || null,
      strengths: body.strengths?.trim() || null,
      training_topics: body.training_topics?.trim() || null,
      work_description: body.work_description?.trim() || null,
      interest_level: body.interest_level,
      preferred_time_slot: body.preferred_time_slot,
      qa_preference: body.qa_preference,
      delivery_preference: body.delivery_preference || null,
      archive_permission: body.archive_permission || null,
      lecture_frequency: body.lecture_frequency,
      contact_preference: body.contact_preference,
      line_intro_ok: body.line_intro_ok ?? null,
      application_notes: body.application_notes?.trim() || null,
      instructor_application_status: "pending",
      applied_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
