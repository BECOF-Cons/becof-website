-- Migration to rename 'service' column to 'serviceType' in Appointment table
-- This ensures consistency between code and database schema

DO $$
BEGIN
    -- Check if the old 'service' column exists and 'serviceType' does not
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='Appointment' AND column_name='service')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name='Appointment' AND column_name='serviceType') THEN
        
        -- Rename the column
        ALTER TABLE "Appointment" RENAME COLUMN "service" TO "serviceType";
        RAISE NOTICE 'Column "service" renamed to "serviceType"';
    ELSE
        RAISE NOTICE 'Column migration not needed - schema already up to date';
    END IF;
END $$;
