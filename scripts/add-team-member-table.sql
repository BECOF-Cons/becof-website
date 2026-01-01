-- Migration to add TeamMember table to production database
-- This migration is safe to run multiple times (uses IF NOT EXISTS)
-- Will NOT delete or modify any existing data

-- Create TeamMember table for team management feature
CREATE TABLE IF NOT EXISTS "TeamMember" (
    "id" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "titleFr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "bioFr" TEXT,
    "bioEn" TEXT,
    "image" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- Verify the table was created
SELECT 'TeamMember table created/verified successfully!' as status;
SELECT COUNT(*) as existing_team_members FROM "TeamMember";
