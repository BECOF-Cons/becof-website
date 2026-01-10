#!/bin/bash
set -e

echo "🧹 Force clearing Prisma client cache..."
echo "Cache bust: $(date +%s)"

# Remove only the generated Prisma client (not engines or CLI)
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client
rm -rf .next/cache

# Prepare schema
echo "🔧 Preparing schema..."
node scripts/prepare-schema.js

# Show the actual schema file being used
echo "📄 Schema preview:"
head -20 prisma/schema.prisma

# Generate Prisma client with verbose output
echo "📦 Generating Prisma Client..."
npx prisma generate --schema=prisma/schema.prisma

echo "✅ Prisma client force regenerated at $(date)!"
