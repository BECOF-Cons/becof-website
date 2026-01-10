#!/bin/bash
set -e

echo "🧹 Force clearing ALL Prisma artifacts..."
echo "Cache bust: $(date +%s)"

# Remove EVERYTHING Prisma related
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client
rm -rf node_modules/@prisma/engines
rm -rf .next/cache
rm -rf .prisma

# Prepare schema
echo "🔧 Preparing schema..."
node scripts/prepare-schema.js

# Show the actual schema file being used
echo "📄 Schema preview:"
head -20 prisma/schema.prisma

# Force download fresh engines
echo "🔽 Downloading fresh Prisma engines..."
npx prisma generate --schema=prisma/schema.prisma --skip-generate || true
npx prisma fetch || true

# Generate Prisma client with NO CACHE
echo "📦 Generating Prisma Client (no cache)..."
PRISMA_SKIP_POSTINSTALL_GENERATE=true npx prisma generate --schema=prisma/schema.prisma --no-hints

echo "✅ Prisma client force regenerated at $(date)!"
