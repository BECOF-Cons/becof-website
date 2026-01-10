-- Run this in your Neon Console to verify the actual column names in production
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'Appointment'
ORDER BY 
    ordinal_position;
