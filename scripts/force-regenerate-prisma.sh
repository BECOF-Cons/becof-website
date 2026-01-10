#!/bin/bash
set -e

echo "🧹 Force clearing ALL Prisma caches..."

# Remove all Prisma generated files
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma
rm -rf .next/cache
rm -rf .vercel

# Prepare schema
echo "🔧 Preparing schema..."
node scripts/prepare-schema.js

# Generate Prisma client with verbose output
echo "📦 Generating Prisma Client..."
npx prisma generate --schema=prisma/schema.prisma

echo "✅ Prisma client force regenerated!"
