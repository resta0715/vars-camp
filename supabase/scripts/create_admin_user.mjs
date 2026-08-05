#!/usr/bin/env node
/**
 * 運営用 admin アカウント作成（ローカル実行用）
 *
 * 使い方:
 *   export NEXT_PUBLIC_SUPABASE_URL=...
 *   export SUPABASE_SERVICE_ROLE_KEY=...
 *   node supabase/scripts/create_admin_user.mjs \
 *     --email var-s.no.1@comet.ocn.ne.jp \
 *     --password 'YOUR_PASSWORD' \
 *     --name 'Vars運営'
 */
import { createClient } from "@supabase/supabase-js";

function readArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1 || !process.argv[index + 1]) {
    console.error(`Missing ${name}`);
    process.exit(1);
  }
  return process.argv[index + 1];
}

const email = readArg("--email");
const password = readArg("--password");
const fullName = process.argv.includes("--name")
  ? readArg("--name")
  : "Vars運営";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(targetEmail) {
  let page = 1;
  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((user) => user.email?.toLowerCase() === targetEmail.toLowerCase());
    if (hit) return hit;
    if (data.users.length < 200) break;
    page += 1;
  }
  return null;
}

let user = await findUserByEmail(email);

if (!user) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) {
    console.error("createUser failed:", error.message);
    process.exit(1);
  }
  user = data.user;
  console.log("Created auth user:", user.id);
} else {
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) {
    console.error("updateUser failed:", error.message);
    process.exit(1);
  }
  console.log("Updated auth user:", user.id);
}

const { error: profileError } = await admin
  .from("profiles")
  .update({ role: "admin", full_name: fullName, email })
  .eq("id", user.id);

if (profileError) {
  console.error("profile update failed:", profileError.message);
  process.exit(1);
}

const { data: profile } = await admin
  .from("profiles")
  .select("id, email, role, full_name")
  .eq("id", user.id)
  .single();

console.log("Admin profile ready:", profile);
