-- ゲスト申込の審査ステータス
ALTER TABLE instructor_application_submissions
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected'));

-- 管理者はゲスト申込を更新可能
DROP POLICY IF EXISTS "instructor_application_submissions_update_admin"
  ON instructor_application_submissions;
CREATE POLICY "instructor_application_submissions_update_admin"
  ON instructor_application_submissions FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
