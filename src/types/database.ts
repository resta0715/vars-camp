export type UserRole = "admin" | "instructor" | "subscriber" | "free";
export type SeminarType = "realtime" | "ondemand" | "in_person";
export type BookingStatus = "confirmed" | "cancelled" | "attended" | "no_show";
export type SubscriptionStatus = "active" | "cancelled" | "past_due" | "trialing" | "incomplete";
export type InstructorApplicationStatus = "pending" | "approved" | "rejected";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  salon_name: string | null;
  salon_location: string | null;
  phone: string | null;
  bio: string | null;
  stripe_customer_id: string | null;
  // 講師プロフィール
  industries: string[] | null;
  strengths: string | null;
  training_topics: string | null;
  work_description: string | null;
  is_public: boolean | null;
  website_url: string | null;
  business_type: string | null;
  // 講師申込
  instructor_application_status: InstructorApplicationStatus | null;
  interest_level: string | null;
  preferred_time_slot: string | null;
  qa_preference: string | null;
  delivery_preference: string | null;
  archive_permission: string | null;
  lecture_frequency: string | null;
  contact_preference: string | null;
  line_intro_ok: boolean | null;
  application_notes: string | null;
  applied_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InstructorApplicationPayload {
  full_name: string;
  salon_name: string;
  phone: string;
  salon_location: string;
  business_type: string;
  industries: string[];
  website_url?: string;
  strengths?: string;
  training_topics?: string;
  work_description?: string;
  interest_level: string;
  preferred_time_slot: string;
  qa_preference: string;
  delivery_preference?: string;
  archive_permission?: string;
  lecture_frequency: string;
  contact_preference: string;
  line_intro_ok?: boolean;
  application_notes?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  icon: string;
  sort_order: number;
  created_at: string;
}

export interface Seminar {
  id: string;
  instructor_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  seminar_type: SeminarType;
  scheduled_at: string | null;
  duration_minutes: number;
  capacity: number | null;
  location: string | null;
  zoom_url: string | null;
  zoom_meeting_id: string | null;
  zoom_passcode: string | null;
  recording_url: string | null;
  thumbnail_url: string | null;
  price: number;
  is_published: boolean;
  is_approved: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  // joined fields
  instructor?: Profile;
  category?: Category;
  booking_count?: number;
}

export interface Booking {
  id: string;
  user_id: string;
  seminar_id: string;
  status: BookingStatus;
  payment_intent_id: string | null;
  paid_amount: number;
  created_at: string;
  // joined
  seminar?: Seminar;
  user?: Profile;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface ViewHistory {
  id: string;
  user_id: string;
  seminar_id: string;
  watched_seconds: number;
  completed: boolean;
  last_watched_at: string;
  seminar?: Seminar;
}

export interface InstructorAvailability {
  id: string;
  instructor_id: string;
  day_of_week: number | null;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  specific_date: string | null;
  created_at: string;
}

export type InstructorHoldStatus = "tentative" | "released";

export interface InstructorHold {
  id: string;
  instructor_id: string;
  starts_at: string;
  duration_minutes: number;
  title: string | null;
  note: string | null;
  status: InstructorHoldStatus;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}
