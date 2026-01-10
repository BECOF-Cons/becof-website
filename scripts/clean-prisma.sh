#!/bin/bash
# Clean Prisma cache and regenerate client
set -e

echo "=========================================="
echo "🧹 Cleaning Prisma cache..."
echo "=========================================="
rm -rf node_modules/.prisma || true
rm -rf node_modules/@prisma/client || true

echo ""
echo "=========================================="
echo "🔧 Preparing schema..."
echo "=========================================="
node scripts/prepare-schema.js

echo ""
echo "=========================================="
echo "📋 Schema being used:"
echo "=========================================="
head -20 prisma/schema.prisma

echo ""
echo "=========================================="
echo "🔄 Generating Prisma client..."
echo "=========================================="
npx prisma generate

echo ""
echo "=========================================="
echo "✅ Prisma client regenerated successfully!"
echo "=========================================="
