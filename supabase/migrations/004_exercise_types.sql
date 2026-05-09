-- ============================================================
-- Migration 004: Dynamic exercise_types table
-- Run in Supabase SQL editor AFTER 003_gym_stats_functions.sql
-- ============================================================

-- 1. Create the exercise_types table
CREATE TABLE IF NOT EXISTS public.exercise_types (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id     UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (gym_id, name)
);

CREATE INDEX IF NOT EXISTS idx_exercise_types_gym ON public.exercise_types(gym_id);

-- 2. Enable RLS
ALTER TABLE public.exercise_types ENABLE ROW LEVEL SECURITY;

-- 3. Gym admins can manage their own gym's types
CREATE POLICY "gym_admins_manage_own_exercise_types"
  ON public.exercise_types FOR ALL TO authenticated
  USING  ((auth.jwt() -> 'user_metadata' ->> 'gym_id') = gym_id::text)
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'gym_id') = gym_id::text);

-- 4. Super admins can read all types
CREATE POLICY "super_admin_read_all_exercise_types"
  ON public.exercise_types FOR SELECT TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin');

-- 5. Seed from existing subscription_plans data (idempotent)
INSERT INTO public.exercise_types (gym_id, name)
  SELECT DISTINCT gym_id, exercise_type
  FROM public.subscription_plans
  WHERE exercise_type IS NOT NULL
ON CONFLICT (gym_id, name) DO NOTHING;

-- 6. Seed from existing players data (catches types not in plans)
INSERT INTO public.exercise_types (gym_id, name)
  SELECT DISTINCT gym_id, exercise_type
  FROM public.players
  WHERE exercise_type IS NOT NULL
ON CONFLICT (gym_id, name) DO NOTHING;

-- 7. Drop the hardcoded CHECK constraints
--    Postgres auto-generates names as {table}_{column}_check
--    IF EXISTS makes this a no-op if the name differs (safe to run)
ALTER TABLE public.subscription_plans
  DROP CONSTRAINT IF EXISTS subscription_plans_exercise_type_check;

ALTER TABLE public.players
  DROP CONSTRAINT IF EXISTS players_exercise_type_check;
