"use client";

import { useState, useEffect, useRef } from "react";
import { Video, Clock, Loader2, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ZoomMeetingProps {
  seminarId: string;
  scheduledAt: string | null;
  durationMinutes: number;
  seminarType: string;
  isBooked: boolean;
  isSubscriber: boolean;
  isFree: boolean;
  canHost: boolean;
  hasMeeting: boolean;
}

interface ZoomClient {
  init: (opts: Record<string, unknown>) => Promise<void>;
  join: (opts: Record<string, unknown>) => Promise<void>;
  leave?: () => Promise<void>;
}

export function ZoomMeeting({
  seminarId,
  scheduledAt,
  durationMinutes,
  seminarType,
  isBooked,
  isSubscriber,
  isFree,
  canHost,
  hasMeeting,
}: ZoomMeetingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<ZoomClient | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [status, setStatus] = useState<"idle" | "joining" | "joined">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  if (seminarType !== "realtime" || !hasMeeting) return null;

  const hasAccess = canHost || isBooked || isSubscriber || isFree;
  if (!hasAccess) return null;

  // 受講者向けの時間ゲート（ホストはいつでも開始可能）
  let isOpen = true;
  let minutesUntilOpen = 0;
  let isEnded = false;
  if (!canHost && scheduledAt) {
    const start = new Date(scheduledAt).getTime();
    const open = start - 30 * 60 * 1000;
    const close = start + durationMinutes * 60 * 1000 + 2 * 60 * 60 * 1000;
    const t = now.getTime();
    isOpen = t >= open && t <= close;
    isEnded = t > close;
    minutesUntilOpen = Math.ceil((open - t) / 60000);
  }

  const handleJoin = async () => {
    setError(null);
    setStatus("joining");
    try {
      const res = await fetch("/api/zoom/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seminarId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "参加に失敗しました");
        setStatus("idle");
        return;
      }

      const { default: ZoomMtgEmbedded } = await import("@zoom/meetingsdk/embedded");
      const client = ZoomMtgEmbedded.createClient() as unknown as ZoomClient;
      clientRef.current = client;
      const root = containerRef.current;
      if (!root) {
        setError("表示領域の初期化に失敗しました");
        setStatus("idle");
        return;
      }

      setStatus("joined");
      // モーダルの表示反映を待ってから初期化（非表示のまま初期化すると黒画面になるため）
      await new Promise((r) => setTimeout(r, 50));
      await client.init({
        zoomAppRoot: root,
        language: "jp-JP",
        patchJsMedia: true,
        customize: {
          video: {
            isResizable: true,
            viewSizes: { default: { width: 1000, height: 600 } },
          },
        },
      });
      await client.join({
        sdkKey: data.sdkKey,
        signature: data.signature,
        meetingNumber: data.meetingNumber,
        password: data.passcode || "",
        userName: data.userName,
        userEmail: data.userEmail,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "参加処理でエラーが発生しました";
      setError(msg);
      setStatus("idle");
    }
  };

  const handleLeave = async () => {
    try {
      await clientRef.current?.leave?.();
    } catch {
      // ignore
    }
    clientRef.current = null;
    setStatus("idle");
  };

  const showWaiting = status === "idle" && !isEnded && !canHost && !isOpen;
  const showButton = status !== "joined" && !isEnded && (canHost || isOpen);
  const showEnded = status === "idle" && isEnded;

  return (
    <>
      <div className="space-y-2">
        {showEnded && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
            <p className="text-sm text-gray-500">この研修は終了しました</p>
          </div>
        )}

        {showWaiting && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
            <Clock className="mx-auto mb-2 h-6 w-6 text-blue-500" />
            <p className="text-sm font-medium text-blue-700">
              参加ボタンは開始30分前に有効になります
            </p>
            <p className="mt-1 text-xs text-blue-500">あと約{Math.max(minutesUntilOpen, 0)}分</p>
          </div>
        )}

        {showButton && (
          <Button
            size="lg"
            className="w-full bg-[#2D8CFF] text-white hover:bg-[#2681F2]"
            onClick={handleJoin}
            disabled={status === "joining"}
          >
            {status === "joining" ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                接続中...
              </>
            ) : (
              <>
                <Video className="mr-2 h-5 w-5" />
                {canHost ? "配信を開始する" : "サイト内で参加する"}
              </>
            )}
          </Button>
        )}

        {status === "joined" && (
          <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-center text-xs text-green-700">
            配信ウィンドウで視聴中です
          </p>
        )}

        {error && (
          <p className="flex items-center gap-1.5 text-xs text-red-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            {error}
          </p>
        )}
      </div>

      {/* 全画面モーダル（参加時のみ表示・コンテナは常時マウント） */}
      <div
        className={
          status === "joined"
            ? "fixed inset-0 z-50 flex flex-col bg-black/90 p-2 sm:p-4"
            : "hidden"
        }
      >
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-sm font-medium text-white">サイト内ライブ配信</span>
          <button
            onClick={handleLeave}
            className="flex items-center gap-1 rounded-md bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
            退出
          </button>
        </div>
        <div
          ref={containerRef}
          className="zoom-embed-root flex-1 overflow-hidden rounded-lg bg-black"
        />
      </div>
    </>
  );
}
