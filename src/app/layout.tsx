import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "vars camp | 美容室の経営を学ぶオンライン研修",
  description:
    "美容室オーナー・スタッフ向けのオンライン研修プラットフォーム。経営戦略、集客、技術、マネジメントを一流の講師から学べます。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
