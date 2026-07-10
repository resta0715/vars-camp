import Link from "next/link";
import type { Metadata } from "next";
import {
  BarChart3,
  Calendar,
  CheckCircle,
  ClipboardList,
  Globe2,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";

// LP はログイン状態に依存しないため静的配信。ヘッダーのログイン表示はクライアント側で解決する。
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "講師募集 | vars camp",
  description:
    "美容室の経営を学ぶオンライン講座の講師を募集しています。仕組みづくりのため、アンケートへのご協力をお願いしています。",
};

/** サイト内講師アンケート */
const SURVEY_HREF = "/for-instructors/apply";

const benefits = [
  {
    icon: Users,
    title: "これまでに届かなかった層へ",
    description:
      "全国各地のサロンオーナーやスタッフがプラットフォームに集まっています。セミナー会場だけでは届きにくかった学びも、オンラインなら同時に伝えられます。",
  },
  {
    icon: Video,
    title: "Zoomライブ研修に対応",
    description:
      "リアルタイムの質疑応答まで含めて、これまで講師としてやってきたスタイルを活かせます。録画・オンデマンド展開とも組み合わせやすい設計です。",
  },
  {
    icon: Calendar,
    title: "日程・概要は自分で設計",
    description:
      "テーマや所要時間は講師の専門性に沿って設計できます。研修の詳細ページで内容を伝え、参加者の予約を受け付けます。",
  },
  {
    icon: ShieldCheck,
    title: "vars のブランドと信頼",
    description:
      "美容室向け製品卸「vars」が運営する研修基盤。業界に根ざした信頼感のある場で、自分のコンテンツを安心して載せられます。",
  },
];

const audiences = [
  "経営数字・組織づくり・採用など、経営面で実績と言語化力のある方",
  "集客・SNS・店販など、売上につなげる施策に強いマーケ担当・オーナー",
  "カラー・パーマなど技術でも指導歴があり、オンラインでも伝えたいことのある方",
  "カウンセリングや接客、マネジメントで現場を磨いてきた方",
];

const surveyTopics = [
  "お名前・業態・業種",
  "ご参加への関心度（「大変興味ある〜」など）",
  "希望の開始時間帯（18時開始を想定。17時／19時／20時、その他にも対応）",
  "講座中の質問の受け方（後日／チャット／リアルタイムなど）",
  "配信の希望（リアルタイムのみ、オンデマンド、両方可）・アーカイブの可否",
  "希望する講義の回数・頻度・ご連絡方法（LINE・メール・運営からの連絡など）・公式 LINE でのご紹介の可否",
];

const steps = [
  {
    step: "01",
    title: "アンケートに回答",
    body: "現在は講師の皆さまのご希望を把握し、オンラインセミナーと「繋ぐ会」の仕組みをつくる段階です。まずはサイト内のアンケートフォームでご入力をお願いしています（所要目安・数分）。",
  },
  {
    step: "02",
    title: "運営からご連絡",
    body: "フォームで選んでいただいた方法（LINE・メール、または運営からのご連絡希望など）を踏まえて、詳細をすり合わせます。",
  },
  {
    step: "03",
    title: "ご本人確認・講師としての準備",
    body: "内容が固まり次第、アカウント作成や講師権限の付与など、運営と一緒に進めていきます。",
  },
  {
    step: "04",
    title: "講座の設計と開催",
    body: "ご希望に沿って日程・開催形式を調整します。参加者向けページや Zoom 運用など、プラットフォーム側でもサポートします。",
  },
];

const faqs = [
  {
    q: "「アンケート」と「入会登録」のどちらから始めればよいですか？",
    a: "まずはサイト内のアンケートフォームからご回答ください。アカウント作成は任意で、希望される方はフォーム内でメールとパスワードを設定できます。すでに Google / LINE で登録済みの方はログインしてから送信してください。",
  },
  {
    q: "報酬体系はどうなりますか？",
    a: "契約形態や単価は案件ごとに異なります。フォーム送信後・打ち合わせ時に、内容に応じて個別にご説明します。",
  },
  {
    q: "すでに他社のオンライン講座を持っていても応募できますか？",
    a: "可能です。vars camp で扱うテーマやスケジュールが、既存のご提供と矛盾しない範囲で調整します。",
  },
  {
    q: "地方在住でも問題ありませんか？",
    a: "オンラインを前提としており居住地域は問いません。インターネット環境と配信環境が安定していることが望ましいです。",
  },
];

export default function ForInstructorsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="pointer-events-none absolute -right-32 top-24 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-20 lg:px-8 lg:pb-36">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="secondary"
              className="border border-white/20 bg-white/10 text-brand-100 hover:bg-white/15"
            >
              <ClipboardList className="mr-1.5 h-3.5 w-3.5" />
              講師様アンケート実施中
            </Badge>
            <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              オンラインセミナーと「繋ぐ会」——
              <br />
              <span className="text-brand-100">講師としてのご協力を募集中です。</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-brand-100">
              美容室の経営を学ぶオンラインの場を、参加者と講師の皆さまと一緒に育てていきたいと考えています。
              仕組みを整えるための段階でもあり、ご希望や実情を把握するためにサイト内のアンケートへのご協力をお願いしています。
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="xl" className="bg-white text-brand-700 shadow-lg hover:bg-brand-50" asChild>
                <Link href={SURVEY_HREF}>
                  アンケートに回答する
                </Link>
              </Button>
              <Link href="#flow">
                <Button
                  size="xl"
                  variant="outline"
                  className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  ご案内の流れを見る
                </Button>
              </Link>
            </div>
            <p className="mx-auto mt-6 max-w-xl text-center text-sm text-brand-100/85">
              アンケート送信後、ご記入の連絡方法で運営からご連絡します。
              <br className="hidden sm:block" />
              アカウント作成は任意です。希望される方はフォーム内でパスワードを設定できます。
            </p>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-gray-200 bg-white py-10">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { icon: Globe2, label: "全国の参加者リーチ" },
            { icon: Sparkles, label: "プラットフォーム機能を活用" },
            { icon: BarChart3, label: "研修・予約の可視化" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-center gap-3 text-sm font-medium text-gray-700"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
                <item.icon className="h-5 w-5" />
              </div>
              {item.label}
            </div>
          ))}
        </div>
      </section>

      {/* Survey scope */}
      <section className="border-b border-gray-200 bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900">アンケートでお伺いしていること</h2>
          <p className="mt-3 text-sm text-gray-600">
            サイト内アンケートフォームの内容を要約しています。
          </p>
          <ul className="mx-auto mt-8 max-w-xl space-y-3 text-left text-sm text-gray-700">
            {surveyTopics.map((t) => (
              <li key={t} className="flex gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <Button className="mt-10" size="lg" asChild>
            <Link href={SURVEY_HREF}>アンケートフォームへ進む</Link>
          </Button>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">講師として参加するメリット</h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-500">
              単なる「講師マッチング」ではなく、美容室業界に特化した学びのインフラの一部として、自分の強みを形にできます。
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {benefits.map((b) => (
              <Card key={b.title} className="transition-shadow hover:shadow-md">
                <CardContent className="p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
                    <b.icon className="h-6 w-6 text-brand-700" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-gray-900">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{b.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Audience */}
      <section className="bg-gradient-to-br from-brand-50/80 via-white to-accent-50/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">こんな方にフィットしています</h2>
              <p className="mt-4 text-gray-600">
                「教えること」だけでなく、現場で結果を出してきた方のリアルな言葉には、参加者の背中を押す力があります。
              </p>
              <Button className="mt-8 lg:hidden" size="lg" asChild>
                <Link href={SURVEY_HREF}>アンケートへ進む</Link>
              </Button>
            </div>
            <ul className="space-y-4">
              {audiences.map((text) => (
                <li
                  key={text}
                  className="flex gap-3 rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-600" />
                  <span className="text-gray-700">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Flow */}
      <section id="flow" className="scroll-mt-24 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">現在のご案内フロー</h2>
            <p className="mt-3 text-gray-500">
              まずはアンケートから。以降はご記入いただいた連絡手段に沿って運営からご連絡します。
            </p>
          </div>
          <div className="mx-auto mt-14 grid max-w-3xl gap-6">
            {steps.map((s) => (
              <div key={s.step} className="relative flex gap-6">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-sm font-bold text-white">
                  {s.step}
                </div>
                <div className="flex-1 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-gray-200 bg-gray-50 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900">よくある質問</h2>
          <div className="mt-10 space-y-4">
            {faqs.map((f) => (
              <Card key={f.q}>
                <CardContent className="p-6">
                  <p className="font-semibold text-gray-900">{f.q}</p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{f.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-hero py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <GraduationCap className="mx-auto h-14 w-14 text-brand-200" />
          <h2 className="mt-4 text-3xl font-bold text-white">まずはアンケートから、ご参加の意思をお聞かせください。</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-100">
            ご質問やご意見はフォーム内のフリーコメント欄にもご記入いただけます。内容を踏まえて運営からご連絡します。
          </p>
          <Button size="xl" className="mt-8 bg-white text-brand-700 shadow-lg hover:bg-brand-50" asChild>
            <Link href={SURVEY_HREF}>Vars camp 講師様アンケートへ</Link>
          </Button>
          <p className="mx-auto mt-6 max-w-lg text-center text-sm text-brand-100/90">
            すでに会員として vars camp をご利用の方は、ログインしてからアンケートを送信してください。
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-brand-100">
            <Link href="/" className="underline-offset-4 hover:underline">
              トップへ戻る
            </Link>
            <Link href="/seminars" className="underline-offset-4 hover:underline">
              参加者向け研修一覧
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
