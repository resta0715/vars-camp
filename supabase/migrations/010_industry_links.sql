-- 業種・専門分野と URL のペア登録
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS industry_links JSONB DEFAULT '[]'::jsonb;

ALTER TABLE instructor_application_submissions
  ADD COLUMN IF NOT EXISTS industry_links JSONB DEFAULT '[]'::jsonb;

-- 既存データをペア形式へ移行（インデックスが一致するもの同士）
UPDATE profiles p
SET industry_links = paired.links
FROM (
  SELECT
    id,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'name', n,
          'url', COALESCE(u, '')
        )
        ORDER BY ord
      ) FILTER (WHERE n IS NOT NULL AND btrim(n) <> ''),
      '[]'::jsonb
    ) AS links
  FROM profiles
  CROSS JOIN LATERAL generate_series(
    1,
    GREATEST(
      COALESCE(array_length(industries, 1), 0),
      COALESCE(array_length(website_urls, 1), 0),
      CASE WHEN website_url IS NOT NULL AND btrim(website_url) <> '' THEN 1 ELSE 0 END
    )
  ) AS gs(ord)
  LEFT JOIN LATERAL (
    SELECT industries[ord] AS n
  ) ind ON true
  LEFT JOIN LATERAL (
    SELECT COALESCE(website_urls[ord], CASE WHEN ord = 1 THEN website_url END) AS u
  ) url ON true
  GROUP BY id
) paired
WHERE p.id = paired.id
  AND (p.industry_links IS NULL OR p.industry_links = '[]'::jsonb)
  AND paired.links <> '[]'::jsonb;

UPDATE instructor_application_submissions s
SET industry_links = paired.links
FROM (
  SELECT
    id,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'name', n,
          'url', COALESCE(u, '')
        )
        ORDER BY ord
      ) FILTER (WHERE n IS NOT NULL AND btrim(n) <> ''),
      '[]'::jsonb
    ) AS links
  FROM instructor_application_submissions
  CROSS JOIN LATERAL generate_series(
    1,
    GREATEST(
      COALESCE(array_length(industries, 1), 0),
      COALESCE(array_length(website_urls, 1), 0),
      CASE WHEN website_url IS NOT NULL AND btrim(website_url) <> '' THEN 1 ELSE 0 END
    )
  ) AS gs(ord)
  LEFT JOIN LATERAL (
    SELECT industries[ord] AS n
  ) ind ON true
  LEFT JOIN LATERAL (
    SELECT COALESCE(website_urls[ord], CASE WHEN ord = 1 THEN website_url END) AS u
  ) url ON true
  GROUP BY id
) paired
WHERE s.id = paired.id
  AND (s.industry_links IS NULL OR s.industry_links = '[]'::jsonb)
  AND paired.links <> '[]'::jsonb;
