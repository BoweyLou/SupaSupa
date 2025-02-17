-- migrations/002_create_deduct_points_function.sql

-- This migration creates an RPC function 'deduct_points' that atomically deducts points from a user's balance.

CREATE OR REPLACE FUNCTION public.deduct_points(child_uuid uuid, deduction integer)
RETURNS SETOF "user" AS $$
BEGIN
  RETURN QUERY
  UPDATE "user"
  SET points = points - deduction,
      updated_at = now()
  WHERE id = child_uuid AND points >= deduction
  RETURNING *;
END;
$$ LANGUAGE plpgsql; 