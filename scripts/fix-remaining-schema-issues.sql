-- Fix remaining schema mismatches
-- Run this after the main migration

DO $$
BEGIN
    RAISE NOTICE 'Fixing remaining schema issues...';
    
    -- Make userId nullable (code expects this to be optional)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='Appointment' 
        AND column_name='userId' 
        AND is_nullable='NO'
    ) THEN
        ALTER TABLE "Appointment" ALTER COLUMN "userId" DROP NOT NULL;
        RAISE NOTICE '✓ Made userId nullable';
    END IF;
    
    -- Remove price column if it exists (not in current schema)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='Appointment' 
        AND column_name='price'
    ) THEN
        ALTER TABLE "Appointment" DROP COLUMN "price";
        RAISE NOTICE '✓ Removed price column (payment amount stored in Payment table)';
    END IF;
    
    -- Remove alternateDate if it exists (not in current schema)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='Appointment' 
        AND column_name='alternateDate'
    ) THEN
        ALTER TABLE "Appointment" DROP COLUMN "alternateDate";
        RAISE NOTICE '✓ Removed alternateDate column';
    END IF;
    
    -- Remove cancellationNote if it exists (not in current schema)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='Appointment' 
        AND column_name='cancellationNote'
    ) THEN
        ALTER TABLE "Appointment" DROP COLUMN "cancellationNote";
        RAISE NOTICE '✓ Removed cancellationNote column';
    END IF;
    
    -- Remove meetingLink if it exists (not in current schema)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='Appointment' 
        AND column_name='meetingLink'
    ) THEN
        ALTER TABLE "Appointment" DROP COLUMN "meetingLink";
        RAISE NOTICE '✓ Removed meetingLink column';
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'All schema issues fixed! ✓';
    RAISE NOTICE '========================================';
END $$;
