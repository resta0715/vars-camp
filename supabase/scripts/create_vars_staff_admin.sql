-- ============================================
-- Vars 社員・運営用管理者アカウントの権限付与
-- Supabase Dashboard > Authentication > Users でユーザーを作成した後に実行
-- ============================================

UPDATE profiles
SET
  role = 'admin',
  full_name = COALESCE(NULLIF(full_name, ''), 'Vars運営')
WHERE email = 'var-s.no.1@comet.ocn.ne.jp';

-- 確認
SELECT id, email, role, full_name, created_at
FROM profiles
WHERE email = 'var-s.no.1@comet.ocn.ne.jp';
