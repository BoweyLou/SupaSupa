-- migrations/001_create_profiles_table.sql

-- This migration creates a 'profiles' table to store user/child profiles including their points balance.

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY,
  points integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Optionally, you can create an index on the points column
CREATE INDEX IF NOT EXISTS idx_profiles_points ON profiles(points); 