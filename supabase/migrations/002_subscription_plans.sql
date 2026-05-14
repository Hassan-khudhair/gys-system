-- ============================================================
-- Migration: Subscription Plans + Player Exercise Types
-- Run this in your Supabase SQL editor
-- ============================================================

-- 1. Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id          UUID REFERENCES gyms(id) ON DELETE CASCADE NOT NULL,
  name            TEXT NOT NULL,
  exercise_type   TEXT NOT NULL CHECK (exercise_type IN ('fitness', 'bodybuilding')),
  duration_months INTEGER NOT NULL DEFAULT 1 CHECK (duration_months > 0),
  price           DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add new columns to players
ALTER TABLE players
  ADD COLUMN IF NOT EXISTS exercise_type TEXT CHECK (exercise_type IN ('fitness', 'bodybuilding')),
  ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL;

-- Allow free-text subscription_type (remove enum constraint if present)
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_subscription_type_check;

-- 3. Enable Row Level Security on subscription_plans
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- 4. RLS: Gym admins can fully manage their own gym's plans
CREATE POLICY "gym_admins_manage_own_plans" ON subscription_plans
  FOR ALL TO authenticated
  USING (
    gym_id IN (SELECT gym_id FROM gym_admins WHERE user_id = auth.uid())
  )
  WITH CHECK (
    gym_id IN (SELECT gym_id FROM gym_admins WHERE user_id = auth.uid())
  );

-- 5. RLS: Super admins can read all plans
CREATE POLICY "super_admin_read_all_plans" ON subscription_plans
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

-- 6. Auto-update updated_at on subscription_plans
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 7. Optional: seed some default plans for existing gyms
-- (comment out if you don't want this)
-- INSERT INTO subscription_plans (gym_id, name, exercise_type, duration_months, price)
-- SELECT id, 'Monthly Fitness',       'fitness',       1,  25000 FROM gyms WHERE status = 'active';
-- INSERT INTO subscription_plans (gym_id, name, exercise_type, duration_months, price)
-- SELECT id, 'Quarterly Fitness',     'fitness',       3,  65000 FROM gyms WHERE status = 'active';
-- INSERT INTO subscription_plans (gym_id, name, exercise_type, duration_months, price)
-- SELECT id, 'Monthly Bodybuilding',  'bodybuilding',  1,  35000 FROM gyms WHERE status = 'active';
-- INSERT INTO subscription_plans (gym_id, name, exercise_type, duration_months, price)
-- SELECT id, 'Quarterly Bodybuilding','bodybuilding',  3,  90000 FROM gyms WHERE status = 'active';
