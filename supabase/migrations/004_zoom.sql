-- ============================================
-- Zoom Meeting SDK 埋め込み配信用
-- 生のZoom URLを配布せず、ミーティングID＋パスコードで
-- 自社サイト内（署名付き）参加に切り替えるための列
-- ============================================

ALTER TABLE seminars
  ADD COLUMN IF NOT EXISTS zoom_passcode TEXT;

-- zoom_meeting_id は既存（001_initial_schema.sql）
