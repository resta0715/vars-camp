-- ============================================
-- 講師の仮予約（時間ブロック）
-- 研修確定前に時間帯を押さえ、ダブルブッキングを防ぐ
-- ============================================

CREATE TABLE instructor_holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
  title TEXT,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'tentative'
    CHECK (status IN ('tentative', 'released')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_instructor_holds_instructor ON instructor_holds(instructor_id);
CREATE INDEX idx_instructor_holds_starts_at ON instructor_holds(starts_at);

-- 有効な仮予約同士の重複を禁止
ALTER TABLE instructor_holds ADD CONSTRAINT instructor_holds_no_overlap
  EXCLUDE USING gist (
    instructor_id WITH =,
    tstzrange(
      starts_at,
      starts_at + make_interval(mins => duration_minutes)
    ) WITH &&
  )
  WHERE (status = 'tentative');

ALTER TABLE instructor_holds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "holds_select" ON instructor_holds FOR SELECT
  USING (
    instructor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "holds_manage" ON instructor_holds FOR ALL
  USING (
    instructor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
