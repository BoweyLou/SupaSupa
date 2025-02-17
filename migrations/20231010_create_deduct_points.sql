-- 20231010_create_deduct_points.sql
-- Migration file to create the deduct_points function for updating user points using an RPC call.

CREATE OR REPLACE FUNCTION public.deduct_points(child_uuid uuid, deduction integer)
RETURNS SETOF public.users AS $$
BEGIN
  RETURN QUERY
  UPDATE public.users
    SET points = points - deduction
    WHERE id = child_uuid
    RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 