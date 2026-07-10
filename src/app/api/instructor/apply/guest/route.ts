import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateApplicationPayload } from "@/lib/instructor-application";
import type { InstructorApplicationFormData } from "@/lib/instructor-application";

type GuestPayload = InstructorApplicationFormData & { email: string };

export async function POST(request: Request) {
  let body: GuestPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  if (!body.email?.trim()) {
    return NextResponse.json({ error: "メールアドレスは必須です" }, { status: 400 });
  }

  const validationError = validateApplicationPayload(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const industries = body.industries.map((item) => item.trim()).filter(Boolean);
  if (industries.length === 0) {
    return NextResponse.json({ error: "業種を1つ以上入力してください" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("instructor_application_submissions").insert({
    email: body.email.trim(),
    full_name: body.full_name.trim(),
    salon_name: body.salon_name.trim(),
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
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
