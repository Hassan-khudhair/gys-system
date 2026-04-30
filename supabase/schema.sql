-- ============================================================
-- Master Gym System — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- -------------------------------------------------------
-- GYMS
-- -------------------------------------------------------
CREATE TABLE public.gyms (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  logo_url    TEXT,
  address     TEXT,
  city        TEXT,
  phone       TEXT,
  email       TEXT,
  status      TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  max_members INT  DEFAULT 100,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------
-- GYM ADMINS  (each row links a Supabase auth user to a gym)
-- -------------------------------------------------------
CREATE TABLE public.gym_admins (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id     UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (email)
);

-- -------------------------------------------------------
-- PLAYERS  (gym members)
-- -------------------------------------------------------
CREATE TABLE public.players (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id            UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  phone             TEXT,
  email             TEXT,
  notes             TEXT,
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  subscription_type TEXT DEFAULT 'monthly'
    CHECK (subscription_type IN ('monthly', 'quarterly', 'semi_annual', 'annual')),
  amount_paid       NUMERIC(10,2),
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------
-- INDEXES
-- -------------------------------------------------------
CREATE INDEX idx_players_gym_id   ON public.players(gym_id);
CREATE INDEX idx_players_end_date ON public.players(end_date);
CREATE INDEX idx_players_name     ON public.players(name);
CREATE INDEX idx_gym_admins_gym   ON public.gym_admins(gym_id);
CREATE INDEX idx_gym_admins_email ON public.gym_admins(email);

-- -------------------------------------------------------
-- UPDATED_AT trigger
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER gyms_updated_at
  BEFORE UPDATE ON public.gyms
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -------------------------------------------------------
-- ROW LEVEL SECURITY
-- -------------------------------------------------------
ALTER TABLE public.gyms        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_admins  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players     ENABLE ROW LEVEL SECURITY;

-- Super admins: identified by user metadata role = 'super_admin'
-- They can see and do everything.

-- GYMS policies
CREATE POLICY "Super admin full access to gyms"
  ON public.gyms FOR ALL
  USING ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'super_admin');

CREATE POLICY "Gym admin reads own gym"
  ON public.gyms FOR SELECT
  USING (
    id IN (
      SELECT gym_id FROM public.gym_admins WHERE user_id = auth.uid()
    )
  );

-- PLAYERS policies
CREATE POLICY "Super admin full access to players"
  ON public.players FOR ALL
  USING ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'super_admin');

CREATE POLICY "Gym admin full access to own gym players"
  ON public.players FOR ALL
  USING (
    gym_id IN (
      SELECT gym_id FROM public.gym_admins WHERE user_id = auth.uid()
    )
  );

-- GYM_ADMINS policies
CREATE POLICY "Super admin full access to gym_admins"
  ON public.gym_admins FOR ALL
  USING ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'super_admin');

CREATE POLICY "Gym admin reads own record"
  ON public.gym_admins FOR SELECT
  USING (user_id = auth.uid());

-- -------------------------------------------------------
-- HELPFUL VIEWS
-- -------------------------------------------------------

-- Gym summary with player counts
CREATE VIEW public.gym_summary AS
SELECT
  g.*,
  COUNT(p.id)                                                 AS total_members,
  COUNT(CASE WHEN p.end_date >= CURRENT_DATE THEN 1 END)      AS active_members,
  COUNT(CASE WHEN p.end_date  < CURRENT_DATE THEN 1 END)      AS expired_members,
  COUNT(CASE WHEN p.end_date BETWEEN CURRENT_DATE
             AND CURRENT_DATE + INTERVAL '7 days' THEN 1 END) AS expiring_soon
FROM public.gyms g
LEFT JOIN public.players p ON p.gym_id = g.id
GROUP BY g.id;


-- just a simple commit to fresh the build in vercel
-- just a simple commit to fresh the build in admin-prod vercel