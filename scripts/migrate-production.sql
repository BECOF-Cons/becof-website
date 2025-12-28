-- Migration script to add BlogCategory and BlogPostSEO to production database
-- Run this in your Neon database console or via psql

-- 1. Create BlogCategory table
CREATE TABLE IF NOT EXISTS "BlogCategory" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "slugEn" TEXT NOT NULL,
    "slugFr" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

-- 2. Create unique indexes for BlogCategory
CREATE UNIQUE INDEX IF NOT EXISTS "BlogCategory_slugEn_key" ON "BlogCategory"("slugEn");
CREATE UNIQUE INDEX IF NOT EXISTS "BlogCategory_slugFr_key" ON "BlogCategory"("slugFr");

-- 3. Create BlogPostSEO table
CREATE TABLE IF NOT EXISTS "BlogPostSEO" (
    "id" TEXT NOT NULL,
    "blogPostId" TEXT NOT NULL,
    "metaTitleEn" TEXT,
    "metaTitleFr" TEXT,
    "metaDescEn" TEXT,
    "metaDescFr" TEXT,
    "ogImageEn" TEXT,
    "ogImageFr" TEXT,
    "keywords" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPostSEO_pkey" PRIMARY KEY ("id")
);

-- 4. Create unique index for BlogPostSEO
CREATE UNIQUE INDEX IF NOT EXISTS "BlogPostSEO_blogPostId_key" ON "BlogPostSEO"("blogPostId");

-- 5. Add new columns to BlogPost table (if they don't exist)
DO $$ 
BEGIN
    -- Add titleEn if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='BlogPost' AND column_name='titleEn') THEN
        ALTER TABLE "BlogPost" ADD COLUMN "titleEn" TEXT;
        -- Copy existing title to titleEn
        UPDATE "BlogPost" SET "titleEn" = "title" WHERE "titleEn" IS NULL;
        -- Make titleEn NOT NULL after copying
        ALTER TABLE "BlogPost" ALTER COLUMN "titleEn" SET NOT NULL;
    END IF;

    -- Add titleFr if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='BlogPost' AND column_name='titleFr') THEN
        ALTER TABLE "BlogPost" ADD COLUMN "titleFr" TEXT;
        -- Copy existing title to titleFr
        UPDATE "BlogPost" SET "titleFr" = COALESCE("titleFr", "title");
        -- Make titleFr NOT NULL after copying
        ALTER TABLE "BlogPost" ALTER COLUMN "titleFr" SET NOT NULL;
    END IF;

    -- Add slugEn if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='BlogPost' AND column_name='slugEn') THEN
        ALTER TABLE "BlogPost" ADD COLUMN "slugEn" TEXT;
        -- Copy existing slug to slugEn
        UPDATE "BlogPost" SET "slugEn" = "slug" WHERE "slugEn" IS NULL;
        -- Make slugEn NOT NULL and UNIQUE after copying
        ALTER TABLE "BlogPost" ALTER COLUMN "slugEn" SET NOT NULL;
        CREATE UNIQUE INDEX "BlogPost_slugEn_key" ON "BlogPost"("slugEn");
    END IF;

    -- Add slugFr if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='BlogPost' AND column_name='slugFr') THEN
        ALTER TABLE "BlogPost" ADD COLUMN "slugFr" TEXT;
        -- Copy existing slug to slugFr with -fr suffix
        UPDATE "BlogPost" SET "slugFr" = "slug" || '-fr' WHERE "slugFr" IS NULL;
        -- Make slugFr NOT NULL and UNIQUE after copying
        ALTER TABLE "BlogPost" ALTER COLUMN "slugFr" SET NOT NULL;
        CREATE UNIQUE INDEX "BlogPost_slugFr_key" ON "BlogPost"("slugFr");
    END IF;

    -- Add excerptEn if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='BlogPost' AND column_name='excerptEn') THEN
        ALTER TABLE "BlogPost" ADD COLUMN "excerptEn" TEXT;
        -- Copy existing excerpt to excerptEn
        UPDATE "BlogPost" SET "excerptEn" = "excerpt" WHERE "excerptEn" IS NULL;
        -- Make excerptEn NOT NULL after copying
        ALTER TABLE "BlogPost" ALTER COLUMN "excerptEn" SET NOT NULL;
    END IF;

    -- Add excerptFr if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='BlogPost' AND column_name='excerptFr') THEN
        ALTER TABLE "BlogPost" ADD COLUMN "excerptFr" TEXT;
        -- Copy existing excerpt to excerptFr
        UPDATE "BlogPost" SET "excerptFr" = COALESCE("excerptFr", "excerpt");
        -- Make excerptFr NOT NULL after copying
        ALTER TABLE "BlogPost" ALTER COLUMN "excerptFr" SET NOT NULL;
    END IF;

    -- Add contentEn if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='BlogPost' AND column_name='contentEn') THEN
        ALTER TABLE "BlogPost" ADD COLUMN "contentEn" TEXT;
        -- Copy existing content to contentEn
        UPDATE "BlogPost" SET "contentEn" = "content" WHERE "contentEn" IS NULL;
        -- Make contentEn NOT NULL after copying
        ALTER TABLE "BlogPost" ALTER COLUMN "contentEn" SET NOT NULL;
    END IF;

    -- Add contentFr if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='BlogPost' AND column_name='contentFr') THEN
        ALTER TABLE "BlogPost" ADD COLUMN "contentFr" TEXT;
        -- Copy existing content to contentFr
        UPDATE "BlogPost" SET "contentFr" = COALESCE("contentFr", "content");
        -- Make contentFr NOT NULL after copying
        ALTER TABLE "BlogPost" ALTER COLUMN "contentFr" SET NOT NULL;
    END IF;

    -- Rename image to coverImage if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='BlogPost' AND column_name='image') THEN
        ALTER TABLE "BlogPost" RENAME COLUMN "image" TO "coverImage";
    END IF;

    -- Add categoryId if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='BlogPost' AND column_name='categoryId') THEN
        ALTER TABLE "BlogPost" ADD COLUMN "categoryId" TEXT;
    END IF;

    -- Add featured if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='BlogPost' AND column_name='featured') THEN
        ALTER TABLE "BlogPost" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
    END IF;

    -- Add tags if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='BlogPost' AND column_name='tags') THEN
        ALTER TABLE "BlogPost" ADD COLUMN "tags" TEXT NOT NULL DEFAULT '';
    END IF;

    -- Add viewCount if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='BlogPost' AND column_name='viewCount') THEN
        ALTER TABLE "BlogPost" ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;
    END IF;

    -- Add publishedAt if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='BlogPost' AND column_name='publishedAt') THEN
        ALTER TABLE "BlogPost" ADD COLUMN "publishedAt" TIMESTAMP(3);
    END IF;
END $$;

-- 6. Add foreign key constraints
DO $$
BEGIN
    -- Add foreign key for BlogPost -> BlogCategory
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'BlogPost_categoryId_fkey' 
        AND table_name = 'BlogPost'
    ) THEN
        ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_categoryId_fkey" 
        FOREIGN KEY ("categoryId") REFERENCES "BlogCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    -- Add foreign key for BlogPostSEO -> BlogPost
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'BlogPostSEO_blogPostId_fkey' 
        AND table_name = 'BlogPostSEO'
    ) THEN
        ALTER TABLE "BlogPostSEO" ADD CONSTRAINT "BlogPostSEO_blogPostId_fkey" 
        FOREIGN KEY ("blogPostId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 7. Create default blog categories
INSERT INTO "BlogCategory" ("id", "nameEn", "nameFr", "slugEn", "slugFr", "createdAt", "updatedAt")
VALUES 
    (gen_random_uuid()::text, 'Orientation', 'Orientation', 'orientation', 'orientation', NOW(), NOW()),
    (gen_random_uuid()::text, 'Career', 'Carrière', 'career', 'carriere', NOW(), NOW()),
    (gen_random_uuid()::text, 'Studies', 'Études', 'studies', 'etudes', NOW(), NOW())
ON CONFLICT ("slugEn") DO NOTHING;

-- 8. Add icon column to Service table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Service' AND column_name='icon') THEN
        ALTER TABLE "Service" ADD COLUMN "icon" TEXT DEFAULT 'Lightbulb';
    END IF;
END $$;

-- 9. Add googleEventId column to Appointment table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Appointment' AND column_name='googleEventId') THEN
        ALTER TABLE "Appointment" ADD COLUMN "googleEventId" TEXT;
    END IF;
END $$;

-- 10. Create SiteSettings table
CREATE TABLE IF NOT EXISTS "SiteSettings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- 11. Create unique index for SiteSettings key
CREATE UNIQUE INDEX IF NOT EXISTS "SiteSettings_key_key" ON "SiteSettings"("key");

-- 12. Create AdminInvitation table
CREATE TABLE IF NOT EXISTS "AdminInvitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminInvitation_pkey" PRIMARY KEY ("id")
);

-- 13. Create unique indexes for AdminInvitation
CREATE UNIQUE INDEX IF NOT EXISTS "AdminInvitation_email_key" ON "AdminInvitation"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "AdminInvitation_token_key" ON "AdminInvitation"("token");

-- 14. Drop old columns (optional - only after confirming data is migrated)
-- ALTER TABLE "BlogPost" DROP COLUMN IF EXISTS "title";
-- ALTER TABLE "BlogPost" DROP COLUMN IF EXISTS "slug";
-- ALTER TABLE "BlogPost" DROP COLUMN IF EXISTS "excerpt";
-- ALTER TABLE "BlogPost" DROP COLUMN IF EXISTS "content";

SELECT 'Migration completed successfully!' as status;
