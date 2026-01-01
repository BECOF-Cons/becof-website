# Team Member Feature Deployment Guide

## ✅ Changes Summary

### Code Changes (Already Complete)
- ✅ Removed `crossOrigin="anonymous"` attribute from all image tags
- ✅ Images now work with any public URL (Freepik, Imgur, direct URLs)
- ✅ Google Drive URL conversion still supported (though may have limitations)
- ✅ Team member CRUD interface complete
- ✅ Public about page displays team members

### Database Changes Required

#### Schema Updates
- ✅ `prisma/schema.prisma` - Updated with TeamMember model (SQLite)
- ✅ `prisma/schema-postgres.prisma` - Updated with TeamMember model (PostgreSQL)

## 🚀 Deployment Steps

### Option 1: Using Migration Script (Recommended)

Run this SQL in your production database (Neon/PostgreSQL):

```bash
# Copy the migration file content to run in Neon console
cat scripts/add-team-member-table.sql
```

Or run the full migration script:
```bash
cat scripts/migrate-production.sql
```

**Benefits:**
- Uses `CREATE TABLE IF NOT EXISTS` - safe to run multiple times
- Will NOT delete or modify existing data
- Creates only the TeamMember table if it doesn't exist

### Option 2: Using Prisma (Alternative)

If you prefer using Prisma CLI:

```bash
# Generate Prisma client with updated schema
npx prisma generate

# Push schema changes to production (only if you're confident)
# WARNING: Test this on a staging database first
DATABASE_URL="your-production-url" npx prisma db push
```

### Option 3: Via Vercel Environment

If deploying via Vercel with automatic migrations:

1. Push code to your repository
2. Vercel will detect schema changes
3. Run migration during build process

**Make sure your `package.json` has:**
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "vercel-build": "prisma generate && prisma db push && next build"
  }
}
```

## 📋 Pre-Deployment Checklist

- [x] Code changes committed (crossOrigin removed)
- [x] Schema files updated (schema.prisma + schema-postgres.prisma)
- [x] Migration SQL created (add-team-member-table.sql)
- [ ] Test locally (verify images load with various URLs)
- [ ] Backup production database (if needed)
- [ ] Run migration on production database
- [ ] Deploy code to production
- [ ] Verify team page works: `/fr/admin/team` and `/fr/about`

## 🧪 Testing Checklist

### Local Testing
```bash
# Ensure dev.db has TeamMember table
sqlite3 dev.db "SELECT name FROM sqlite_master WHERE type='table' AND name='TeamMember';"

# Start dev server
npm run dev

# Test pages:
# - http://localhost:3000/fr/admin/team (list/add/edit)
# - http://localhost:3000/fr/about (public view)
```

### Production Testing (After Deployment)
1. Login as SUPER_ADMIN
2. Navigate to `/fr/admin/team`
3. Add a test team member with a public image URL (try Imgur or Freepik)
4. Verify image displays in admin list
5. Visit `/fr/about` and verify team member displays
6. Test both French and English versions

## 🖼️ Image URL Recommendations

### ✅ Recommended Services (No CORS Issues)
- **Imgur**: https://imgur.com (upload → copy image address)
- **Cloudinary**: https://cloudinary.com (image CDN)
- **Unsplash**: https://unsplash.com (direct image links)
- **Your own domain**: Upload to `/public` folder and use relative paths

### ⚠️ May Have Issues
- Google Drive: Works sometimes, but has embedding restrictions
- Dropbox: Often blocks embedding
- OneDrive: Has strict CORS policies

### 📝 Image Best Practices
- Format: JPG or PNG
- Size: Under 500KB recommended
- Dimensions: 400x400 to 800x800 pixels (square ratio preferred)
- Resolution: 72-150 DPI for web

## 🔒 Data Safety

**The migration is SAFE because:**
1. Uses `CREATE TABLE IF NOT EXISTS` - won't recreate existing table
2. No `DROP` or `DELETE` statements
3. No modifications to existing tables
4. Only adds new TeamMember table

**Existing data (Users, Services, Blog Posts, etc.) is UNTOUCHED.**

## 🐛 Troubleshooting

### Images not loading?
1. Check browser console for errors (F12 → Console)
2. Verify image URL is publicly accessible (test in incognito browser)
3. Try a different image hosting service (Imgur is most reliable)
4. Check if URL starts with `https://` (not `http://`)

### Table not created?
```sql
-- Check if table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'TeamMember';

-- If not, run the migration manually
-- Copy content from scripts/add-team-member-table.sql
```

### Build fails on Vercel?
- Ensure `prisma/schema-postgres.prisma` is committed
- Check Vercel build logs for Prisma errors
- Verify `DATABASE_URL` environment variable is set

## 📞 Need Help?

If issues occur during deployment:
1. Check Vercel deployment logs
2. Check database console for migration errors
3. Test with a simple Imgur URL first
4. Verify admin login works before testing team features

## 🎉 Post-Deployment

After successful deployment:
1. Add real team members with professional photos
2. Update display order if needed (lower numbers show first)
3. Use bilingual content (French + English)
4. Toggle `active` status to hide/show members without deleting
