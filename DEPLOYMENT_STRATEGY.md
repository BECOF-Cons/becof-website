# Deployment Strategy for Branding Updates

## Current Status
- **Current Branch**: `branding` (development/staging)
- **Production Branch**: `main`
- **Database**: Local SQLite migrated ✅

## 🎯 Recommended Deployment Strategy

### Option 1: Create Staging Environment (RECOMMENDED)
This is the safest approach for testing before production.

#### Step 1: Create Staging Branch
```bash
# From branding branch
git checkout -b staging
git push origin staging
```

#### Step 2: Deploy Staging on Vercel
1. Go to Vercel Dashboard
2. Create a new project or add a new environment
3. Connect to `staging` branch
4. Set up environment variables (same as production)
5. Deploy

**Environment Variables Needed for Staging:**
```env
DATABASE_URL="your_postgres_or_production_db_url"
NEXTAUTH_URL="https://staging-becof.vercel.app"
NEXTAUTH_SECRET="production-secret-key"
AUTH_SECRET="production-secret-key"
NEXT_PUBLIC_SITE_URL="https://staging-becof.vercel.app"
ADMIN_EMAIL="admin@becof.tn"
UPLOADTHING_SECRET="your_uploadthing_secret"
UPLOADTHING_APP_ID="your_uploadthing_app_id"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_REFRESH_TOKEN="your_google_refresh_token"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="helmiboussetta11@gmail.com"
SMTP_PASSWORD="your_app_password"
EMAIL_FROM="noreply@becof.tn"
```

#### Step 3: Run Database Migration on Staging
After staging deployment:
```bash
# SSH into Vercel or use Vercel CLI
npx prisma db push
```

Or in Vercel Dashboard:
- Go to Project Settings → Environment Variables
- Add: `DATABASE_URL` (your production/staging database)
- Redeploy

#### Step 4: Test Thoroughly
- ✅ Test all color changes
- ✅ Test blog category creation
- ✅ Test service icon selection
- ✅ Test appointment booking
- ✅ Test admin features
- ✅ Test mobile responsiveness

#### Step 5: Merge to Production
```bash
git checkout main
git merge staging
git push origin main
```

### Option 2: Direct Production Deployment (FASTER, RISKIER)

#### Step 1: Merge branding to main
```bash
git checkout main
git merge branding
git push origin main
```

#### Step 2: Database Migration
Vercel will automatically deploy. You need to run:
```bash
# Using Vercel CLI
vercel env pull .env.production
DATABASE_URL="your_production_db" npx prisma db push
```

Or manually in your production database run:
```sql
ALTER TABLE Service ADD COLUMN icon TEXT DEFAULT 'Lightbulb';
```

## 🔧 Database Migration Details

### Changes Required:
1. **Service Table**: Add `icon` column (TEXT, default: 'Lightbulb')

### SQL Migration (if using PostgreSQL):
```sql
-- Add icon column to Service table
ALTER TABLE "Service" ADD COLUMN "icon" TEXT DEFAULT 'Lightbulb';
```

### Prisma Migration:
```bash
npx prisma db push
```

## 📋 Pre-Deployment Checklist

### Code Changes:
- ✅ Global CSS with brand colors
- ✅ Hero section with orange background blobs
- ✅ All components using brand colors (#233691, #F9AA04)
- ✅ Blog category creation feature
- ✅ Service icon selector
- ✅ Appointment pricing card redesign
- ✅ Footer brand visibility fix
- ✅ All hover states and transitions

### Database:
- ✅ Local DB migrated (dev.db)
- ⏳ Production DB needs migration

### Testing:
- ⏳ Staging environment testing
- ⏳ Mobile testing
- ⏳ Admin features testing
- ⏳ Form submissions testing

## 🚀 Deployment Steps

### For Staging (Recommended):

```bash
# 1. Commit all changes
git add .
git commit -m "feat: implement branding updates with orange/blue colors, add blog category creation, and service icon selector"

# 2. Create and push staging branch
git checkout -b staging
git push origin staging

# 3. Deploy on Vercel (connect to staging branch)
# 4. Run database migration on staging
# 5. Test thoroughly
# 6. Merge to main when ready
```

### For Direct Production:

```bash
# 1. Commit all changes
git add .
git commit -m "feat: implement branding updates with orange/blue colors, add blog category creation, and service icon selector"

# 2. Push to branding
git push origin branding

# 3. Merge to main
git checkout main
git merge branding
git push origin main

# 4. Vercel auto-deploys
# 5. Run database migration on production
```

## 🔄 Rollback Plan

If issues occur after deployment:

```bash
# Quick rollback
git checkout main
git revert HEAD
git push origin main
```

## 📝 Post-Deployment Tasks

1. Update existing service icons via admin panel
2. Test all color changes on production
3. Monitor error logs in Vercel
4. Test admin features
5. Update documentation if needed

## 🎨 Brand Colors Reference

- **Blue**: #233691 (rgb 35, 54, 145)
- **Orange**: #F9AA04 (rgb 249, 170, 4)

## ⚠️ Important Notes

1. **Database Backup**: Always backup production database before migration
2. **Environment Variables**: Ensure all env vars are set in Vercel
3. **Testing**: Test staging thoroughly before production
4. **Monitoring**: Watch Vercel logs during first hour after deployment
5. **Cache**: Clear browser cache to see new styles

## 📞 Support

If issues occur:
- Check Vercel deployment logs
- Verify environment variables
- Check database connection
- Review Prisma schema sync
