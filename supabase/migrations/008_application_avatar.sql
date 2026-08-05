-- 講師アンケート（ゲスト）にプロフィール画像URLを追加
ALTER TABLE instructor_application_submissions
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;
