# Quick Start - Deploy to Vercel

This is the fastest way to get your BECOF website online.

## Step 1: Prepare Your Code

```bash
# Commit all changes
git add .
git commit -m "Ready for production deployment"
git push origin main
```

## Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **"Add New Project"**
3. Import your GitHub repository `BECOF-Cons/becof-website`
4. Vercel will auto-detect Next.js - click **"Deploy"**
5. Wait for initial deployment (will fail - that's OK, we need to add variables)

## Step 3: Set Up Database

### Option A: Use Neon (Recommended - Free)

1. Go to [neon.tech](https://neon.tech)
2. Sign up and create new project
3. Copy the connection string (looks like: `postgresql://user:password@host/db?sslmode=require`)
4. Save it - you'll need it in next step

### Option B: Use Vercel Postgres

1. In your Vercel project, go to **Storage** tab
2. Click **"Create Database"** → Choose **Postgres**
3. Connection string will be auto-added to your project

## Step 4: Add Environment Variables

In Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add these **required** variables:

```bash
DATABASE_URL
# Paste your PostgreSQL connection string from Step 3

NEXTAUTH_SECRET
# Generate: Run in terminal: openssl rand -base64 32
# Example: J8F3kL9mN2pQ5rT8vX1yZ4cD6fG9hK2m

NEXTAUTH_URL
# Your Vercel URL: https://your-project.vercel.app
# (You can update this later with custom domain)
```

3. Click **"Save"**

## Step 5: Redeploy

1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Wait for deployment to complete (should succeed now)

## Step 6: Set Up Database

1. In your terminal, set DATABASE_URL temporarily:
```bash
export DATABASE_URL="your-production-database-url-from-step-3"
```

2. Run migrations:
```bash
npx prisma migrate deploy
```

## Step 7: Create Admin User

Option A - Using Prisma Studio:
```bash
npx prisma studio
# Opens in browser - create user manually with role: ADMIN
```

Option B - Using script:
```bash
DATABASE_URL="your-prod-url" npx tsx scripts/create-admin.ts admin@becof.tn YourPassword123 "Admin Name"
```

## Step 8: Initialize Pricing

Connect to your database and run:
```sql
INSERT INTO "SiteSettings" (id, key, value, "createdAt", "updatedAt") VALUES 
('price_orientation_' || gen_random_uuid()::text, 'price_orientation', '150', NOW(), NOW()),
('price_counseling_' || gen_random_uuid()::text, 'price_career_counseling', '150', NOW(), NOW()),
('price_coaching_' || gen_random_uuid()::text, 'price_career_coaching', '200', NOW(), NOW()),
('price_workshop_' || gen_random_uuid()::text, 'price_group_workshop', '100', NOW(), NOW());
```

Or set via admin panel after logging in.

## Step 9: Test Your Site! 🎉

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Test homepage loads
3. Login to admin: `https://your-project.vercel.app/admin`
4. Create a blog post
5. Test appointment booking

## Optional: Add Custom Domain

1. In Vercel project, go to **Settings** → **Domains**
2. Add your domain (e.g., `becof.tn`)
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` to your custom domain
5. Redeploy

## Optional: Set Up Email

To enable contact form and notifications:

1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Create new App Password
3. Add to Vercel environment variables:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
ADMIN_EMAIL=admin@becof.tn
```
4. Redeploy

---

## That's It! 

Your BECOF website is now live on the internet! 🚀

**Next steps:**
- Create blog posts
- Customize pricing
- Test booking flow
- Add payment gateways when ready

**Need help?** Check the full [DEPLOYMENT.md](./DEPLOYMENT.md) guide.
