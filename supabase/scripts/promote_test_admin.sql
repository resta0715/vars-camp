-- ============================================
-- Vars 管理者アカウント（手動実行用）
-- Supabase SQL Editor で実行してください。
-- 認証ユーザーはログイン画面のテストログイン（ID/PASS: 1234/1234）で
-- 初回作成されるか、Dashboard > Authentication > Users から手動作成します。
-- ============================================

UPDATE profiles
SET role = 'admin', full_name = 'Vars管理者'
WHERE email = 'nobuo.2.17.93@gmail.com';
