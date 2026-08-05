import type { IndustryLink, InstructorApplicationSubmission, Profile } from "@/types/database";
import {
  industryLinksToIndustries,
  industryLinksToWebsiteUrls,
  normalizeIndustryLinks,
  parseIndustryLinksFromProfile,
} from "@/lib/instructor-application";

export type ApplicationSource = "guest" | "member";

type PromotableApplication = Pick<
  Profile,
  | "full_name"
  | "email"
  | "avatar_url"
  | "phone"
  | "salon_location"
  | "strengths"
  | "training_topics"
  | "work_description"
  | "interest_level"
  | "preferred_time_slot"
  | "qa_preference"
  | "delivery_preference"
  | "archive_permission"
  | "lecture_frequency"
  | "contact_preference"
  | "line_intro_ok"
  | "application_notes"
> & {
  industry_links?: IndustryLink[] | null;
  industries?: string[] | null;
  website_urls?: string[] | null;
};

export function buildPublicInstructorProfile(
  data: PromotableApplication
): Partial<Profile> {
  const industryLinks = normalizeIndustryLinks(parseIndustryLinksFromProfile(data));
  const industries = industryLinksToIndustries(industryLinks);
  const website_urls = industryLinksToWebsiteUrls(industryLinks);

  return {
    full_name: data.full_name?.trim() || null,
    email: data.email?.trim() || null,
    avatar_url: data.avatar_url?.trim() || null,
    phone: data.phone?.trim() || null,
    salon_location: data.salon_location?.trim() || null,
    industry_links: industryLinks,
    industries,
    website_urls,
    strengths: data.strengths?.trim() || null,
    training_topics: data.training_topics?.trim() || null,
    work_description: data.work_description?.trim() || null,
    interest_level: data.interest_level,
    preferred_time_slot: data.preferred_time_slot,
    qa_preference: data.qa_preference,
    delivery_preference: data.delivery_preference,
    archive_permission: data.archive_permission,
    lecture_frequency: data.lecture_frequency,
    contact_preference: data.contact_preference,
    line_intro_ok: data.line_intro_ok ?? null,
    application_notes: data.application_notes?.trim() || null,
    role: "instructor",
    is_public: true,
    instructor_application_status: "approved",
    applied_at: new Date().toISOString(),
  };
}

export function submissionToPromotable(
  submission: InstructorApplicationSubmission
): PromotableApplication {
  return {
    full_name: submission.full_name,
    email: submission.email,
    avatar_url: submission.avatar_url,
    phone: submission.phone,
    salon_location: submission.salon_location,
    industry_links: submission.industry_links,
    industries: submission.industries,
    website_urls: submission.website_urls,
    strengths: submission.strengths,
    training_topics: submission.training_topics,
    work_description: submission.work_description,
    interest_level: submission.interest_level,
    preferred_time_slot: submission.preferred_time_slot,
    qa_preference: submission.qa_preference,
    delivery_preference: submission.delivery_preference,
    archive_permission: submission.archive_permission,
    lecture_frequency: submission.lecture_frequency,
    contact_preference: submission.contact_preference,
    line_intro_ok: submission.line_intro_ok,
    application_notes: submission.application_notes,
  };
}
