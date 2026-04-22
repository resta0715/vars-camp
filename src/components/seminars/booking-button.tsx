"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface BookingButtonProps {
  seminarId: string;
  isLoggedIn: boolean;
  isSubscriber: boolean;
  isBooked: boolean;
  isFull: boolean;
  price: number;
  seminarType: string;
}

export function BookingButton({
  seminarId,
  isLoggedIn,
  isSubscriber,
  isBooked,
  isFull,
  price,
  seminarType,
}: BookingButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(isBooked);

  const handleBook = async () => {
    if (!isLoggedIn) {
      router.push(`/auth/login?redirect=/seminars/${seminarId}`);
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // サブスク会員 or 無料研修 → そのまま予約
    if (isSubscriber || price === 0) {
      const { error } = await supabase.from("bookings").insert({
        user_id: user.id,
        seminar_id: seminarId,
        status: "confirmed",
        paid_amount: 0,
      });

      if (error) {
        if (error.code === "23505") {
          alert("すでに予約済みです");
        } else {
          alert("予約に失敗しました: " + error.message);
        }
      } else {
        setBooked(true);
      }
    } else {
      // 有料 → Stripe Checkout へ（後で実装）
      alert("決済機能は準備中です。サブスク会員になると無料で参加できます。");
    }

    setLoading(false);
    router.refresh();
  };

  const handleCancel = async () => {
    if (!confirm("予約をキャンセルしますか？")) return;
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("seminar_id", seminarId)
      .eq("user_id", user.id);

    setBooked(false);
    setLoading(false);
    router.refresh();
  };

  if (booked) {
    return (
      <div className="space-y-3">
        <Button className="w-full bg-green-600 hover:bg-green-700" disabled>
          <CheckCircle className="mr-2 h-4 w-4" />
          予約済み
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-red-500 hover:text-red-600"
          onClick={handleCancel}
          disabled={loading}
        >
          キャンセルする
        </Button>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <Button className="w-full" size="lg" onClick={handleBook}>
        <LogIn className="mr-2 h-4 w-4" />
        ログインして予約
      </Button>
    );
  }

  return (
    <Button
      className="w-full"
      size="lg"
      onClick={handleBook}
      disabled={loading || isFull}
    >
      {loading
        ? "処理中..."
        : isFull
          ? "満席"
          : isSubscriber || price === 0
            ? "参加予約する"
            : `¥${price.toLocaleString()} で参加予約`}
    </Button>
  );
}
