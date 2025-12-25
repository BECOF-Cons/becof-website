# BECOF Website - Production Deployment Guide

## 🚀 Deployment Options

### Option 1: Vercel (Recommended - Easiest)

Vercel is the recommended platform as it's built by the Next.js team and offers seamless deployment.

#### Steps:

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Configure Environment Variables** in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.production.example`
   - **Required variables:**
     ```
     DATABASE_URL=postgresql://...
     NEXTAUTH_SECRET=generated-secret
     NEXTAUTH_URL=https://yourdomain.vercel.app
     ```

4. **Set up PostgreSQL Database**
   - Option A: Use Vercel Postgres (integrated)
   - Option B: Use [Neon](https://neon.tech) (free tier, recommended)
   - Option C: Use [Supabase](https://supabase.com) (free tier)
   
   Get the `DATABASE_URL` and add it to Vercel environment variables

5. **Run Database Migration**
   After first deployment, run in Vercel CLI or project settings:
   ```bash
   npm run prisma:migrate
   ```

6. **Create Admin User**
   Use Vercel's serverless function or connect to database directly:
   ```bash
   # Connect via Prisma Studio to your production DB
   # Or use the create-admin script with production DATABASE_URL
   ```

---

### Option 2: Railway

Railway offers simple deployment with built-in PostgreSQL.

#### Steps:

1. **Create Railway Account**: [railway.app](https://railway.app)

2. **New Project**
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository

3. **Add PostgreSQL**
   - In your project, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically set `DATABASE_URL`

4. **Configure Environment Variables**
   - Add all variables from `.env.production.example`
   - Railway auto-sets `DATABASE_URL` from the PostgreSQL service

5. **Set Custom Domain** (optional)
   - Go to Settings → Domains
   - Add your custom domain or use Railway's provided domain

---

### Option 3: DigitalOcean App Platform

Good for full control with managed infrastructure.

#### Steps:

1. **Create App**: [cloud.digitalocean.com/apps](https://cloud.digitalocean.com/apps)
2. **Connect GitHub repository**
3. **Add Managed PostgreSQL Database** from Resources
4. **Configure build settings**:
   - Build Command: `npm run build`
   - Run Command: `npm run start`
5. **Set environment variables** in App settings

---

## 📋 Pre-Deployment Checklist

### 1. Database Setup
- [ ] Create production PostgreSQL database
- [ ] Update `DATABASE_URL` in environment variables
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Generate Prisma client: `npx prisma generate`

### 2. Authentication
- [ ] Generate `NEXTAUTH_SECRET`: `openssl rand -base64 32`
- [ ] Set `NEXTAUTH_URL` to your production domain
- [ ] Configure Google OAuth (optional but recommended):
  - Create project in [Google Cloud Console](https://console.cloud.google.com)
  - Enable Google+ API
  - Create OAuth 2.0 credentials
  - Add authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`

### 3. Email Configuration
- [ ] Set up SMTP credentials (Gmail, SendGrid, etc.)
- [ ] For Gmail: Enable 2FA and create [App Password](https://myaccount.google.com/apppasswords)
- [ ] Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
- [ ] Set `ADMIN_EMAIL` for receiving contact form submissions

### 4. Google Calendar (Optional)
- [ ] Create Calendar in Google Calendar
- [ ] Get Calendar ID (Settings → Calendar settings → Calendar ID)
- [ ] Run `scripts/get-refresh-token.js` to get refresh token
- [ ] Set `GOOGLE_CALENDAR_ID` and `GOOGLE_REFRESH_TOKEN`

### 5. Payment Gateways (When Ready)
- [ ] Konnect: Get API key and Wallet ID
- [ ] Flouci: Get App Token and Secret
- [ ] D17: Get API key and Merchant ID

### 6. Create Admin User
After deployment:
```bash
# Method 1: Using Prisma Studio
npx prisma studio
# Create user manually with role: ADMIN

# Method 2: Using script (needs DATABASE_URL)
DATABASE_URL="your-prod-db-url" npx tsx scripts/create-admin.ts admin@becof.tn password123 "Admin"
```

### 7. Initialize Pricing Settings
Connect to your production database and run:
```sql
INSERT INTO "SiteSettings" (id, key, value, "createdAt", "updatedAt") VALUES 
(gen_random_uuid()::text, 'price_orientation', '150', NOW(), NOW()),
(gen_random_uuid()::text, 'price_career_counseling', '150', NOW(), NOW()),
(gen_random_uuid()::text, 'price_career_coaching', '200', NOW(), NOW()),
(gen_random_uuid()::text, 'price_group_workshop', '100', NOW(), NOW());
```

---

## 🔐 Security Recommendations

1. **Strong Secrets**: Generate all secrets using `openssl rand -base64 32`
2. **Environment Variables**: Never commit `.env` files to Git
3. **Database**: Use strong passwords, enable SSL for PostgreSQL
4. **API Keys**: Rotate keys regularly
5. **CORS**: Configure in production if needed
6. **Rate Limiting**: Consider adding rate limiting for contact form and booking

---

## 🧪 Testing Production Build Locally

Before deploying, test the production build locally:

```bash
# Build the application
npm run build

# Start production server
npm run start

# Access at http://localhost:3000
```

---

## 📊 Monitoring & Analytics

### Recommended Tools:
- **Vercel Analytics**: Built-in with Vercel deployment
- **Google Analytics**: Add to track visitor behavior
- **Sentry**: For error tracking
- **LogRocket**: For session replay

---

## 🔄 Post-Deployment

1. **Test all features**:
   - [ ] Admin login
   - [ ] Blog posts display
   - [ ] Appointment booking
   - [ ] Payment flow
   - [ ] Contact form
   - [ ] Email notifications

2. **Set up custom domain**:
   - Add domain in deployment platform
   - Update DNS records
   - Update `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL`

3. **Create initial content**:
   - [ ] Create blog posts via admin panel
   - [ ] Update pricing if needed
   - [ ] Test appointment booking

4. **SEO**:
   - [ ] Submit sitemap to Google Search Console
   - [ ] Verify site ownership
   - [ ] Set up Google Analytics

---

## 🆘 Troubleshooting

### Build Fails
- Check all environment variables are set
- Ensure `DATABASE_URL` is accessible
- Run `npm run build` locally to debug

### Database Connection Issues
- Verify `DATABASE_URL` format
- Check database is accessible from deployment platform
- Enable SSL if required: `?sslmode=require`

### Authentication Not Working
- Verify `NEXTAUTH_URL` matches your domain exactly
- Check `NEXTAUTH_SECRET` is set
- For Google OAuth, verify redirect URIs

### Emails Not Sending
- Test SMTP credentials locally first
- Check firewall/security settings on hosting
- Verify Gmail App Password if using Gmail

---

## 📞 Support

For deployment issues:
- Check deployment platform docs
- Review build logs
- Verify all environment variables

---

## 🎉 You're Ready!

Follow the steps for your chosen platform and you'll have your BECOF website live on the internet!
