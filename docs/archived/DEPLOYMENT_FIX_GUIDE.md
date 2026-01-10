# 🔧 CRITICAL FIX: Appointment Schema Alignment

## 🚨 Issues Found

### Error 1: `serviceType` field mismatch
```
Null constraint violation on the fields: (serviceType)
```
- **Cause**: Database had `serviceType`, code was using `service`
- **Status**: ✅ FIXED in code

### Error 2: `studentName` field mismatch  
```
Null constraint violation on the fields: (studentName)
```
- **Cause**: Production database has old columns with NOT NULL constraints
  - Old: `studentName`, `studentEmail`, `studentPhone`
  - New: `name`, `email`, `phone`
- **Status**: ⚠️ **REQUIRES DATABASE MIGRATION**

## 🎯 Root Cause

The production database was never fully migrated from old column names to new ones. Both old and new columns exist, but the old columns still have NOT NULL constraints, causing appointment creation to fail when they're not provided.

## 📋 Changes Made (Code)

### 1. Updated Field Names
- Changed all references from `service` → `serviceType`
- Ensured schema matches production database structure

### 2. Files Modified (11 files)
- `prisma/schema.prisma` - Updated Appointment model
- `prisma/schema-postgres.prisma` - Updated Appointment model
- `app/api/appointments/route.ts` - Use serviceType in creation
- `app/api/appointments/[id]/route.ts` - Updated queries and references
- `app/api/payments/route.ts` - Updated queries
- `app/api/payments/webhook/route.ts` - Updated queries and email calls
- `lib/email.ts` - Updated all type definitions
- `app/[locale]/admin/appointments/page.tsx` - Updated display
- `app/[locale]/admin/payments/page.tsx` - Updated queries
- `app/[locale]/payment/page.tsx` - Updated display
- Local `prisma/dev.db` - Migrated schema

### 3. New Migration Scripts
- ✅ `scripts/migrate-service-to-serviceType.sql` - Renames service to serviceType
- ✅ `scripts/fix-appointment-schema.sql` - **PRIMARY MIGRATION** - Handles old columns

---

## 🚀 DEPLOYMENT INSTRUCTIONS

### ⚠️ **STEP 1: DATABASE MIGRATION (CRITICAL - DO THIS FIRST!)**

You **MUST** run the database migration **BEFORE** deploying code changes, or appointments will continue to fail.

#### Option A: Using psql Command Line
```bash
# Get your DATABASE_URL from Vercel → Settings → Environment Variables
# Then run:
psql "YOUR_DATABASE_URL" -f scripts/fix-appointment-schema.sql
```

#### Option B: Using Neon Console (Recommended)
1. Go to https://console.neon.tech
2. Select your project
3. Click **"SQL Editor"** in the sidebar
4. Copy the contents of `scripts/fix-appointment-schema.sql`
5. Paste into the editor
6. Click **"Run"**
7. Verify you see success messages

**What this migration does:**
- Creates new columns (`name`, `email`, `phone`) if missing
- Copies data from old columns (`studentName`, `studentEmail`, `studentPhone`)
- Removes NOT NULL from old columns (so they don't block new appointments)
- Sets NOT NULL on new columns
- **Keeps old columns for safety** (can drop later after verification)

### ✅ **STEP 2: DEPLOY CODE CHANGES**

After the database migration is complete:

```bash
git add -A
git commit -m "Fix: Align appointment schema with production database"
git push origin main
```

Vercel will automatically:
1. Select the PostgreSQL schema
2. Generate Prisma client
3. Build and deploy your app

---

## 🧪 VERIFICATION

After deployment, test the booking flow:

### Test 1: Orientation Session
1. Go to: `https://your-site.vercel.app/en/appointment?service=ORIENTATION_SESSION`
2. Fill in the form with test data
3. Click "Reserve" / "Réserver"
4. ✅ Should redirect to payment page (no errors)

### Test 2: Application Help
1. Go to: `https://your-site.vercel.app/en/appointment?service=APPLICATION_HELP`
2. Fill in the form
3. Click "Reserve"
4. ✅ Should work without errors

### Test 3: Verify in Admin
1. Login at `/admin/login`
2. Go to `/admin/appointments`
3. ✅ Should see the test appointments with all fields populated

---

## 📊 What Changed

| Component | Before | After | Status |
|-----------|--------|-------|--------|
| Database Field | `service` | `serviceType` | ✅ Fixed |
| Database Field | `studentName` | `name` | ⚠️ Migration needed |
| Database Field | `studentEmail` | `email` | ⚠️ Migration needed |
| Database Field | `studentPhone` | `phone` | ⚠️ Migration needed |
| Code References | `appointment.service` | `appointment.serviceType` | ✅ Fixed |
| Prisma Schema | SQLite & PostgreSQL aligned | Both use `serviceType` | ✅ Fixed |
| Type Safety | Had TypeScript errors | All errors resolved | ✅ Fixed |

---

## 🔍 Technical Details

### Migration Safety Features
The migration script is designed to be **safe and idempotent**:
- ✅ Checks if columns exist before adding them
- ✅ Preserves all existing data
- ✅ Copies data from old → new columns
- ✅ Doesn't drop old columns (commented out)
- ✅ Can be run multiple times without issues
- ✅ Uses transaction-safe PostgreSQL operations

### Why Two Migrations?
1. **`migrate-service-to-serviceType.sql`** - Simple column rename
2. **`fix-appointment-schema.sql`** - Comprehensive fix for all field mismatches (includes the first migration)

**Just run `fix-appointment-schema.sql`** - it handles everything!

---

## 🆘 Troubleshooting

### After migration, still getting errors?

**Check 1: Was migration successful?**
```sql
-- Run this in Neon SQL Editor to check column structure:
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'Appointment' 
ORDER BY column_name;
```

Expected results:
- `name` - NOT NULL - text
- `email` - NOT NULL - text  
- `phone` - NOT NULL - text
- `serviceType` - NOT NULL - text
- `studentName` - YES (nullable) - text
- `studentEmail` - YES (nullable) - text
- `studentPhone` - YES (nullable) - text

**Check 2: Was code deployed?**
- Go to Vercel → Deployments
- Verify latest deployment shows "Ready"
- Check deployment logs for any Prisma errors

**Check 3: Clear Prisma cache**
Sometimes Vercel caches the old Prisma client. Force a clean rebuild:
1. Go to Vercel → Settings → General
2. Scroll to "Build & Development Settings"
3. Toggle any setting off and on (or change Node version temporarily)
4. Redeploy

---

## 📞 Summary

### What You Need to Do:
1. ⚠️ **RUN DATABASE MIGRATION** - `fix-appointment-schema.sql` in Neon Console
2. ✅ **DEPLOY CODE** - Push to GitHub (Vercel auto-deploys)
3. 🧪 **TEST BOOKING** - Try creating an appointment
4. ✅ **VERIFY** - Check admin panel

### Time Required:
- Migration: ~1 minute
- Deployment: ~2 minutes
- Testing: ~2 minutes
- **Total: ~5 minutes**

---

## ✅ Checklist

- [ ] Backed up database (optional but recommended)
- [ ] Ran `fix-appointment-schema.sql` in Neon Console
- [ ] Verified migration success (no errors in console)
- [ ] Committed code changes
- [ ] Pushed to GitHub
- [ ] Waited for Vercel deployment to complete
- [ ] Tested appointment booking
- [ ] Verified appointments show in admin panel
- [ ] 🎉 Everything working!

---

**Need help?** Check the migration script comments for detailed explanations of each step.
