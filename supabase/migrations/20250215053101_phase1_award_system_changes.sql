-- Create claimed_awards table
CREATE TABLE IF NOT EXISTS claimed_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  award_id UUID REFERENCES awards(id),
  child_id UUID REFERENCES users(id),
  claimed_at TIMESTAMPTZ DEFAULT now(),
  points_deducted INTEGER
);

-- Alter awards table to add family_id column
ALTER TABLE awards ADD COLUMN family_id UUID REFERENCES families(family_id);
