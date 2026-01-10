#!/bin/bash
set -e

echo "🧹 Force clearing Prisma client cache..."

# Remove only the generated Prisma client (not engines or CLI)
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client
rm -rf .next/cache

# Prepare schema
echo "🔧 Preparing schema..."
node scripts/prepare-schema.js

# Generate Prisma client with verbose output
echo "📦 Generating Prisma Client..."
npx prisma generate --schema=prisma/schema.prisma

echo "✅ Prisma client force regenerated!"
