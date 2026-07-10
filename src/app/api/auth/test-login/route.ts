import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const TEST_ID = "1234";
const TEST_PASS = "1234";
const TEST_EMAIL = "test@vars-camp.dev";
const TEST_PASSWORD = "testlogin1234!";

function hasAdminEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
}

async function signInTestUser() {
  const supabase = await createClient();
  return supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
}

async function ensureTestAdminProfile() {
  if (!hasAdminEnv()) return;
  try {
    const admin = createAdminClient();
    await admin
      .from("profiles")
      .update({ role: "admin", full_name: "テスト管理者" })
      .eq("email", TEST_EMAIL);
  } catch {
    // プロフィール更新失敗はログイン自体を妨げない
  }
}

export async function POST(request: NextRequest) {
  const { id, password } = await request.json();

  if (id !== TEST_ID || password !== TEST_PASS) {
    return NextResponse.json({ error: "IDまたはパスワードが違います" }, { status: 401 });
  }

  // 1. 既存ユーザーなら Service Role 不要でログインできる
  const { error: existingSignInError } = await signInTestUser();
  if (!existingSignInError) {
    await ensureTestAdminProfile();
    return NextResponse.json({ success: true });
  }

  // 2. 未作成なら作成を試みる（Service Role が必要）
  if (!hasAdminEnv()) {
    return NextResponse.json(
      {
        error:
          "テストユーザーが未作成で、サーバー設定（SUPABASE_SERVICE_ROLE_KEY）も未設定です。Google ログインをお試しください。",
      },
      { status: 503 }
    );
  }

  try {
    const admin = createAdminClient();

    const { error: createError } = await admin.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "テスト管理者" },
    });

    if (createError && !createError.message.toLowerCase().includes("already")) {
      // 3. Admin API 失敗時は通常 signUp にフォールバック
      const supabase = await createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        options: { data: { full_name: "テスト管理者" } },
      });
      if (signUpError) {
        return NextResponse.json(
          {
            error: `テストユーザー作成失敗: ${createError.message}（signUp: ${signUpError.message}）`,
          },
          { status: 500 }
        );
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json(
      {
        error: `テストユーザー作成失敗: ${message}。Vercel の SUPABASE_SERVICE_ROLE_KEY を確認してください。`,
      },
      { status: 500 }
    );
  }

  const { error: signInError } = await signInTestUser();
  if (signInError) {
    return NextResponse.json(
      { error: "ログイン失敗: " + signInError.message },
      { status: 500 }
    );
  }

  await ensureTestAdminProfile();
  return NextResponse.json({ success: true });
}
