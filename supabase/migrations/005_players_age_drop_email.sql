-- Migration 005: Add age to players, remove email
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS age INTEGER,
  DROP COLUMN IF EXISTS email;
