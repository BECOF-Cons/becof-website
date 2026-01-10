-- Run this to verify the migration worked correctly
-- Copy the output and check if you see BOTH old and new columns

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'Appointment'
ORDER BY column_name;
