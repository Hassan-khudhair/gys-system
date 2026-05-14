-- ============================================================
-- Migration 006: Dynamic exercise-type breakdown in gym stats
-- Replaces hardcoded fitness/bodybuilding with dynamic grouping
-- Run in Supabase SQL editor AFTER 005_players_age_drop_email.sql
-- ============================================================

CREATE OR REPLACE FUNCTION get_gym_stats(p_gym_id UUID)
RETURNS JSON
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  WITH base AS (
    SELECT * FROM players WHERE gym_id = p_gym_id
  ),
  by_type AS (
    SELECT
      exercise_type,
      COUNT(*)::int                   AS members,
      COALESCE(SUM(amount_paid), 0)  AS revenue
    FROM base
    WHERE exercise_type IS NOT NULL
    GROUP BY exercise_type
    ORDER BY exercise_type
  )
  SELECT json_build_object(
    'total',            (SELECT COUNT(*)                                                         FROM base),
    'active',           (SELECT COUNT(*) FILTER (WHERE end_date >= CURRENT_DATE)                 FROM base),
    'expired',          (SELECT COUNT(*) FILTER (WHERE end_date <  CURRENT_DATE)                 FROM base),
    'expiring',         (SELECT COUNT(*) FILTER (WHERE end_date >= CURRENT_DATE
                                                   AND end_date <= CURRENT_DATE + 7)             FROM base),
    'total_revenue',    COALESCE((SELECT SUM(amount_paid)                                        FROM base), 0),
    'monthly_revenue',  COALESCE((SELECT SUM(amount_paid) FILTER (
                                    WHERE created_at >= DATE_TRUNC('month', NOW()))              FROM base), 0),
    'by_exercise_type', COALESCE(
                          (SELECT json_agg(json_build_object(
                                    'type',    exercise_type,
                                    'members', members,
                                    'revenue', revenue))
                           FROM by_type),
                          '[]'::json)
  );
$$;

-- All-gyms stats for super admin dashboard (dynamic breakdown)
CREATE OR REPLACE FUNCTION get_all_gym_stats()
RETURNS JSON
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  WITH by_type AS (
    SELECT
      exercise_type,
      COUNT(*)::int                   AS members,
      COALESCE(SUM(amount_paid), 0)  AS revenue
    FROM players
    WHERE exercise_type IS NOT NULL
    GROUP BY exercise_type
    ORDER BY exercise_type
  )
  SELECT json_build_object(
    'total',            COUNT(*),
    'active',           COUNT(*) FILTER (WHERE end_date >= CURRENT_DATE),
    'expired',          COUNT(*) FILTER (WHERE end_date <  CURRENT_DATE),
    'expiring',         COUNT(*) FILTER (WHERE end_date >= CURRENT_DATE
                                          AND end_date <= CURRENT_DATE + 7),
    'total_revenue',    COALESCE(SUM(amount_paid), 0),
    'monthly_revenue',  COALESCE(SUM(amount_paid) FILTER (
                                   WHERE created_at >= DATE_TRUNC('month', NOW())), 0),
    'by_exercise_type', COALESCE(
                          (SELECT json_agg(json_build_object(
                                    'type',    exercise_type,
                                    'members', members,
                                    'revenue', revenue))
                           FROM by_type),
                          '[]'::json)
  )
  FROM players;
$$;

GRANT EXECUTE ON FUNCTION get_gym_stats(UUID)   TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_gym_stats()   TO authenticated;
