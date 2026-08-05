import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { canAccessAdmin } from "@/lib/admin-access";
import {
  buildPublicInstructorProfile,
  submissionToPromotable,
  type ApplicationSource,
} from "@/lib/promote-instructor-application";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { InstructorApplicationStatus } from "@/types/database";

export const runtime = "nodejs";

async function findUserIdByEmail(email: string): Promise<string | null> {
  const admin = createAdminClient();
  let page = 1;

  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    );
    if (hit) return hit.id;
    if (data.users.length < 200) break;
    page += 1;
  }

  return null;
}

async function ensureAuthUserId(email: string, fullName: string): Promise<string> {
  const admin = createAdminClient();
  const existingId = await findUserIdByEmail(email);
  if (existingId) return existingId;

  const password = randomBytes(24).toString("base64url");
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error || !data.user) {
    throw new Error(error?.message || "ユーザー作成に失敗しました");
  }

  return data.user.id;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!canAccessAdmin(profile?.role, user.email)) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  let body: {
    source?: ApplicationSource;
    id?: string;
    status?: InstructorApplicationStatus;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  const { source, id, status } = body;
  if (!source || !id || !status || !["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "パラメータが不正です" }, { status: 400 });
  }

  try {
    const admin = createAdminClient();

    if (source === "member") {
      if (status === "approved") {
        const { data: member, error: fetchError } = await admin
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (fetchError || !member) {
          return NextResponse.json({ error: "申込が見つかりません" }, { status: 404 });
        }

        const { error } = await admin
          .from("profiles")
          .update(buildPublicInstructorProfile(member))
          .eq("id", id);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      } else {
        const { error } = await admin
          .from("profiles")
          .update({ instructor_application_status: "rejected", is_public: false })
          .eq("id", id);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      }

      return NextResponse.json({ success: true });
    }

    const { data: submission, error: submissionError } = await admin
      .from("instructor_application_submissions")
      .select("*")
      .eq("id", id)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json({ error: "申込が見つかりません" }, { status: 404 });
    }

    if (status === "approved") {
      const promotable = submissionToPromotable(submission);
      const userId = await ensureAuthUserId(submission.email, submission.full_name);
      const profilePayload = buildPublicInstructorProfile(promotable);

      const { error: profileError } = await admin
        .from("profiles")
        .update(profilePayload)
        .eq("id", userId);

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 });
      }
    }

    const { error: submissionUpdateError } = await admin
      .from("instructor_application_submissions")
      .update({ status })
      .eq("id", id);

    if (submissionUpdateError) {
      return NextResponse.json({ error: submissionUpdateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "処理に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
