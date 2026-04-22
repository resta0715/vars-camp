import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const TEST_ID = "1234";
const TEST_PASS = "1234";
const TEST_EMAIL = "test@vars-camp.dev";
const TEST_PASSWORD = "testlogin1234!";

export async function POST(request: NextRequest) {
  const { id, password } = await request.json();

  if (id !== TEST_ID || password !== TEST_PASS) {
    return NextResponse.json({ error: "IDまたはパスワードが違います" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: existingUsers } = await admin.auth.admin.listUsers();
  let testUser = existingUsers?.users?.find((u) => u.email === TEST_EMAIL);

  if (!testUser) {
    const { data, error } = await admin.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "テストユーザー" },
    });
    if (error) {
      return NextResponse.json({ error: "テストユーザー作成失敗: " + error.message }, { status: 500 });
    }
    testUser = data.user;
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (signInError) {
    return NextResponse.json({ error: "ログイン失敗: " + signInError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
