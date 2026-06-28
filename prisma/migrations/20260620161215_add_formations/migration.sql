-- CreateTable
CREATE TABLE "University" (
    "id" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "nameAr" TEXT,
    "slug" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Establishment" (
    "id" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "nameAr" TEXT,
    "slug" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Establishment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Filiere" (
    "id" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "nameAr" TEXT,
    "slug" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Filiere_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "University_slug_key" ON "University"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Establishment_slug_key" ON "Establishment"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Filiere_slug_key" ON "Filiere"("slug");

-- AddForeignKey
ALTER TABLE "Establishment" ADD CONSTRAINT "Establishment_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Filiere" ADD CONSTRAINT "Filiere_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
