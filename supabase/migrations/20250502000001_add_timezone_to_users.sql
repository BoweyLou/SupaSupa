-- Add timezone field to users table
ALTER TABLE public.users ADD COLUMN timezone TEXT NOT NULL DEFAULT 'America/New_York';

-- Create an index on the timezone column for improved performance
CREATE INDEX idx_users_timezone ON public.users(timezone);

-- Comment on the timezone field
COMMENT ON COLUMN public.users.timezone IS 'User timezone in IANA format (e.g., America/New_York) for localized operations like midnight task resets';