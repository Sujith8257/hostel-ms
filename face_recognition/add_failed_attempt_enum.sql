-- Add 'failed_attempt' to the entry_type enum if it doesn't exist
-- Run this in your Supabase SQL Editor

-- First, check if the enum value already exists
DO $$ 
BEGIN
    -- Add 'failed_attempt' to the enum if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'failed_attempt' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'entry_type')
    ) THEN
        ALTER TYPE public.entry_type ADD VALUE 'failed_attempt';
        RAISE NOTICE 'Added failed_attempt to entry_type enum';
    ELSE
        RAISE NOTICE 'failed_attempt already exists in entry_type enum';
    END IF;
END $$;

-- Verify the enum values
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'entry_type')
ORDER BY enumsortorder;

