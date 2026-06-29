-- ============================================
-- 講師プロフィール拡張
-- 講師が自己紹介情報（業種・強み・研修内容・仕事内容）と
-- 顔写真を登録し、公開/非公開を切り替えられるようにする
-- ============================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS industries TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS strengths TEXT,
  ADD COLUMN IF NOT EXISTS training_topics TEXT,
  ADD COLUMN IF NOT EXISTS work_description TEXT,
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- ============================================
-- 顔写真用ストレージバケット（公開読み取り）
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('instructor-photos', 'instructor-photos', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 公開読み取り
DROP POLICY IF EXISTS "instructor_photos_public_read" ON storage.objects;
CREATE POLICY "instructor_photos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'instructor-photos');

-- 本人フォルダ（先頭が自分のUID）へのみアップロード可
DROP POLICY IF EXISTS "instructor_photos_insert" ON storage.objects;
CREATE POLICY "instructor_photos_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'instructor-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "instructor_photos_update" ON storage.objects;
CREATE POLICY "instructor_photos_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'instructor-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "instructor_photos_delete" ON storage.objects;
CREATE POLICY "instructor_photos_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'instructor-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
