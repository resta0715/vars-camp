-- Web/SNS URL を複数登録できるようにする
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS website_urls TEXT[] DEFAULT '{}';

UPDATE profiles
SET website_urls = ARRAY[website_url]
WHERE website_url IS NOT NULL
  AND btrim(website_url) <> ''
  AND (website_urls IS NULL OR website_urls = '{}');

ALTER TABLE instructor_application_submissions
  ADD COLUMN IF NOT EXISTS website_urls TEXT[] DEFAULT '{}';

UPDATE instructor_application_submissions
SET website_urls = ARRAY[website_url]
WHERE website_url IS NOT NULL
  AND btrim(website_url) <> ''
  AND (website_urls IS NULL OR website_urls = '{}');
