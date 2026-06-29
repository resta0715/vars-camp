import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { createClient } from "@/lib/supabase/server";

// "1234567890" / "123 4567 8901" / "https://zoom.us/j/1234567890?pwd=..." から数字のみ抽出
function extractMeetingNumber(raw: string | null): string {
  if (!raw) return "";
  const m = raw.match(/\d[\d\s]*/g);
  if (!m) return "";
  return m.join("").replace(/\s/g, "");
}

export async function POST(request: Request) {
  const sdkKey = process.env.ZOOM_MEETING_SDK_KEY;
  const sdkSecret = process.env.ZOOM_MEETING_SDK_SECRET;
  if (!sdkKey || !sdkSecret) {
    return NextResponse.json(
      { error: "Zoom配信が未設定です（管理者にお問い合わせください）" },
      { status: 500 }
    );
  }

  let seminarId: string | undefined;
  try {
    const body = await request.json();
    seminarId = body.seminarId;
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }
  if (!seminarId) {
    return NextResponse.json({ error: "seminarId が必要です" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .single();

  const { data: seminar } = await supabase
    .from("seminars")
    .select("id, instructor_id, seminar_type, scheduled_at, duration_minutes, price, zoom_meeting_id, zoom_url, zoom_passcode")
    .eq("id", seminarId)
    .single();

  if (!seminar) {
    return NextResponse.json({ error: "研修が見つかりません" }, { status: 404 });
  }
  if (seminar.seminar_type !== "realtime") {
    return NextResponse.json({ error: "ライブ研修ではありません" }, { status: 400 });
  }

  const meetingNumber = extractMeetingNumber(seminar.zoom_meeting_id || seminar.zoom_url);
  if (!meetingNumber) {
    return NextResponse.json(
      { error: "この研修にはZoomミーティングが設定されていません" },
      { status: 400 }
    );
  }

  const isHost =
    seminar.instructor_id === user.id || profile?.role === "admin";

  // 受講者のアクセス権チェック（予約済み or サブスク or 無料）
  if (!isHost) {
    const [{ data: booking }, { data: sub }] = await Promise.all([
      supabase
        .from("bookings")
        .select("id")
        .eq("seminar_id", seminarId)
        .eq("user_id", user.id)
        .eq("status", "confirmed")
        .maybeSingle(),
      supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle(),
    ]);
    const isSubscriber = !!sub || profile?.role === "subscriber";
    const hasAccess = !!booking || isSubscriber || seminar.price === 0;
    if (!hasAccess) {
      return NextResponse.json(
        { error: "この研修に参加する権限がありません（予約またはサブスクが必要です）" },
        { status: 403 }
      );
    }

    // 開始30分前〜終了2時間後のみ
    if (seminar.scheduled_at) {
      const start = new Date(seminar.scheduled_at).getTime();
      const now = Date.now();
      const open = start - 30 * 60 * 1000;
      const close = start + (seminar.duration_minutes * 60 * 1000) + 2 * 60 * 60 * 1000;
      if (now < open) {
        return NextResponse.json({ error: "まだ参加できる時間ではありません" }, { status: 403 });
      }
      if (now > close) {
        return NextResponse.json({ error: "この研修は終了しました" }, { status: 403 });
      }
    }
  }

  const role = isHost ? 1 : 0;
  const iat = Math.floor(Date.now() / 1000) - 30;
  const exp = iat + 60 * 60 * 2;
  const payload = {
    appKey: sdkKey,
    sdkKey,
    mn: meetingNumber,
    role,
    iat,
    exp,
    tokenExp: exp,
  };

  const signature = jwt.sign(payload, sdkSecret, { algorithm: "HS256" });

  return NextResponse.json({
    signature,
    sdkKey,
    meetingNumber,
    passcode: seminar.zoom_passcode || "",
    userName: profile?.full_name || "受講者",
    userEmail: profile?.email || user.email || "",
    role,
  });
}
