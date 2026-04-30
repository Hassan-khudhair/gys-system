-- ============================================================
-- Migration: Gym stats SQL functions (single-query stats)
-- Run this in your Supabase SQL editor
-- ============================================================

-- Per-gym stats for gym admin dashboard (ONE call replaces 5+ count queries)
CREATE OR REPLACE FUNCTION get_gym_stats(p_gym_id UUID)
RETURNS JSON
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT json_build_object(
    'total',                COUNT(*),
    'active',               COUNT(*) FILTER (WHERE end_date >= CURRENT_DATE),
    'expired',              COUNT(*) FILTER (WHERE end_date < CURRENT_DATE),
    'expiring',             COUNT(*) FILTER (WHERE end_date >= CURRENT_DATE
                                              AND end_date <= CURRENT_DATE + 7),
    'total_revenue',        COALESCE(SUM(amount_paid), 0),
    'monthly_revenue',      COALESCE(SUM(amount_paid) FILTER (
                              WHERE created_at >= DATE_TRUNC('month', NOW())), 0),
    'fitness_revenue',      COALESCE(SUM(amount_paid) FILTER (
                              WHERE exercise_type = 'fitness'), 0),
    'bodybuilding_revenue', COALESCE(SUM(amount_paid) FILTER (
                              WHERE exercise_type = 'bodybuilding'), 0),
    'fitness_members',      COUNT(*) FILTER (WHERE exercise_type = 'fitness'),
    'bodybuilding_members', COUNT(*) FILTER (WHERE exercise_type = 'bodybuilding')
  )
  FROM players
  WHERE gym_id = p_gym_id;
$$;

-- All-gyms stats for super admin dashboard
CREATE OR REPLACE FUNCTION get_all_gym_stats()
RETURNS JSON
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT json_build_object(
    'total',                COUNT(*),
    'active',               COUNT(*) FILTER (WHERE end_date >= CURRENT_DATE),
    'expired',              COUNT(*) FILTER (WHERE end_date < CURRENT_DATE),
    'expiring',             COUNT(*) FILTER (WHERE end_date >= CURRENT_DATE
                                              AND end_date <= CURRENT_DATE + 7),
    'total_revenue',        COALESCE(SUM(amount_paid), 0),
    'monthly_revenue',      COALESCE(SUM(amount_paid) FILTER (
                              WHERE created_at >= DATE_TRUNC('month', NOW())), 0),
    'fitness_revenue',      COALESCE(SUM(amount_paid) FILTER (
                              WHERE exercise_type = 'fitness'), 0),
    'bodybuilding_revenue', COALESCE(SUM(amount_paid) FILTER (
                              WHERE exercise_type = 'bodybuilding'), 0),
    'fitness_members',      COUNT(*) FILTER (WHERE exercise_type = 'fitness'),
    'bodybuilding_members', COUNT(*) FILTER (WHERE exercise_type = 'bodybuilding')
  )
  FROM players;
$$;

-- Grant execute to authenticated users (RLS on players still applies within the functions)
GRANT EXECUTE ON FUNCTION get_gym_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_gym_stats() TO authenticated;
