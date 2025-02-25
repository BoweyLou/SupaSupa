-- Migration to add color column to bonus_awards table
-- This allows for custom color selection for bonus award icons

-- Check if the bonus_awards table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'bonus_awards'
    ) THEN
        -- Add color column if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'bonus_awards' 
            AND column_name = 'color'
        ) THEN
            ALTER TABLE public.bonus_awards ADD COLUMN color VARCHAR(20);
            
            -- Add a comment to the column for documentation
            COMMENT ON COLUMN public.bonus_awards.color IS 'Custom color for the bonus award icon (hex code)';
        END IF;
    ELSE
        RAISE NOTICE 'Table bonus_awards does not exist. Migration skipped.';
    END IF;
END
$$;

-- Update the RLS policies to include the new column
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.bonus_awards;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.bonus_awards;
    DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.bonus_awards;
    DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.bonus_awards;
    
    -- Recreate policies with the new column
    CREATE POLICY "Enable read access for all users" 
    ON public.bonus_awards FOR SELECT 
    USING (true);
    
    CREATE POLICY "Enable insert for authenticated users only" 
    ON public.bonus_awards FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');
    
    CREATE POLICY "Enable update for authenticated users only" 
    ON public.bonus_awards FOR UPDATE 
    USING (auth.role() = 'authenticated');
    
    CREATE POLICY "Enable delete for authenticated users only" 
    ON public.bonus_awards FOR DELETE 
    USING (auth.role() = 'authenticated');
END
$$; 