export const INTEREST_LEVELS = [
  { value: "5", label: "大変興味ある" },
  { value: "4", label: "興味ある" },
  { value: "3", label: "もう少し聞かないとわからない" },
  { value: "2", label: "今はタイミングではない" },
  { value: "1", label: "興味ない" },
] as const;

export const TIME_SLOTS = [
  { value: "17:00", label: "17時から" },
  { value: "18:00", label: "18時から" },
  { value: "19:00", label: "19時から" },
  { value: "20:00", label: "20時から" },
  { value: "other", label: "その他" },
] as const;

export const QA_PREFERENCES = [
  { value: "later", label: "後日対応" },
  { value: "chat", label: "チャットにて" },
  { value: "realtime", label: "時間があればリアルタイム対応" },
  { value: "none", label: "受け付けない" },
] as const;

export const DELIVERY_PREFERENCES = [
  { value: "realtime", label: "リアルタイム" },
  { value: "ondemand", label: "オンデマンド" },
  { value: "both", label: "どちらも可能" },
] as const;

export const ARCHIVE_PERMISSIONS = [
  { value: "yes", label: "可能" },
  { value: "no", label: "不可" },
] as const;

export const LECTURE_FREQUENCIES = [
  { value: "monthly_2", label: "月2回" },
  { value: "monthly_1", label: "月1回" },
  { value: "bimonthly", label: "2ヶ月に1回" },
  { value: "other", label: "その他" },
] as const;

export const CONTACT_PREFERENCES = [
  { value: "line", label: "LINE" },
  { value: "email", label: "メール" },
  { value: "admin", label: "管理側より連絡" },
] as const;

export type { IndustryLink } from "@/types/database";
import type { IndustryLink } from "@/types/database";

export const EMPTY_INDUSTRY_LINK: IndustryLink = { name: "", url: "" };

export type InstructorApplicationFormData = {
  full_name: string;
  phone: string;
  salon_location: string;
  avatar_url: string;
  industry_links: IndustryLink[];
  strengths: string;
  training_topics: string;
  work_description: string;
  interest_level: string;
  preferred_time_slot: string;
  qa_preference: string;
  delivery_preference: string;
  archive_permission: string;
  lecture_frequency: string;
  contact_preference: string;
  line_intro_ok: boolean;
  application_notes: string;
};

export const EMPTY_APPLICATION_FORM: InstructorApplicationFormData = {
  full_name: "",
  phone: "",
  salon_location: "",
  avatar_url: "",
  industry_links: [{ ...EMPTY_INDUSTRY_LINK }],
  strengths: "",
  training_topics: "",
  work_description: "",
  interest_level: "",
  preferred_time_slot: "",
  qa_preference: "",
  delivery_preference: "",
  archive_permission: "",
  lecture_frequency: "",
  contact_preference: "",
  line_intro_ok: false,
  application_notes: "",
};

export function parseListInput(raw: string): string[] {
  return raw
    .split(/[,、\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/** @deprecated use parseListInput */
export const parseIndustriesInput = parseListInput;

export function validateApplicationPayload(
  body: Partial<InstructorApplicationFormData>
): string | null {
  const required: (keyof InstructorApplicationFormData)[] = [
    "full_name",
    "salon_location",
    "interest_level",
    "preferred_time_slot",
    "qa_preference",
    "lecture_frequency",
    "contact_preference",
  ];

  for (const key of required) {
    const value = body[key];
    if (typeof value !== "string" || !value.trim()) {
      return `${key} は必須です`;
    }
  }

  if (!Array.isArray(body.industry_links)) {
    return "業種・専門分野を1つ以上入力してください";
  }

  const validLinks = normalizeIndustryLinks(body.industry_links);
  if (validLinks.length === 0) {
    return "業種・専門分野を1つ以上入力してください";
  }

  return null;
}

export function normalizeIndustryLinks(links: IndustryLink[] | undefined): IndustryLink[] {
  if (!Array.isArray(links)) return [];
  return links
    .map((link) => ({
      name: link.name?.trim() || "",
      url: normalizeWebsiteUrl(link.url || ""),
    }))
    .filter((link) => link.name);
}

export function industryLinksToIndustries(links: IndustryLink[]): string[] {
  return normalizeIndustryLinks(links).map((link) => link.name);
}

export function industryLinksToWebsiteUrls(links: IndustryLink[]): string[] {
  return normalizeIndustryLinks(links)
    .map((link) => link.url)
    .filter(Boolean);
}

export function parseIndustryLinksFromProfile(profile: {
  industry_links?: IndustryLink[] | null;
  industries?: string[] | null;
  website_urls?: string[] | null;
  website_url?: string | null;
}): IndustryLink[] {
  if (Array.isArray(profile.industry_links) && profile.industry_links.length > 0) {
    return profile.industry_links.map((link) => ({
      name: link.name || "",
      url: link.url || "",
    }));
  }

  const names = profile.industries?.length ? profile.industries : [];
  const urls = profile.website_urls?.length
    ? profile.website_urls
    : profile.website_url
      ? [profile.website_url]
      : [];
  const count = Math.max(names.length, urls.length, 1);

  return Array.from({ length: count }, (_, index) => ({
    name: names[index] || "",
    url: urls[index] || "",
  }));
}

export function normalizeWebsiteUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || value.startsWith("@")) return value;
  return `https://${value}`;
}

export function normalizeWebsiteUrls(urls: string[] | undefined): string[] {
  if (!Array.isArray(urls)) return [];
  return urls.map(normalizeWebsiteUrl).filter(Boolean);
}

export function optionLabel(
  options: readonly { value: string; label: string }[],
  value: string | null | undefined
): string {
  if (!value) return "-";
  return options.find((option) => option.value === value)?.label || value;
}
