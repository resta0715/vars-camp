"use client";

import { Lock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface VideoPlayerProps {
  recordingUrl: string | null;
  hasAccess: boolean;
  seminarType: string;
}

function getEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/
  );
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`;
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return null;
}

export function VideoPlayer({ recordingUrl, hasAccess, seminarType }: VideoPlayerProps) {
  if (seminarType !== "ondemand" || !recordingUrl) return null;

  if (!hasAccess) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-gray-900 aspect-video flex items-center justify-center">
        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-gray-500 mb-3" />
          <p className="text-white font-medium">この動画を視聴するには</p>
          <p className="text-gray-400 text-sm mt-1">
            サブスク会員になるか、単発購入してください
          </p>
          <Link href="/auth/login?mode=signup" className="mt-4 inline-block">
            <Button className="bg-brand-600 hover:bg-brand-700">
              会員登録して視聴
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(recordingUrl);

  if (embedUrl) {
    return (
      <div className="overflow-hidden rounded-xl bg-black aspect-video">
        <iframe
          src={embedUrl}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // 直リンク（mp4等）
  return (
    <div className="overflow-hidden rounded-xl bg-black aspect-video">
      <video
        src={recordingUrl}
        controls
        className="h-full w-full"
        controlsList="nodownload"
      />
    </div>
  );
}
