-- Migration file to enhance the award system with:
-- 1. Child-specific visibility/redemption
-- 2. Redemption limits
-- 3. Lock-out periods

-- Add new columns to awards table
ALTER TABLE awards
ADD COLUMN allowed_children_ids UUID[] DEFAULT NULL, -- Array of child IDs who can see/redeem
ADD COLUMN redemption_limit INTEGER DEFAULT 1, -- Default to once-only, NULL means unlimited
ADD COLUMN redemption_count INTEGER DEFAULT 0, -- Current redemption count
ADD COLUMN lockout_period INTEGER DEFAULT NULL, -- Duration value
ADD COLUMN lockout_unit TEXT DEFAULT 'days', -- 'days' or 'weeks'
ADD COLUMN last_redeemed_at TIMESTAMPTZ DEFAULT NULL; -- When the award was last redeemed

-- Create award_redemptions table to track individual redemptions
CREATE TABLE IF NOT EXISTS award_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  award_id UUID REFERENCES awards(id),
  child_id UUID REFERENCES users(id),
  redeemed_at TIMESTAMPTZ DEFAULT now()
);

-- Create function to check if an award is available for a child
CREATE OR REPLACE FUNCTION public.is_award_available_for_child(
  p_award_id UUID,
  p_child_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_award RECORD;
  v_lockout_end TIMESTAMPTZ;
BEGIN
  -- Get award details
  SELECT * INTO v_award FROM awards WHERE id = p_award_id;
  
  -- Check if award exists
  IF v_award IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if award is already fully redeemed
  IF v_award.redemption_limit IS NOT NULL AND v_award.redemption_count >= v_award.redemption_limit THEN
    RETURN FALSE;
  END IF;
  
  -- Check if award is in lockout period
  IF v_award.last_redeemed_at IS NOT NULL AND v_award.lockout_period IS NOT NULL THEN
    IF v_award.lockout_unit = 'weeks' THEN
      v_lockout_end := v_award.last_redeemed_at + (v_award.lockout_period * '1 week'::INTERVAL);
    ELSE
      v_lockout_end := v_award.last_redeemed_at + (v_award.lockout_period * '1 day'::INTERVAL);
    END IF;
    
    IF NOW() < v_lockout_end THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Check if child is allowed to redeem this award
  IF v_award.allowed_children_ids IS NOT NULL AND 
     NOT (p_child_id = ANY(v_award.allowed_children_ids)) THEN
    RETURN FALSE;
  END IF;
  
  -- All checks passed
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the claim_award_transaction function to handle the new features
CREATE OR REPLACE FUNCTION public.claim_award_transaction(
  p_award_id UUID,
  p_child_id UUID,
  p_points INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_points INTEGER;
  v_award RECORD;
  v_success BOOLEAN := FALSE;
BEGIN
  -- Get current points
  SELECT points INTO v_current_points FROM users WHERE id = p_child_id;
  
  -- Get award details
  SELECT * INTO v_award FROM awards WHERE id = p_award_id;
  
  -- Check if enough points
  IF v_current_points < p_points THEN
    RETURN FALSE;
  END IF;
  
  -- Check if award is available for this child
  IF NOT public.is_award_available_for_child(p_award_id, p_child_id) THEN
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
  
  -- Insert award redemption record
  INSERT INTO award_redemptions (
    award_id,
    child_id,
    redeemed_at
  ) VALUES (
    p_award_id,
    p_child_id,
    NOW()
  );
  
  -- Update award redemption count and last redeemed timestamp
  UPDATE awards 
  SET 
    redemption_count = redemption_count + 1,
    last_redeemed_at = NOW()
  WHERE id = p_award_id;
  
  -- Mark award as claimed if it's a one-time award
  IF v_award.redemption_limit = 1 THEN
    UPDATE awards SET awarded = TRUE WHERE id = p_award_id;
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 