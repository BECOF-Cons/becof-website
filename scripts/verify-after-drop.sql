-- Verify the Appointment table structure after dropping old columns
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
