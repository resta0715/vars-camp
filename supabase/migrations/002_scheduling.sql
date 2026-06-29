-- ============================================
-- スケジュール: ダブルブッキング防止
-- 同一講師の研修が時間帯で重ならないようにDBレベルで保証する
-- （アプリ側でも事前チェックするが、競合状態に対する最終防衛線）
-- ============================================

-- tstzrange を含む GiST 排他制約に必要
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE seminars DROP CONSTRAINT IF EXISTS seminars_no_overlap;

ALTER TABLE seminars ADD CONSTRAINT seminars_no_overlap
  EXCLUDE USING gist (
    instructor_id WITH =,
    tstzrange(
      scheduled_at,
      scheduled_at + make_interval(mins => duration_minutes)
    ) WITH &&
  )
  -- オンデマンド等、日時未設定（scheduled_at IS NULL）は対象外
  WHERE (scheduled_at IS NOT NULL);

-- 公開枠検索用インデックス（任意・パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_availability_instructor
  ON instructor_availability(instructor_id);
