# Environment Variables Guide

## Overview
This guide explains all environment variables needed for the BECOF application and which features require them.

---

## 🔴 Required for Core Functionality

These variables **must** be set for the application to work:

### Database
```bash
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```
- **What**: PostgreSQL database connection string
- **Required for**: All database operations (blog, appointments, users, etc.)
- **Where to get**: 
  - [Neon.tech](https://neon.tech) (Free tier recommended)
  - [Supabase](https://supabase.com) (Free tier)
  - [Railway](https://railway.app) (Auto-provided when you add PostgreSQL)
  - Vercel Postgres
- **Format**: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`

### Authentication
```bash
NEXTAUTH_SECRET="your-secret-here"
```
- **What**: Secret key for encrypting sessions
- **Required for**: Admin login and authentication
- **How to generate**: Run `openssl rand -base64 32` in terminal
- **Example**: `J8F3kL9mN2pQ5rT8vX1yZ4cD6fG9hK2m`

```bash
NEXTAUTH_URL="https://yourdomain.com"
```
- **What**: Full URL of your deployed application
- **Required for**: NextAuth callbacks and redirects
- **Development**: `http://localhost:3000`
- **Production**: Your actual domain (e.g., `https://becof-website.vercel.app`)
- **Important**: Must match the exact URL users access (including subdomain)

---

## 🟡 Optional - Email Features

**Without these, the site works but:**
- ❌ Admin invitations won't send (use direct user creation instead)
- ❌ Appointment confirmations won't send
- ❌ Contact form submissions won't notify admins
- ✅ All other features work normally (blog, appointments are saved, admin panel, etc.)

### Email Configuration (for Gmail)
```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-specific-password"
```
**What**: SMTP credentials for sending emails
**Required for**: 
- Sending admin invitation emails
- Appointment confirmation emails
- Contact form notification emails

**How to get Gmail App Password**:
1. Enable 2-Factor Authentication on your Google account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate a new app password for "Mail"
4. Use the 16-character code as `SMTP_PASSWORD`

```bash
ADMIN_EMAIL="admin@becof.tn"
```
- **What**: Email address to receive contact form submissions
- **Required for**: Contact form notifications
ADMIN_EMAIL="admin@becof.tn"
```
- **What**: Email server settings for contact form and notifications
- **Gmail Setup**:
  1. Enable 2-Factor Authentication on your Google account
  2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
  3. Create new app password for "Mail"
  4. Use that 16-character password as `SMTP_PASSWORD`
- **Alternatives**: SendGrid, Mailgun, AWS SES, Resend

### Google OAuth (Admin Login)
```bash
GOOGLE_CLIENT_ID="123456789-abcdefg.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abc123def456"
```
- **What**: Allows admin login via Google account
- **How to get**:
  1. Go to [Google Cloud Console](https://console.cloud.google.com)
  2. Create new project or select existing
  3. Enable "Google+ API"
  4. Go to Credentials → Create OAuth 2.0 Client ID
  5. Application type: Web application
  6. Add authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`
  7. Copy Client ID and Client Secret

---

## 🟢 Optional Variables

These enhance functionality but aren't required:

### Google Calendar Integration
```bash
GOOGLE_CALENDAR_ID="your-calendar-id@group.calendar.google.com"
GOOGLE_REFRESH_TOKEN="1//abc123def456..."
```
- **What**: Automatically creates calendar events for appointments
- **How to get**:
  1. Create a Google Calendar
  2. Get Calendar ID: Settings → Calendar → Integrate calendar → Calendar ID
  3. Run `node scripts/get-refresh-token.js` to get refresh token
  4. Follow prompts and authorize

### Payment Gateways

#### Konnect (Tunisian payment gateway)
```bash
KONNECT_API_KEY="your-api-key"
KONNECT_WALLET_ID="your-wallet-id"
```
- **What**: Accept payments via Konnect
- **How to get**: Sign up at [Konnect](https://konnect.network)

#### Flouci (Tunisian mobile payment)
```bash
FLOUCI_APP_TOKEN="your-app-token"
FLOUCI_APP_SECRET="your-app-secret"
```
- **What**: Accept mobile payments via Flouci
- **How to get**: Sign up at [Flouci](https://flouci.com)

#### D17 (Tunisian payment gateway)
```bash
D17_API_KEY="your-api-key"
D17_MERCHANT_ID="your-merchant-id"
```
- **What**: Accept payments via D17
- **How to get**: Contact D17 for merchant account

### Site Configuration
```bash
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
NEXT_PUBLIC_SITE_NAME="BECOF"
```
- **What**: Public-facing site information (accessible in browser)
- **Use**: For SEO, social sharing, etc.

---

## 📝 Setting Environment Variables

### Local Development
1. Copy `.env.local.example` to `.env.local`
2. Fill in your values
3. Never commit `.env.local` to Git

### Vercel
1. Go to Project Settings → Environment Variables
2. Add each variable
3. Choose environment: Production, Preview, or Development
4. Redeploy after adding variables

### Railway
1. Go to your project
2. Click Variables tab
3. Add key-value pairs
4. Railway auto-deploys on change

### DigitalOcean
1. Go to App Settings → App-Level Environment Variables
2. Add variables
3. Save and redeploy

---

## ⚠️ Security Best Practices

1. **Never commit secrets**: Keep `.env.local` in `.gitignore`
2. **Use strong secrets**: Generate with `openssl rand -base64 32`
3. **Rotate regularly**: Change passwords and secrets periodically
4. **Limit access**: Only give database access to necessary services
5. **Use environment-specific values**: Different secrets for dev/staging/prod
6. **Enable SSL**: Use `?sslmode=require` in DATABASE_URL for production

---

## 🧪 Testing Configuration

Test if your environment variables are working:

```bash
# Check if variables are loaded
npm run dev

# Test database connection
npx prisma studio

# Test email
# Send a test message through contact form

# Test authentication
# Try logging in to /admin
```

---

## 🔍 Troubleshooting

### "NEXTAUTH_SECRET is not set"
- Generate one: `openssl rand -base64 32`
- Add to environment variables
- Restart application

### "Database connection failed"
- Verify DATABASE_URL format
- Check network access (whitelist IPs if needed)
- Ensure database exists
- Try `?sslmode=require` for production databases

### "Email not sending"
- Verify SMTP credentials
- Check firewall rules
- For Gmail: ensure App Password is used, not regular password
- Test with: `npx tsx scripts/test-email.ts` (create this script)

### "Google OAuth not working"
- Verify redirect URI in Google Console matches exactly
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- Ensure Google+ API is enabled

---

## 📋 Quick Reference

Copy this checklist when deploying:

```bash
# Required
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=generated-secret-here
NEXTAUTH_URL=https://yourdomain.com

# Email (recommended)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ADMIN_EMAIL=admin@becof.tn

# OAuth (recommended)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Optional: Calendar
GOOGLE_CALENDAR_ID=calendar-id@group.calendar.google.com
GOOGLE_REFRESH_TOKEN=your-refresh-token

# Optional: Payments (add when ready)
KONNECT_API_KEY=
KONNECT_WALLET_ID=
FLOUCI_APP_TOKEN=
FLOUCI_APP_SECRET=
D17_API_KEY=
D17_MERCHANT_ID=

# Public config
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_NAME=BECOF
```
