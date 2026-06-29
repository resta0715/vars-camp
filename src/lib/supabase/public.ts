import { createClient } from "@supabase/supabase-js";

// Cookie を参照しない匿名クライアント。
// 公開ページ（LP・研修一覧・スケジュール）の静的生成／ISR で使用し、
// cookies() による動的レンダリングの強制を回避してCDNキャッシュを有効化する。
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
