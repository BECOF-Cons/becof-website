-- Drop the old columns that are no longer needed
-- The new columns (name, email, phone, date, time, serviceType, message) are already populated

ALTER TABLE "Appointment" DROP COLUMN IF EXISTS "studentName";
ALTER TABLE "Appointment" DROP COLUMN IF EXISTS "studentEmail";
ALTER TABLE "Appointment" DROP COLUMN IF EXISTS "studentPhone";
ALTER TABLE "Appointment" DROP COLUMN IF EXISTS "preferredDate";
ALTER TABLE "Appointment" DROP COLUMN IF EXISTS "service";
ALTER TABLE "Appointment" DROP COLUMN IF EXISTS "notes";

-- Note: preferredTime was already removed or doesn't exist
