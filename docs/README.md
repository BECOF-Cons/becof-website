# BECOF Website Documentation

This folder contains all documentation for the BECOF website project.

## 📚 Documentation Structure

### Essential Documents (Start Here!)

- **[USER_GUIDE.md](./USER_GUIDE.md)** - Complete guide for using the deployed website
  - Admin login and management
  - Blog management
  - Appointment handling
  - User management (adding admins)
  - Optional features (email, calendar, payments)

### Deployment Documentation

Located in `deployment/` folder:

- **[QUICKSTART.md](./deployment/QUICKSTART.md)** - Fast 10-minute deployment guide (Vercel)
- **[DEPLOYMENT.md](./deployment/DEPLOYMENT.md)** - Comprehensive deployment guide (3 platforms)
- **[ENV_GUIDE.md](./deployment/ENV_GUIDE.md)** - Complete environment variables reference
- **[PRODUCTION_CHECKLIST.md](./deployment/PRODUCTION_CHECKLIST.md)** - Pre-launch verification checklist

### Archived Documents

Located in `archived/` folder:

These documents were useful during development but are now outdated or superseded:
- Development guides
- Implementation summaries
- Testing documentation
- Troubleshooting guides (content moved to USER_GUIDE.md)

---

## 🚀 Quick Links

**For End Users:**
- Start with: [USER_GUIDE.md](./USER_GUIDE.md)

**For Deployment:**
- Fast setup: [deployment/QUICKSTART.md](./deployment/QUICKSTART.md)
- Detailed setup: [deployment/DEPLOYMENT.md](./deployment/DEPLOYMENT.md)
- Environment config: [deployment/ENV_GUIDE.md](./deployment/ENV_GUIDE.md)

**For Development:**
- See main [README.md](../README.md) in project root

---

## 📖 Document Overview

### USER_GUIDE.md (⭐ Start Here!)
Everything you need to use your deployed website:
- How to login as admin
- Add/manage users (admins & super admins)
- Create blog posts
- Manage appointments
- Configure services & pricing
- Optional integrations (email, calendar, payments)
- Troubleshooting common issues

**Perfect for:** Site administrators and content managers

### deployment/QUICKSTART.md
Fastest path to deployment:
- 9 steps to deploy to Vercel
- Takes ~10 minutes
- Includes database setup with Neon
- Environment variables configuration
- Admin user creation

**Perfect for:** Quick production deployment

### deployment/DEPLOYMENT.md
Comprehensive deployment guide:
- Step-by-step for 3 platforms (Vercel, Railway, DigitalOcean)
- Pre-deployment checklist
- Database setup (multiple options)
- Authentication configuration
- Troubleshooting section
- Post-deployment tasks

**Perfect for:** Detailed setup or alternative platforms

### deployment/ENV_GUIDE.md
Complete environment variables reference:
- Required variables (DATABASE_URL, NEXTAUTH_*, etc.)
- Optional variables (SMTP, OAuth, Calendar, Payments)
- How to obtain each credential
- Testing your configuration
- Security best practices

**Perfect for:** Configuring optional features

### deployment/PRODUCTION_CHECKLIST.md
Pre-launch verification:
- Code & Build checklist
- Database setup verification
- Feature testing (all pages)
- Security checklist
- Performance optimization
- SEO checklist
- Post-deployment tasks

**Perfect for:** Final checks before going live

---

## 🎯 Common Tasks

### I want to deploy the website
→ [deployment/QUICKSTART.md](./deployment/QUICKSTART.md)

### I want to add an admin user
→ [USER_GUIDE.md](./USER_GUIDE.md#-user-management-super_admin-only)

### I want to create a blog post
→ [USER_GUIDE.md](./USER_GUIDE.md#-blog-management)

### I want to enable email notifications
→ [USER_GUIDE.md](./USER_GUIDE.md#email-notifications-optional)

### I want to configure payment gateway
→ [USER_GUIDE.md](./USER_GUIDE.md#payment-gateway-integration-optional)

### I need to know about environment variables
→ [deployment/ENV_GUIDE.md](./deployment/ENV_GUIDE.md)

---

## 💡 Tips

1. **First time?** Start with USER_GUIDE.md
2. **Deploying?** Use QUICKSTART.md for Vercel or DEPLOYMENT.md for other platforms
3. **Need env vars?** Check ENV_GUIDE.md for complete reference
4. **Going live?** Use PRODUCTION_CHECKLIST.md to verify everything
5. **Issues?** Check USER_GUIDE.md troubleshooting section first

---

## 📞 Support

- **GitHub Issues:** https://github.com/BECOF-Cons/becof-website/issues
- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
