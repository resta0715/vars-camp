-- instructor_application_submissions への API / RLS アクセス権
GRANT SELECT, INSERT, UPDATE ON instructor_application_submissions TO anon, authenticated;
GRANT ALL ON instructor_application_submissions TO service_role;
