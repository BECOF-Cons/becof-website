#!/usr/bin/env node
/**
 * This script switches between SQLite (local) and PostgreSQL (production) schemas
 * - Local development uses SQLite with file:./dev.db
 * - Production (Vercel) uses PostgreSQL
 * 
 * NOTE: schema.prisma is now PostgreSQL by default for production stability
 */

const fs = require('fs');
const path = require('path');

const schemaDir = path.join(__dirname, '..', 'prisma');
const schemaPath = path.join(schemaDir, 'schema.prisma');
const sqliteSchemaPath = path.join(schemaDir, 'schema-sqlite.prisma');
const postgresSchemaPath = path.join(schemaDir, 'schema-postgres.prisma');

// Check if we're in production (Vercel)
const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL || '';

// Determine which schema to use
const usePostgres = isProduction || databaseUrl.startsWith('postgres');

console.log('🔧 Preparing Prisma schema...');
console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);
console.log(`Database: ${usePostgres ? 'PostgreSQL' : 'SQLite'}`);
console.log(`DATABASE_URL starts with: ${databaseUrl.substring(0, 20)}...`);

if (usePostgres) {
  // Production - keep PostgreSQL schema (already default)
  console.log('✅ Using PostgreSQL schema (production)');
  if (fs.existsSync(postgresSchemaPath)) {
    fs.copyFileSync(postgresSchemaPath, schemaPath);
    console.log('✅ Copied schema-postgres.prisma to schema.prisma');
  }
} else {
  // Local development - use SQLite
  if (fs.existsSync(sqliteSchemaPath)) {
    console.log('✅ Using SQLite schema (local development)');
    fs.copyFileSync(sqliteSchemaPath, schemaPath);
  } else {
    console.log('⚠️ SQLite schema not found, keeping current schema');
  }
}

console.log('✅ Schema preparation complete');
