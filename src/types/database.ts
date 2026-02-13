export type UserLevel = 'beginner' | 'intermediate' | 'advanced';
export type PlanType = 'monthly' | '6months' | 'yearly';
export type SubscriptionStatus = 'active' | 'expired' | 'canceled';
export type PaymentChannel = 'EVC' | 'ZAAD';
export type SessionStatus = 'active' | 'ended' | 'terminated';
export type CorrectAnswer = 'a' | 'b' | 'c' | 'd';

export interface Profile {
  id: string;
  email: string;
  level: UserLevel;
  level_changed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: PlanType;
  start_date: string;
  end_date: string;
  status: SubscriptionStatus;
  payment_reference: string | null;
  payment_channel: PaymentChannel | null;
  amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  level: UserLevel;
  title: string;
  description: string | null;
  is_published: boolean;
  course_order: number;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: string;
  course_id: string;
  title: string;
  video_url: string | null;
  video_duration: number | null;
  chapter_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Exam {
  id: string;
  chapter_id: string;
  passing_score: number;
  created_at: string;
  updated_at: string;
}

export interface ExamQuestion {
  id: string;
  exam_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: CorrectAnswer;
  question_order: number;
}

export interface UserProgress {
  id: string;
  user_id: string;
  chapter_id: string;
  video_completed: boolean;
  video_progress: number;
  exam_passed: boolean;
  exam_score: number | null;
  exam_attempts: number;
  unlocked_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SpeakingSession {
  id: string;
  user_a: string;
  user_b: string;
  room_id: string;
  start_time: string;
  end_time: string | null;
  status: SessionStatus;
  created_at: string;
  updated_at: string;
}

export interface SessionRating {
  id: string;
  session_id: string;
  rater_id: string;
  rated_id: string;
  rating: number;
  created_at: string;
}

export interface WaitingUser {
  id: string;
  user_id: string;
  level: UserLevel;
  created_at: string;
}

export interface AdminUser {
  id: string;
  is_admin: boolean;
  created_at: string;
}
