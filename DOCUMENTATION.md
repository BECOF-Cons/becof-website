# BECOF Website - Project Documentation

## 🎯 Project Overview

BECOF is a modern orientation consulting platform designed for Tunisian high school graduates (Baccalauréat students) to help them choose the right university path. The platform features:

- **Bilingual Content** (French/English)
- **Blog/News System** for orientation information
- **Appointment Booking** integrated with Google Calendar
- **Payment Processing** via Tunisian payment gateways
- **Custom Admin Dashboard** for easy content management

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Internationalization**: next-intl
- **Animations**: Framer Motion
- **Rich Text**: Tiptap Editor

### Design Philosophy
- **Mobile-First**: Optimized for mobile devices
- **Modern & Vibrant**: Appeals to young audience (18+ year olds)
- **Fast Performance**: Optimized for speed
- **SEO Friendly**: Server-side rendering for better rankings
- **Accessible**: WCAG compliant

## 📱 Pages & Features

### Public Pages

1. **Homepage** (`/[locale]`)
   - Hero section with CTA
   - Features overview
   - Statistics
   - Latest blog posts
   - Call-to-action section

2. **Blog** (`/[locale]/blog`)
   - Blog listing with pagination
   - Category filtering
   - Search functionality
   - Individual post pages with SEO

3. **Services** (`/[locale]/services`)
   - Service packages
   - Pricing information
   - Booking CTA

4. **Appointment Booking** (`/[locale]/appointment`)
   - Service selection
   - Date/time picker
   - Student information form
   - Payment integration

5. **About** (`/[locale]/about`)
   - Company information
   - Team members
   - Mission & vision

6. **Contact** (`/[locale]/contact`)
   - Contact form
   - Location map
   - Social media links

### Admin Dashboard

1. **Dashboard** (`/admin`)
   - Overview statistics
   - Recent appointments
   - Recent payments

2. **Blog Management** (`/admin/blog`)
   - Create/Edit/Delete posts
   - Rich text editor
   - Image upload
   - SEO settings
   - Bilingual content

3. **Appointment Management** (`/admin/appointments`)
   - View all bookings
   - Approve/Reject
   - Calendar view
   - Email notifications

4. **Payment Management** (`/admin/payments`)
   - Transaction history
   - Payment status
   - Export reports

5. **Settings** (`/admin/settings`)
   - Site configuration
   - Service pricing
   - Email templates
   - Google Calendar setup

## 💾 Database Schema

### Key Models

**User**
- Authentication and authorization
- Admin vs regular users
- Profile information

**BlogPost**
- Bilingual content (titleEn, titleFr, contentEn, contentFr)
- SEO metadata
- Categories and tags
- Publishing workflow

**Appointment**
- Student information
- Service type
- Preferred dates
- Status tracking
- Google Calendar sync

**Payment**
- Transaction details
- Payment method
- Status tracking
- Webhook responses

## 🔌 API Integration

### Payment Gateways

1. **Konnect (Paymee)**
   - REST API integration
   - Payment initiation
   - Webhook for confirmation

2. **Flouci**
   - Mobile payment API
   - QR code generation
   - Status checking

3. **D17**
   - Card processing
   - 3D Secure support
   - Refund handling

4. **Bank Transfer**
   - Manual verification
   - Upload receipt
   - Admin approval

### Google Calendar API

- OAuth 2.0 authentication
- Event creation
- Meeting link generation
- Calendar synchronization
- Reminder emails

## 🎨 Design System

### Colors
```css
Primary: Indigo
- 50:  #EEF2FF
- 600: #4F46E5 (Main)
- 700: #4338CA

Secondary: Purple
- 600: #9333EA
- 700: #7E22CE

Accent: Pink
- 600: #DB2777
- 700: #BE185D
```

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: 700 (Bold)
- **Body**: 400 (Regular)
- **UI Elements**: 600 (Semi-bold)

### Components
- Rounded corners (8px, 16px, 24px)
- Subtle shadows
- Smooth transitions (200-300ms)
- Gradient backgrounds
- Glass morphism effects

## 🔐 Security

### Authentication
- Secure password hashing (bcrypt)
- Session management
- Role-based access control (RBAC)

### Data Protection
- Environment variables for secrets
- HTTPS only in production
- CSRF protection
- Input validation (Zod schemas)
- SQL injection prevention (Prisma)

### Payment Security
- PCI DSS compliance
- Secure webhook validation
- Transaction logging

## 🚀 Deployment Guide

### Step 1: Prepare Code
```bash
# Ensure all changes are committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Setup Vercel
1. Create account at vercel.com
2. Import GitHub repository
3. Configure project settings
4. Add environment variables

### Step 3: Database Setup
**Option A: Vercel Postgres (Recommended for small scale)**
- Free tier: 256MB storage
- Automatic backups
- Easy setup

**Option B: External PostgreSQL**
- Supabase (free tier available)
- Railway
- Neon
- Digital Ocean

### Step 4: Environment Variables
```env
DATABASE_URL=
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
KONNECT_API_KEY=
FLOUCI_APP_TOKEN=
D17_API_KEY=
```

### Step 5: Run Migrations
```bash
npx prisma migrate deploy
```

### Step 6: Custom Domain
1. Purchase domain (e.g., becof.tn)
2. Add to Vercel
3. Update DNS records
4. SSL auto-configured

## 📊 Testing Strategy

### Local Testing
```bash
# Run dev server
npm run dev

# Test both languages
# Visit http://localhost:3000 (French)
# Visit http://localhost:3000/en (English)
```

### Client Preview
**Option 1: Vercel Preview**
- Automatic on every git push
- Unique URL for each commit
- Share with client

**Option 2: Ngrok Tunnel**
```bash
npx ngrok http 3000
# Share the HTTPS URL
```

## 📈 Monitoring & Analytics

### Recommended Tools
1. **Vercel Analytics** (Free)
   - Page views
   - Performance metrics
   - User demographics

2. **Google Analytics 4**
   - Detailed user behavior
   - Conversion tracking
   - Custom events

3. **Sentry** (Error Tracking)
   - Runtime errors
   - Performance issues
   - User feedback

## 💰 Cost Breakdown

### Initial Setup (Year 1)
- Domain: $15/year
- Vercel Hosting: Free
- Database: Free tier
- **Total: $15/year**

### Growth Phase (10k+ visitors/month)
- Vercel Pro: $20/month
- Database: $25/month
- **Total: ~$555/year**

### At Scale (100k+ visitors/month)
- Vercel Pro: $20/month
- Database: $50/month
- CDN: $30/month
- **Total: ~$1,215/year**

## 🛠️ Maintenance Guide

### For Client (Non-Technical)

**Creating Blog Posts**
1. Login to `/admin`
2. Click "Blog" → "New Post"
3. Fill in French content
4. Fill in English content
5. Upload cover image
6. Click "Publish"

**Managing Appointments**
1. Go to "Appointments"
2. View calendar
3. Approve/Reject bookings
4. Send confirmations

**Updating Services**
1. Go to "Settings" → "Services"
2. Edit pricing
3. Update descriptions
4. Save changes

### For Developers

**Adding New Features**
1. Create branch: `git checkout -b feature/new-feature`
2. Develop locally
3. Test thoroughly
4. Push and create PR
5. Deploy to production

**Database Changes**
```bash
# Update schema.prisma
# Generate migration
npx prisma migrate dev --name description

# Deploy to production
npx prisma migrate deploy
```

## 🐛 Troubleshooting

### Common Issues

**Issue: Database connection failed**
```bash
# Check DATABASE_URL in .env.local
# Verify database is running
# Test connection:
npx prisma db pull
```

**Issue: Build fails on Vercel**
- Check build logs
- Verify environment variables
- Ensure all dependencies are in package.json

**Issue: Images not loading**
- Check image paths
- Verify public folder structure
- Review Next.js image config

## 📚 Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://authjs.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Tunisian Payment APIs
- [Konnect Documentation](https://konnect.network/developers)
- [Flouci Documentation](https://flouci.com/developers)
- D17 (Contact support for API docs)

### Support
- GitHub Issues
- Email: dev@becof.tn

## 📝 Changelog

### Version 0.1.0 (Initial Release)
- ✅ Bilingual website (FR/EN)
- ✅ Homepage with modern design
- ✅ Blog structure setup
- ✅ Database schema
- ✅ Component library
- ⏳ Admin dashboard (in progress)
- ⏳ Payment integration (in progress)
- ⏳ Google Calendar integration (in progress)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📄 License

Copyright © 2024 BECOF. All rights reserved.
