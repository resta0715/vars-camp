export type UserRole = "admin" | "instructor" | "subscriber" | "free";
export type SeminarType = "realtime" | "ondemand" | "in_person";
export type BookingStatus = "confirmed" | "cancelled" | "attended" | "no_show";
export type SubscriptionStatus = "active" | "cancelled" | "past_due" | "trialing" | "incomplete";

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
  created_at: string;
  updated_at: string;
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

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}
