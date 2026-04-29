-- ============================================================
-- Master Gym — Schema v2
-- Run this AFTER schema.sql in your Supabase SQL Editor
-- ============================================================

-- -------------------------------------------------------
-- GYM APPLICATIONS  (pending registrations awaiting super admin approval)
-- -------------------------------------------------------
CREATE TABLE public.gym_applications (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_name         TEXT NOT NULL,
  city             TEXT,
  address          TEXT,
  phone            TEXT,
  gym_email        TEXT,
  admin_name       TEXT NOT NULL,
  admin_email      TEXT NOT NULL,
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status           TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at       TIMESTAMPTZ DEFAULT now(),
  reviewed_at      TIMESTAMPTZ
);

CREATE INDEX idx_gym_apps_status ON public.gym_applications(status);
CREATE INDEX idx_gym_apps_user   ON public.gym_applications(user_id);

ALTER TABLE public.gym_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a new application (public registration)
CREATE POLICY "Anyone can apply"
  ON public.gym_applications FOR INSERT
  WITH CHECK (true);

-- Super admin sees and manages all applications
CREATE POLICY "Super admin full access to applications"
  ON public.gym_applications FOR ALL
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin');

-- Applicant can read their own application status
CREATE POLICY "Applicant can view own application"
  ON public.gym_applications FOR SELECT
  USING (user_id = auth.uid());

-- -------------------------------------------------------
-- Fix RLS policy syntax on existing tables (run to patch)
-- -------------------------------------------------------
DROP POLICY IF EXISTS "Super admin full access to gyms"    ON public.gyms;
DROP POLICY IF EXISTS "Super admin full access to players" ON public.players;
DROP POLICY IF EXISTS "Super admin full access to gym_admins" ON public.gym_admins;
DROP POLICY IF EXISTS "Gym admin reads own gym"            ON public.gyms;
DROP POLICY IF EXISTS "Gym admin full access to own gym players" ON public.players;
DROP POLICY IF EXISTS "Gym admin reads own record"         ON public.gym_admins;

-- Gyms
CREATE POLICY "Super admin full access to gyms"
  ON public.gyms FOR ALL
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin');

CREATE POLICY "Gym admin reads own gym"
  ON public.gyms FOR SELECT
  USING ((auth.jwt() -> 'user_metadata' ->> 'gym_id') = id::text);

-- Players
CREATE POLICY "Super admin full access to players"
  ON public.players FOR ALL
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin');

CREATE POLICY "Gym admin full access to own gym players"
  ON public.players FOR ALL
  USING ((auth.jwt() -> 'user_metadata' ->> 'gym_id') = gym_id::text);

-- Gym admins
CREATE POLICY "Super admin full access to gym_admins"
  ON public.gym_admins FOR ALL
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin');

CREATE POLICY "Gym admin reads own record"
  ON public.gym_admins FOR SELECT
  USING (user_id = auth.uid());

-- -------------------------------------------------------
-- Patch gym_summary view to also be accessible via service role
-- -------------------------------------------------------
DROP VIEW IF EXISTS public.gym_summary;

CREATE VIEW public.gym_summary WITH (security_invoker = true) AS
SELECT
  g.*,
  COUNT(p.id)                                                  AS total_members,
  COUNT(CASE WHEN p.end_date >= CURRENT_DATE THEN 1 END)       AS active_members,
  COUNT(CASE WHEN p.end_date  < CURRENT_DATE THEN 1 END)       AS expired_members,
  COUNT(CASE WHEN p.end_date BETWEEN CURRENT_DATE
              AND CURRENT_DATE + INTERVAL '7 days' THEN 1 END) AS expiring_soon
FROM public.gyms g
LEFT JOIN public.players p ON p.gym_id = g.id
GROUP BY g.id;
