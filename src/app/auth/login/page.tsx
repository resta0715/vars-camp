"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function LineIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#06C755">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

function TestLoginForm() {
  const router = useRouter();
  const [testId, setTestId] = useState("");
  const [testPass, setTestPass] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  const handleTestLogin = async () => {
    setTestLoading(true);
    setTestError(null);
    try {
      const res = await fetch("/api/auth/test-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: testId, password: testPass }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTestError(data.error);
        setTestLoading(false);
        return;
      }
      window.location.href = "/dashboard";
    } catch {
      setTestError("通信エラー");
      setTestLoading(false);
    }
  };

  return (
    <div className="mt-6 rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 p-4">
      <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-orange-600">
        <KeyRound className="h-3.5 w-3.5" />
        テストログイン（デモ用）
      </p>
      {testError && (
        <div className="mb-2 rounded bg-red-100 px-3 py-1.5 text-xs text-red-700">{testError}</div>
      )}
      <div className="flex gap-2">
        <Input
          placeholder="ID"
          value={testId}
          onChange={(e) => setTestId(e.target.value)}
          className="h-9 bg-white text-sm"
        />
        <Input
          type="password"
          placeholder="PASS"
          value={testPass}
          onChange={(e) => setTestPass(e.target.value)}
          className="h-9 bg-white text-sm"
        />
        <Button
          size="sm"
          onClick={handleTestLogin}
          disabled={testLoading || !testId || !testPass}
          className="shrink-0"
        >
          {testLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "ログイン"}
        </Button>
      </div>
    </div>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const isSignup = searchParams.get("mode") === "signup";
  const redirect = searchParams.get("redirect") || "/dashboard";
  const [loading, setLoading] = useState<string | null>(null);

  const handleLogin = async (provider: "google" | "line") => {
    setLoading(provider);
    const supabase = createClient();

    if (provider === "google") {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?redirect=${redirect}`,
        },
      });
    } else {
      await supabase.auth.signInWithOAuth({
        provider: "kakao" as any,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?redirect=${redirect}`,
          scopes: "profile openid email",
        },
      });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Link href="/" className="mx-auto mb-4 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">
            vars <span className="text-brand-600">camp</span>
          </span>
        </Link>
        <CardTitle className="text-xl">
          {isSignup ? "アカウント作成" : "ログイン"}
        </CardTitle>
        <CardDescription>
          {isSignup
            ? "Google または LINE でかんたん登録"
            : "アカウントにログインしてください"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          size="lg"
          className="w-full justify-center gap-3 text-base"
          onClick={() => handleLogin("google")}
          disabled={loading !== null}
        >
          <GoogleIcon />
          {loading === "google" ? "接続中..." : "Google でログイン"}
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="w-full justify-center gap-3 text-base border-[#06C755] text-[#06C755] hover:bg-[#06C755]/5"
          onClick={() => handleLogin("line")}
          disabled={loading !== null}
        >
          <LineIcon />
          {loading === "line" ? "接続中..." : "LINE でログイン"}
        </Button>

        <div className="pt-4 text-center">
          {isSignup ? (
            <p className="text-sm text-gray-500">
              すでにアカウントをお持ちですか？{" "}
              <Link href="/auth/login" className="text-brand-600 hover:underline">
                ログイン
              </Link>
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              アカウントをお持ちでないですか？{" "}
              <Link href="/auth/login?mode=signup" className="text-brand-600 hover:underline">
                無料で登録
              </Link>
            </p>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 pt-2">
          続行することで、
          <Link href="/terms" className="underline">利用規約</Link>
          および
          <Link href="/privacy" className="underline">プライバシーポリシー</Link>
          に同意したものとみなされます。
        </p>

        <TestLoginForm />
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 px-4">
      <Suspense fallback={<div className="text-gray-400">読み込み中...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
