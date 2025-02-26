-- Add icon and custom_colors fields to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS icon TEXT,
ADD COLUMN IF NOT EXISTS custom_colors JSONB;

-- Add icon and custom_colors fields to awards table
ALTER TABLE awards
ADD COLUMN IF NOT EXISTS icon TEXT,
ADD COLUMN IF NOT EXISTS custom_colors JSONB;

-- Create an index on the icon field for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_icon ON tasks (icon);
CREATE INDEX IF NOT EXISTS idx_awards_icon ON awards (icon);

-- Add comment to explain the purpose of these fields
COMMENT ON COLUMN tasks.icon IS 'Icon name for the task card';
COMMENT ON COLUMN tasks.custom_colors IS 'Custom colors for the task card in brutalist design';
COMMENT ON COLUMN awards.icon IS 'Icon name for the award card';
COMMENT ON COLUMN awards.custom_colors IS 'Custom colors for the award card in brutalist design'; 