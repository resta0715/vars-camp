-- ============================================
-- vars camp - 初期スキーマ
-- 美容室向けZoom研修プラットフォーム
-- ============================================

-- プロフィール（Supabase auth.users を拡張）
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'free'
    CHECK (role IN ('admin', 'instructor', 'subscriber', 'free')),
  salon_name TEXT,
  salon_location TEXT,
  phone TEXT,
  bio TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 研修カテゴリ
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#9333ea',
  icon TEXT DEFAULT 'BookOpen',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 研修
CREATE TABLE seminars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES profiles(id),
  category_id UUID REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT,
  seminar_type TEXT NOT NULL
    CHECK (seminar_type IN ('realtime', 'ondemand', 'in_person')),
  scheduled_at TIMESTAMPTZ,
  duration_minutes INT DEFAULT 60,
  capacity INT,                    -- NULL = 無制限（オンライン）
  location TEXT,                   -- リアル会場用
  zoom_url TEXT,
  zoom_meeting_id TEXT,
  recording_url TEXT,              -- オンデマンド用
  thumbnail_url TEXT,
  price INT DEFAULT 0,             -- 非サブスク会員向け単発価格（円）
  is_published BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 予約
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  seminar_id UUID NOT NULL REFERENCES seminars(id),
  status TEXT NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('confirmed', 'cancelled', 'attended', 'no_show')),
  payment_intent_id TEXT,
  paid_amount INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, seminar_id)
);

-- サブスクリプション
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  stripe_subscription_id TEXT NOT NULL,
  stripe_price_id TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing', 'incomplete')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 視聴履歴（オンデマンド用）
CREATE TABLE view_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  seminar_id UUID NOT NULL REFERENCES seminars(id),
  watched_seconds INT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, seminar_id)
);

-- 講師の空き時間スロット
CREATE TABLE instructor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES profiles(id),
  day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_recurring BOOLEAN DEFAULT TRUE,
  specific_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 通知
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- インデックス
-- ============================================

CREATE INDEX idx_seminars_scheduled_at ON seminars(scheduled_at);
CREATE INDEX idx_seminars_instructor_id ON seminars(instructor_id);
CREATE INDEX idx_seminars_category_id ON seminars(category_id);
CREATE INDEX idx_seminars_type ON seminars(seminar_type);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_seminar_id ON bookings(seminar_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seminars ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE view_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_availability ENABLE ROW LEVEL SECURITY;

-- profiles: 誰でも閲覧可、本人のみ更新
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- categories: 誰でも閲覧可、管理者のみ変更
CREATE POLICY "categories_select" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_admin" ON categories FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- seminars: 公開済みは誰でも閲覧可、講師は自分の研修を管理
CREATE POLICY "seminars_select_published" ON seminars FOR SELECT
  USING (is_published = true OR instructor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "seminars_insert_instructor" ON seminars FOR INSERT
  WITH CHECK (
    instructor_id = auth.uid()
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('instructor', 'admin'))
  );
CREATE POLICY "seminars_update_instructor" ON seminars FOR UPDATE
  USING (instructor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- bookings: 本人のみ閲覧・作成、講師は自分の研修の予約を閲覧
CREATE POLICY "bookings_select" ON bookings FOR SELECT
  USING (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM seminars WHERE seminars.id = bookings.seminar_id AND seminars.instructor_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "bookings_insert" ON bookings FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "bookings_update" ON bookings FOR UPDATE
  USING (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- subscriptions: 本人のみ
CREATE POLICY "subscriptions_select" ON subscriptions FOR SELECT
  USING (user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- view_history: 本人のみ
CREATE POLICY "view_history_select" ON view_history FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "view_history_upsert" ON view_history FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "view_history_update" ON view_history FOR UPDATE USING (user_id = auth.uid());

-- notifications: 本人のみ
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- instructor_availability: 講師本人と管理者
CREATE POLICY "availability_select" ON instructor_availability FOR SELECT USING (true);
CREATE POLICY "availability_manage" ON instructor_availability FOR ALL
  USING (instructor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================
-- 新規ユーザー登録時に自動でprofile作成するトリガー
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 初期カテゴリデータ
-- ============================================

INSERT INTO categories (name, slug, description, color, icon, sort_order) VALUES
  ('経営戦略', 'management', '経営戦略・ビジョン・数値管理', '#9333ea', 'TrendingUp', 1),
  ('集客・マーケティング', 'marketing', 'SNS・広告・リピート施策', '#ea580c', 'Megaphone', 2),
  ('技術', 'technique', 'カット・カラー・パーマ技術', '#0891b2', 'Scissors', 3),
  ('接客・カウンセリング', 'consulting', '接客スキル・カウンセリング力', '#16a34a', 'MessageCircle', 4),
  ('マネジメント', 'leadership', 'スタッフ育成・チームビルディング', '#dc2626', 'Users', 5),
  ('店販・商品知識', 'retail', '商品知識・店販テクニック', '#ca8a04', 'ShoppingBag', 6),
  ('開業・独立', 'startup', '開業準備・資金計画・物件', '#7c3aed', 'Rocket', 7),
  ('その他', 'other', 'その他のテーマ', '#64748b', 'BookOpen', 8);
