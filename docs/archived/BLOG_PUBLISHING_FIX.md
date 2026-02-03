# Blog Publishing Fix - Deployment Checklist

## What Will Deploy to Production (Vercel/main branch)

✅ **Automatic - No action needed:**

1. **API Route Changes (POST/PUT)**
   - `/app/api/admin/blog/route.ts` - Sets `publishedAt` timestamp when publishing
   - `/app/api/admin/blog/[id]/route.ts` - Handles both creating and updating blogs
   - Slug generation with fallback (`untitled-{timestamp}` if title is empty)
   
2. **Blog List Page**
   - `/app/[locale]/blog/page.tsx`
   - Added `export const revalidate = 60` for ISR (Incremental Static Regeneration)
   - This ensures new blogs appear within 60 seconds of publishing
   
3. **Schema Switching**
   - Vercel's build process automatically uses PostgreSQL schema
   - `scripts/prepare-schema.js` handles this during build
   - Your Neon PostgreSQL database will be used in production

## What Needs Manual Action in Production

⚠️ **Check Production Database:**

If blogs with empty slugs already exist in your production Neon database (from before these fixes), they won't display. You need to:

1. **Check if the problem exists:**
   ```bash
   # Connect to your production Neon database and run:
   SELECT COUNT(*) as count FROM "BlogPost" WHERE "slugEn" = '' OR "slugFr" = '';
   ```

2. **If count > 0, run the fix script:**
   ```bash
   # In Vercel deployment environment:
   npm run ts -- scripts/fix-empty-slugs.ts
   
   # Or locally pointing to production database:
   DATABASE_URL="postgresql://..." npm run ts -- scripts/fix-empty-slugs.ts
   ```

## How to Deploy

1. **Push to main branch:**
   ```bash
   git add .
   git commit -m "Fix blog publishing: set publishedAt timestamp and slug generation fallback"
   git push origin main
   ```

2. **Vercel will automatically:**
   - Run the build command with schema preparation
   - Deploy the updated API routes and pages
   - Start using the new publishing logic immediately

3. **If needed, run the fix script:**
   - Either via Vercel's environment variables and build commands
   - Or locally with access to production database credentials

## Testing in Production

After deployment, test:

1. Create a new blog in admin panel with title and content
2. Check "Publier immédiatement" (Publish Now)
3. Click "Créer l'article" (Create Article)
4. Visit `/en/blog` and `/fr/blog` - blog should appear immediately
5. Click on blog - should load successfully with slug URL

## Files Changed

- `app/api/admin/blog/route.ts` - POST endpoint
- `app/api/admin/blog/[id]/route.ts` - PUT endpoint  
- `app/[locale]/blog/page.tsx` - Blog list page with revalidate
- `scripts/fix-empty-slugs.ts` - NEW: Fix script for existing blogs with empty slugs

## Key Improvements

✨ **What's fixed:**
- Published blogs now have `publishedAt` timestamp (critical for sorting)
- Slug generation never fails - has fallback to `untitled-{timestamp}`
- Blog list revalidates every 60 seconds (ISR)
- Blog detail page uses `findFirst` for better fallback slug handling
- Full bilingual support with automatic fallback

🎯 **Result:**
- Create blog → Publish immediately → Appears in blog list within 60 seconds
- Works in both `/en/blog` and `/fr/blog`
- Works locally (SQLite) and production (PostgreSQL)
