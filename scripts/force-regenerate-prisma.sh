#!/bin/bash
set -e

echo "🧹 Force clearing Prisma client cache..."
echo "Cache bust: $(date +%s)"

# Remove only the generated client and Next.js cache
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client
rm -rf .next/cache

# Prepare schema
echo "🔧 Preparing schema..."
node scripts/prepare-schema.js

# Show the actual schema file being used
echo "📄 Schema preview:"
head -20 prisma/schema.prisma

# Generate Prisma client
echo "📦 Generating Prisma Client..."
npx prisma generate --schema=prisma/schema.prisma --no-hints

echo "✅ Prisma client force regenerated at $(date)!"
