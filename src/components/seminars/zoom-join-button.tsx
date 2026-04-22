"use client";

import { useState, useEffect } from "react";
import { Video, Clock, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ZoomJoinButtonProps {
  zoomUrl: string | null;
  scheduledAt: string | null;
  isBooked: boolean;
  isSubscriber: boolean;
  seminarType: string;
}

export function ZoomJoinButton({
  zoomUrl,
  scheduledAt,
  isBooked,
  isSubscriber,
  seminarType,
}: ZoomJoinButtonProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  if (seminarType !== "realtime" || !zoomUrl) return null;

  const hasAccess = isBooked || isSubscriber;
  if (!hasAccess) return null;

  if (!scheduledAt) return null;

  const startTime = new Date(scheduledAt);
  const thirtyMinBefore = new Date(startTime.getTime() - 30 * 60 * 1000);
  const twoHoursAfter = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
  const isOpen = now >= thirtyMinBefore && now <= twoHoursAfter;
  const minutesUntilOpen = Math.ceil((thirtyMinBefore.getTime() - now.getTime()) / 60000);

  if (now > twoHoursAfter) {
    return (
      <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-center">
        <p className="text-sm text-gray-500">この研修は終了しました</p>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-center">
        <Clock className="mx-auto h-6 w-6 text-blue-500 mb-2" />
        <p className="text-sm font-medium text-blue-700">
          Zoom参加リンクは開始30分前に表示されます
        </p>
        <p className="text-xs text-blue-500 mt-1">
          あと約{minutesUntilOpen}分
        </p>
      </div>
    );
  }

  return (
    <a href={zoomUrl} target="_blank" rel="noopener noreferrer" className="block">
      <Button size="lg" className="w-full bg-[#2D8CFF] hover:bg-[#2681F2] text-white">
        <Video className="mr-2 h-5 w-5" />
        Zoomで参加する
      </Button>
    </a>
  );
}
