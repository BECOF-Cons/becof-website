# Hotfix: Appointment Service Type Field

## Issue
The appointment booking system was failing with the error:
```
Null constraint violation on the fields: (`serviceType`)
```

## Root Cause
There was a mismatch between the database schema and the application code:
- **Database (Production)**: Had a column named `serviceType`
- **Application Code**: Was trying to write to a column named `service`

## Changes Made

### 1. Updated Prisma Schemas
- Changed `service` field to `serviceType` in both:
  - [prisma/schema.prisma](prisma/schema.prisma#L148) (SQLite - local)
  - [prisma/schema-postgres.prisma](prisma/schema-postgres.prisma#L148) (PostgreSQL - production)

### 2. Updated API Routes
- [app/api/appointments/route.ts](app/api/appointments/route.ts#L96): Changed `service:` to `serviceType:`
- [app/api/appointments/[id]/route.ts](app/api/appointments/[id]/route.ts#L164): Updated reference
- [app/api/payments/route.ts](app/api/payments/route.ts#L101): Updated reference
- [app/api/payments/webhook/route.ts](app/api/payments/webhook/route.ts#L88-L97): Updated references

### 3. Updated Email Templates
- [lib/email.ts](lib/email.ts): All appointment service references updated to use `serviceType`

### 4. Updated Admin Interface
- [app/[locale]/admin/appointments/page.tsx](app/[locale]/admin/appointments/page.tsx#L205): Updated display
- [app/[locale]/payment/page.tsx](app/[locale]/payment/page.tsx#L210): Updated display

### 5. Local Database Migration
- Renamed `service` column to `serviceType` in local SQLite database

## Deployment Steps

### Option 1: Automatic (Recommended if database already has `serviceType` column)
Just push the code changes - Vercel will automatically:
1. Run `node scripts/prepare-schema.js` to select PostgreSQL schema
2. Run `prisma generate` to generate the client
3. Build and deploy the application

```bash
git add -A
git commit -m "Fix: Update appointment service field to serviceType"
git push origin main
```

### Option 2: Manual Migration (If database has `service` column)
If the production database still has a `service` column instead of `serviceType`:

1. Connect to your production PostgreSQL database
2. Run the migration script:
   ```bash
   psql $DATABASE_URL -f scripts/migrate-service-to-serviceType.sql
   ```

3. Then deploy the code:
   ```bash
   git add -A
   git commit -m "Fix: Update appointment service field to serviceType"
   git push origin main
   ```

## Verification

After deployment, test the appointment booking:

1. Go to: https://becof-website.vercel.app/fr/appointment?service=ORIENTATION_SESSION
2. Fill in the form with test data
3. Click "Réserver" / "Reserve"
4. Should redirect to payment page without errors

## Files Changed
- `prisma/schema.prisma`
- `prisma/schema-postgres.prisma`
- `app/api/appointments/route.ts`
- `app/api/appointments/[id]/route.ts`
- `app/api/payments/route.ts`
- `app/api/payments/webhook/route.ts`
- `lib/email.ts`
- `app/[locale]/admin/appointments/page.tsx`
- `app/[locale]/payment/page.tsx`

## New Files
- `scripts/migrate-service-to-serviceType.sql` - SQL migration script for production

## Status
✅ Local database migrated
✅ All code references updated
✅ Prisma client regenerated
✅ TypeScript errors cleared
⏳ Ready for production deployment
