-- claim_award_function.sql
-- Function to handle award claiming in a transaction

CREATE OR REPLACE FUNCTION public.claim_award_transaction(
  p_award_id UUID,
  p_child_id UUID,
  p_points INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_points INTEGER;
  v_success BOOLEAN := FALSE;
BEGIN
  -- Get current points
  SELECT points INTO v_current_points FROM users WHERE id = p_child_id;
  
  -- Check if enough points
  IF v_current_points < p_points THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct points
  UPDATE users SET points = points - p_points WHERE id = p_child_id;
  
  -- Insert claimed award record
  INSERT INTO claimed_awards (
    award_id, 
    child_id, 
    claimed_at, 
    points_deducted
  ) VALUES (
    p_award_id,
    p_child_id,
    NOW(),
    p_points
  );
  
  -- Mark award as claimed
  UPDATE awards SET awarded = TRUE WHERE id = p_award_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix the deduct_points function to ensure it works with the correct table name
-- and includes a check for sufficient points
CREATE OR REPLACE FUNCTION public.deduct_points(child_uuid uuid, deduction integer)
RETURNS SETOF public.users AS $$
BEGIN
  RETURN QUERY
  UPDATE public.users
    SET points = points - deduction
    WHERE id = child_uuid AND points >= deduction
    RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 