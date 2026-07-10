-- ============================================
-- 講師アンケート（ゲスト送信・未ログイン用）
-- ============================================

CREATE TABLE IF NOT EXISTS instructor_application_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  salon_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  salon_location TEXT NOT NULL,
  business_type TEXT NOT NULL,
  industries TEXT[] NOT NULL DEFAULT '{}',
  website_url TEXT,
  strengths TEXT,
  training_topics TEXT,
  work_description TEXT,
  interest_level TEXT NOT NULL,
  preferred_time_slot TEXT NOT NULL,
  qa_preference TEXT NOT NULL,
  delivery_preference TEXT,
  archive_permission TEXT,
  lecture_frequency TEXT NOT NULL,
  contact_preference TEXT NOT NULL,
  line_intro_ok BOOLEAN,
  application_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE instructor_application_submissions ENABLE ROW LEVEL SECURITY;

-- 未ログインでもアンケート送信可
CREATE POLICY "instructor_application_submissions_insert"
  ON instructor_application_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 管理者のみ閲覧
CREATE POLICY "instructor_application_submissions_select_admin"
  ON instructor_application_submissions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
