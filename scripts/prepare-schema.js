#!/usr/bin/env node
/**
 * This script switches between SQLite (local) and PostgreSQL (production) schemas
 * - Local development uses SQLite with file:./dev.db
 * - Production (Vercel) uses PostgreSQL
 */

const fs = require('fs');
const path = require('path');

const schemaDir = path.join(__dirname, '..', 'prisma');
const schemaPath = path.join(schemaDir, 'schema.prisma');
const sqliteSchemaPath = path.join(schemaDir, 'schema.prisma');
const postgresSchemaPath = path.join(schemaDir, 'schema-postgres.prisma');

// Check if we're in production (Vercel)
const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL || '';

// Determine which schema to use
const usePostgres = isProduction || databaseUrl.startsWith('postgres');

console.log('🔧 Preparing Prisma schema...');
console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);
console.log(`Database: ${usePostgres ? 'PostgreSQL' : 'SQLite'}`);

if (usePostgres && fs.existsSync(postgresSchemaPath)) {
  // Use PostgreSQL schema for production
  console.log('✅ Using PostgreSQL schema');
  fs.copyFileSync(postgresSchemaPath, schemaPath);
} else {
  // Keep SQLite schema for local development
  console.log('✅ Using SQLite schema (local development)');
  // Schema is already SQLite by default, no action needed
}

console.log('✅ Schema preparation complete');
