// ---- Database row types matching supabase/schema.sql ----

export type GymStatus = "active" | "inactive" | "suspended";
export type SubscriptionType = string; // free text: plan name or legacy type
export type PlayerStatus = "active" | "expiring" | "expired";
export type ExerciseType = string;

export interface ExerciseTypeRecord {
  id: string;
  gym_id: string;
  name: string;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  gym_id: string;
  name: string;
  exercise_type: ExerciseType;
  duration_months: number;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Gym {
  id: string;
  name: string;
  logo_url: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  status: GymStatus;
  max_members: number;
  created_at: string;
  updated_at: string;
}

export interface GymSummary extends Gym {
  total_members: number;
  active_members: number;
  expired_members: number;
  expiring_soon: number;
}

export interface GymAdmin {
  id: string;
  gym_id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export interface Player {
  id: string;
  gym_id: string;
  name: string;
  phone: string | null;
  age: number | null;
  notes: string | null;
  start_date: string;
  end_date: string;
  subscription_type: SubscriptionType;
  amount_paid: number | null;
  exercise_type: ExerciseType | null;
  plan_id: string | null;
  created_at: string;
  updated_at: string;
}

export type ApplicationStatus = "pending" | "approved" | "rejected";

export interface GymApplication {
  id: string;
  gym_name: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  gym_email: string | null;
  admin_name: string;
  admin_email: string;
  user_id: string | null;
  status: ApplicationStatus;
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
}

// ---- Form input types ----

export interface CreateGymInput {
  name: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  max_members?: number;
  status?: GymStatus;
}

export interface CreatePlayerInput {
  name: string;
  phone?: string;
  age?: number;
  notes?: string;
  start_date: string;
  end_date: string;
  subscription_type: SubscriptionType;
  amount_paid?: number;
  exercise_type?: ExerciseType;
  plan_id?: string;
}
