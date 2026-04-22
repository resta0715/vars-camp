import Link from "next/link";
import {
  Calendar,
  Play,
  Users,
  TrendingUp,
  Scissors,
  Megaphone,
  MessageCircle,
  ShoppingBag,
  CheckCircle,
  ArrowRight,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/server";

const features = [
  {
    icon: Calendar,
    title: "ライブ研修",
    description: "Zoomでリアルタイムに講師と対話しながら学べます。質問もその場で。",
  },
  {
    icon: Play,
    title: "オンデマンド",
    description: "いつでも好きな時間に、過去の研修を視聴。繰り返し学習に最適。",
  },
  {
    icon: Users,
    title: "一流の講師陣",
    description: "業界トップクラスの講師が、経営・技術・集客のすべてを教えます。",
  },
  {
    icon: TrendingUp,
    title: "経営力UP",
    description: "売上・利益・スタッフ育成。サロン経営に必要な全てが学べます。",
  },
];

const categories = [
  { icon: TrendingUp, name: "経営戦略", color: "bg-purple-100 text-purple-700" },
  { icon: Megaphone, name: "集客・マーケティング", color: "bg-orange-100 text-orange-700" },
  { icon: Scissors, name: "技術", color: "bg-cyan-100 text-cyan-700" },
  { icon: MessageCircle, name: "接客・カウンセリング", color: "bg-green-100 text-green-700" },
  { icon: Users, name: "マネジメント", color: "bg-red-100 text-red-700" },
  { icon: ShoppingBag, name: "店販・商品知識", color: "bg-yellow-100 text-yellow-700" },
];

const plans = [
  {
    name: "無料会員",
    price: "¥0",
    period: "",
    description: "気になる研修だけ、都度参加",
    features: [
      "スケジュール閲覧",
      "研修ごとに単発購入",
      "一部の無料研修に参加可能",
    ],
    cta: "無料で登録",
    featured: false,
  },
  {
    name: "サブスク会員",
    price: "¥9,800",
    period: "/月",
    description: "すべての研修が見放題",
    features: [
      "ライブ研修すべて参加し放題",
      "オンデマンド動画 見放題",
      "リアル研修 優先予約",
      "アーカイブ動画 見放題",
      "限定コミュニティ参加",
    ],
    cta: "今すぐ始める",
    featured: true,
  },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, role")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={profile} />

      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
              美容室製品卸 vars が運営
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              美容室の経営を、
              <br />
              <span className="text-brand-200">もっと強くする。</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-brand-100">
              経営戦略、集客、技術、マネジメント ——
              <br className="hidden sm:block" />
              一流の講師陣から、オンラインでいつでも学べる研修プラットフォーム。
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/login?mode=signup">
                <Button size="xl" className="bg-white text-brand-700 hover:bg-brand-50 shadow-lg">
                  無料で始める
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/schedule">
                <Button size="xl" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">
                  <Calendar className="mr-2 h-5 w-5" />
                  スケジュールを見る
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              vars camp の特徴
            </h2>
            <p className="mt-3 text-gray-500">
              美容室の成長に必要な学びを、すべてここに。
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-brand-100">
                    <feature.icon className="h-7 w-7 text-brand-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">研修カテゴリ</h2>
            <p className="mt-3 text-gray-500">
              あなたのサロンに必要なテーマが見つかります。
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-5 hover:bg-white hover:shadow-sm transition-all"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${cat.color}`}>
                  <cat.icon className="h-6 w-6" />
                </div>
                <span className="text-base font-medium text-gray-800">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">料金プラン</h2>
            <p className="mt-3 text-gray-500">
              まずは無料会員で体験。すべて学びたいならサブスクがお得。
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-8 lg:grid-cols-2">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={
                  plan.featured
                    ? "relative border-2 border-brand-500 shadow-lg shadow-brand-100"
                    : ""
                }
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-brand-600 text-white px-4">
                      <Star className="mr-1 h-3 w-3" />
                      おすすめ
                    </Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {plan.description}
                  </p>
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-sm text-gray-500">{plan.period}</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/login?mode=signup" className="block mt-8">
                    <Button
                      className="w-full"
                      size="lg"
                      variant={plan.featured ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-hero py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">
            まずは無料で体験してみませんか？
          </h2>
          <p className="mt-4 text-lg text-brand-100">
            登録は30秒。Google または LINE アカウントですぐに始められます。
          </p>
          <Link href="/auth/login?mode=signup" className="mt-8 inline-block">
            <Button size="xl" className="bg-white text-brand-700 hover:bg-brand-50 shadow-lg">
              無料会員登録
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
