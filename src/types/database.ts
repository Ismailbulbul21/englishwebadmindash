export type EnglishLevel = 'beginner' | 'intermediate' | 'advanced';
export type PlanType = 'monthly' | '6months' | 'yearly';
export type SubscriptionStatus = 'active' | 'expired' | 'canceled';
export type PaymentChannel = 'EVC' | 'ZAAD' | 'SAHAL';
export type SessionStatus = 'active' | 'ended' | 'terminated';
export type LessonDifficultyBand = 'very_easy' | 'developing' | 'challenging' | 'mastery';
export type LessonSectionKey =
  | 'warm_up'
  | 'core_language'
  | 'conversation'
  | 'practice'
  | 'speaking'
  | 'recap';
export type LessonItemType = 'vocabulary' | 'phrase';
export type LessonQuizQuestionType = 'meaning_choice' | 'fill_blank' | 'word_order';

export interface Profile {
  id: string;
  email: string | null;
  username: string | null;
  region: string | null;
  voice_intro_url: string | null;
  voice_intro_duration_sec: number | null;
  is_discoverable: boolean;
  last_seen_at: string | null;
  english_level: EnglishLevel | null;
  lessons_onboarding_done: boolean;
  created_at: string | null;
  updated_at: string | null;
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
  amount: number | null;
  currency: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Lesson {
  id: string;
  level: EnglishLevel;
  title: string;
  subtitle: string;
  description: string | null;
  position: number;
  estimated_minutes: number;
  is_published: boolean;
  unit_number: number;
  unit_title: string;
  goal: string | null;
  pronunciation_focus: string | null;
  grammar_focus: string | null;
  slug: string | null;
  difficulty_band: LessonDifficultyBand;
  created_at: string;
  updated_at: string;
}

export interface LessonSection {
  id: string;
  lesson_id: string;
  position: number;
  section_key: LessonSectionKey;
  title: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface LessonItem {
  id: string;
  lesson_id: string;
  position: number;
  text: string;
  hint_text: string | null;
  audio_url: string | null;
  item_type: LessonItemType;
  translation: string | null;
  created_at: string;
}

export interface LessonQuizQuestion {
  id: string;
  lesson_id: string;
  position: number;
  question_type: LessonQuizQuestionType;
  question_text: string;
  option_a: string | null;
  option_b: string | null;
  option_c: string | null;
  option_d: string | null;
  correct_answer: string;
  created_at: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  last_item_position: number;
  is_completed: boolean;
  completed_at: string | null;
  quiz_score: number;
  quiz_total: number;
  created_at: string;
  updated_at: string;
}

export interface SpeakingSession {
  id: string;
  user_a: string;
  user_b: string;
  room_id: string;
  start_time: string;
  end_time: string;
  status: SessionStatus;
  created_at: string | null;
  updated_at: string | null;
}

export interface SessionRating {
  id: string;
  session_id: string;
  rater_id: string;
  rated_id: string;
  rating: number;
  created_at: string | null;
}

export interface WaitingUser {
  id: string;
  user_id: string;
  created_at: string | null;
}

export interface AdminUser {
  id: string;
  is_admin: boolean | null;
  created_at: string | null;
}
