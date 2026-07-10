-- ============================================
-- テスト管理者アカウント（手動実行用）
-- Supabase SQL Editor で実行してください。
-- 認証ユーザーは Dashboard > Authentication > Users から
-- test@vars-camp.dev を作成するか、修正後のテストログイン API を使います。
-- ============================================

UPDATE profiles
SET role = 'admin', full_name = 'テスト管理者'
WHERE email = 'test@vars-camp.dev';

-- 自分の Gmail を管理者にする場合:
-- UPDATE profiles SET role = 'admin' WHERE email = 'mdit2416@gmail.com';
