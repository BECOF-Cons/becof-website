-- COMPREHENSIVE FIX: Align Appointment table with production database schema
-- This script handles ALL column name mismatches between old and current code

DO $$
BEGIN
    RAISE NOTICE 'Starting COMPREHENSIVE Appointment schema migration...';
    
    -- ============================================
    -- STEP 1: Add all new columns if they don't exist
    -- ============================================
    
    -- Student info columns (old: studentName/Email/Phone → new: name/email/phone)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Appointment' AND column_name='name') THEN
        ALTER TABLE "Appointment" ADD COLUMN "name" TEXT;
        RAISE NOTICE 'Added name column';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Appointment' AND column_name='email') THEN
        ALTER TABLE "Appointment" ADD COLUMN "email" TEXT;
        RAISE NOTICE 'Added email column';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Appointment' AND column_name='phone') THEN
        ALTER TABLE "Appointment" ADD COLUMN "phone" TEXT;
        RAISE NOTICE 'Added phone column';
    END IF;

    -- Date/Time columns (old: preferredDate/preferredTime → new: date/time)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Appointment' AND column_name='date') THEN
        ALTER TABLE "Appointment" ADD COLUMN "date" TIMESTAMP;
        RAISE NOTICE 'Added date column';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Appointment' AND column_name='time') THEN
        ALTER TABLE "Appointment" ADD COLUMN "time" TEXT;
        RAISE NOTICE 'Added time column';
    END IF;

    -- Service column (old: service → new: serviceType)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Appointment' AND column_name='serviceType') THEN
        ALTER TABLE "Appointment" ADD COLUMN "serviceType" TEXT;
        RAISE NOTICE 'Added serviceType column';
    END IF;

    -- Message column (might be called notes in old schema)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Appointment' AND column_name='message') THEN
        ALTER TABLE "Appointment" ADD COLUMN "message" TEXT;
        RAISE NOTICE 'Added message column';
    END IF;

    -- ============================================
    -- STEP 2: Copy data from old columns to new columns
    -- ============================================
    
    -- Copy student information
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Appointment' AND column_name='studentName') THEN
        UPDATE "Appointment" SET "name" = COALESCE("studentName", "name", 'Unknown') WHERE "name" IS NULL OR "name" = '';
        RAISE NOTICE 'Copied data from studentName to name';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Appointment' AND column_name='studentEmail') THEN
        UPDATE "Appointment" SET "email" = COALESCE("studentEmail", "email", 'unknown@example.com') WHERE "email" IS NULL OR "email" = '';
        RAISE NOTICE 'Copied data from studentEmail to email';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Appointment' AND column_name='studentPhone') THEN
        UPDATE "Appointment" SET "phone" = COALESCE("studentPhone", "phone", '+216 00 000 000') WHERE "phone" IS NULL OR "phone" = '';
        RAISE NOTICE 'Copied data from studentPhone to phone';
    END IF;

    -- Copy date/time information
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Appointment' AND column_name='preferredDate') THEN
        UPDATE "Appointment" SET "date" = COALESCE("preferredDate", "date", NOW()) WHERE "date" IS NULL;
        RAISE NOTICE 'Copied data from preferredDate to date';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Appointment' AND column_name='preferredTime') THEN
        UPDATE "Appointment" SET "time" = COALESCE("preferredTime", "time", '10:00') WHERE "time" IS NULL OR "time" = '';
        RAISE NOTICE 'Copied data from preferredTime to time';
    END IF;

    -- Copy service information
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Appointment' AND column_name='service') THEN
        UPDATE "Appointment" SET "serviceType" = COALESCE("service", "serviceType", 'ORIENTATION_SESSION') WHERE "serviceType" IS NULL OR "serviceType" = '';
        RAISE NOTICE 'Copied data from service to serviceType';
    END IF;

    -- Copy notes to message
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Appointment' AND column_name='notes') THEN
        UPDATE "Appointment" SET "message" = COALESCE("notes", "message") WHERE "message" IS NULL;
        RAISE NOTICE 'Copied data from notes to message';
    END IF;

    -- ============================================
    -- STEP 3: Fill in any remaining NULL values with defaults
    -- ============================================
    
    UPDATE "Appointment" SET "name" = 'Unknown' WHERE "name" IS NULL OR "name" = '';
    UPDATE "Appointment" SET "email" = 'unknown@example.com' WHERE "email" IS NULL OR "email" = '';
    UPDATE "Appointment" SET "phone" = '+216 00 000 000' WHERE "phone" IS NULL OR "phone" = '';
    UPDATE "Appointment" SET "date" = NOW() WHERE "date" IS NULL;
    UPDATE "Appointment" SET "time" = '10:00' WHERE "time" IS NULL OR "time" = '';
    UPDATE "Appointment" SET "serviceType" = 'ORIENTATION_SESSION' WHERE "serviceType" IS NULL OR "serviceType" = '';
    RAISE NOTICE 'Filled in default values for any NULL fields';

    -- ============================================
    -- STEP 4: Set NOT NULL constraints on new columns
    -- ============================================
    
    ALTER TABLE "Appointment" ALTER COLUMN "name" SET NOT NULL;
    ALTER TABLE "Appointment" ALTER COLUMN "email" SET NOT NULL;
    ALTER TABLE "Appointment" ALTER COLUMN "phone" SET NOT NULL;
    ALTER TABLE "Appointment" ALTER COLUMN "date" SET NOT NULL;
    ALTER TABLE "Appointment" ALTER COLUMN "time" SET NOT NULL;
    ALTER TABLE "Appointment" ALTER COLUMN "serviceType" SET NOT NULL;
    RAISE NOTICE 'Set NOT NULL constraints on all new columns';

    -- ============================================
    -- STEP 5: Remove NOT NULL constraints from old columns
    -- ============================================
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Appointment' AND column_name='studentName') THEN
        ALTER TABLE "Appointment" ALTER COLUMN "studentName" DROP NOT NULL;
        RAISE NOTICE 'Removed NOT NULL from studentName';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Appointment' AND column_name='studentEmail') THEN
        ALTER TABLE "Appointment" ALTER COLUMN "studentEmail" DROP NOT NULL;
        RAISE NOTICE 'Removed NOT NULL from studentEmail';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Appointment' AND column_name='studentPhone') THEN
        ALTER TABLE "Appointment" ALTER COLUMN "studentPhone" DROP NOT NULL;
        RAISE NOTICE 'Removed NOT NULL from studentPhone';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Appointment' AND column_name='preferredDate') THEN
        ALTER TABLE "Appointment" ALTER COLUMN "preferredDate" DROP NOT NULL;
        RAISE NOTICE 'Removed NOT NULL from preferredDate';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Appointment' AND column_name='preferredTime') THEN
        ALTER TABLE "Appointment" ALTER COLUMN "preferredTime" DROP NOT NULL;
        RAISE NOTICE 'Removed NOT NULL from preferredTime';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Appointment' AND column_name='service') THEN
        ALTER TABLE "Appointment" ALTER COLUMN "service" DROP NOT NULL;
        RAISE NOTICE 'Removed NOT NULL from service';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Appointment' AND column_name='notes') THEN
        ALTER TABLE "Appointment" ALTER COLUMN "notes" DROP NOT NULL;
        RAISE NOTICE 'Removed NOT NULL from notes';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Appointment' AND column_name='notes') THEN
        ALTER TABLE "Appointment" ALTER COLUMN "notes" DROP NOT NULL;
        RAISE NOTICE 'Removed NOT NULL from notes';
    END IF;

    -- ============================================
    -- STEP 6: Drop old columns (COMMENTED OUT FOR SAFETY)
    -- ============================================
    -- Uncomment these lines ONLY after verifying everything works for several weeks
    /*
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Appointment' AND column_name='studentName') THEN
        ALTER TABLE "Appointment" DROP COLUMN "studentName";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Appointment' AND column_name='studentEmail') THEN
        ALTER TABLE "Appointment" DROP COLUMN "studentEmail";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Appointment' AND column_name='studentPhone') THEN
        ALTER TABLE "Appointment" DROP COLUMN "studentPhone";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Appointment' AND column_name='preferredDate') THEN
        ALTER TABLE "Appointment" DROP COLUMN "preferredDate";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Appointment' AND column_name='preferredTime') THEN
        ALTER TABLE "Appointment" DROP COLUMN "preferredTime";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Appointment' AND column_name='service') THEN
        ALTER TABLE "Appointment" DROP COLUMN "service";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Appointment' AND column_name='notes') THEN
        ALTER TABLE "Appointment" DROP COLUMN "notes";
    END IF;
    */

    RAISE NOTICE '========================================';
    RAISE NOTICE 'MIGRATION COMPLETED SUCCESSFULLY! ✓';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '- Created new columns: name, email, phone, date, time, serviceType, message';
    RAISE NOTICE '- Copied data from old columns to new columns';
    RAISE NOTICE '- Removed NOT NULL from old columns (safe for new inserts)';
    RAISE NOTICE '- Old columns preserved for safety (can drop later)';
    RAISE NOTICE '========================================';
END $$;
