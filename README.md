# BECOF - Orientation Consulting Website

A modern, bilingual (French/English) orientation consulting platform for Tunisian Baccalauréat students. Built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features Implemented

### Phase 1 ✅ Complete
- **Bilingual Support** - French (default) and English with next-intl
- **Modern Homepage** - Hero, Features, Stats, Blog preview, CTA sections
- **Responsive Design** - Mobile-first with Tailwind CSS
- **Navigation** - Fixed navbar with language switcher
- **Animations** - Framer Motion for smooth interactions

### Phase 2 ✅ Complete
- **Admin Dashboard** - Full authentication system with NextAuth.js
- **Blog Management** - Complete CRUD operations for blog posts
- **Rich Text Editor** - Tiptap with formatting toolbar
- **Image Uploads** - UploadThing integration (optional, can use URLs)
- **Public Blog Pages** - Dynamic blog listing and individual post pages
- **Categories & Tags** - Organized content structure

### Phase 3 ✅ Complete
- **Appointment Booking** - Full booking system with form validation
- **Payment Gateway** - Support for Konnect, Flouci, D17, and Bank Transfer
- **Contact Page** - Contact form with email notifications
- **Admin Appointments** - View and manage all appointments
- **Payment Tracking** - Payment status and transaction management

### Phase 4 🚧 Pending
- Google Calendar integration (optional)
- Email notifications (nodemailer configured, needs SMTP setup)
- Services/About pages
- Payment gateway API integration (Konnect, Flouci, D17)

## 🧪 Testing Instructions

### 1. Frontend (Public Pages)
```bash
npm run dev
```
- **Homepage**: http://localhost:3000 (French) or http://localhost:3000/en (English)
- **Blog Listing**: http://localhost:3000/blog
- **Language Switcher**: Click globe icon in navbar

### 2. Admin Dashboard
1. Go to http://localhost:3000/admin
2. Login with:
   - Email: `admin@becof.tn`
   - Password: `admin123`
3. You'll see the dashboard with sidebar navigation

### 3. Blog Management
**Create a Post:**
1. In admin dashboard, click "Blog Posts" in sidebar
2. Click "New Post" button
3. Fill in both French and English fields:
   - Title (auto-generates URL slug)
   - Excerpt (short summary)
   - Content (use rich text editor)
   - Select category
   - Add featured image (paste URL or upload via UploadThing)
4. Click "Save Draft" or "Publish"

**View Published Posts:**
- Admin blog list: http://localhost:3000/admin/blog
- Public blog: http://localhost:3000/blog
- Individual post: http://localhost:3000/blog/[slug]

### 6. Database
- **Location**: `prisma/dev.db` (SQLite file in project root)
- **Admin User**: Already seeded (admin@becof.tn / admin123)
- **Categories**: 3 default categories created (Orientation, Career, Studies)
- **View Data**: Use Prisma Studio: `npx prisma studio`
- **Models**: User, BlogPost, BlogCategory, Appointment, Payment, etc.
   - Select service type
   - Choose date and time
   - Add optional message
3. Click "Continue to Payment"
4. Select payment method (Konnect, Flouci, D17, or Bank Transfer)
5. Complete payment

**Admin View:**
- View all appointments: http://localhost:3000/admin/appointments
- See appointment status, payment status, and client details

### 5. Contact Page
- Contact form: http://localhost:3000/contact
- Bilingual support (FR/EN)
- Form validation with Zod

### 4. Database
- **Location**: `prisma/dev.db` (SQLite file in project root)
- **Admin User**: Already seeded (admin@becof.tn)
- **Categories**: 3 default categories created (Orientation, Career, Studies)
- **View Data**: Use Prisma Studio: `npx prisma studio`

## 🔧 Setup (Already Done)

The project is ready to run. If you need to reset:

```bash
# Install dependencies
npm install

# Database is already created (dev.db)
# If you need to reset it:
rm prisma/dev.db
npx prisma migrate dev --name init
```
## 📁 Key Files & Routes

**Public Pages:**
- Homepage: `app/[locale]/page.tsx`
- Blog: `app/[locale]/blog/page.tsx`
- Blog Post: `app/[locale]/blog/[slug]/page.tsx`
- Appointment: `app/[locale]/appointment/page.tsx`
- Payment: `app/[locale]/payment/page.tsx`
- Contact: `app/[locale]/contact/page.tsx`

**Admin Pages:**
- Dashboard: `app/admin/page.tsx`
- Blog Management: `app/admin/blog/page.tsx`
- Appointments: `app/admin/appointments/page.tsx`

**API Routes:**
- Blog: `app/api/blog/route.ts`
- Appointments: `app/api/appointments/route.ts`
- Payments: `app/api/payments/route.ts`
- Contact: `app/api/contact/route.ts`

**Database:**
- Schema: `prisma/schema.prisma`
- Database: `prisma/dev.db`
- Seed: `prisma/seed.ts`
- **Public Blog**: `app/[locale]/blog/`

## 🌐 Testing & Showing to Client

### Option 1: Vercel Preview (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel (free)
3. Get automatic preview URL: `becof-website-xyz.vercel.app`
4. Client can access from anywhere

### Option 2: Local Network
1. Find your local IP: `ipconfig getifaddr en0` (Mac) or `ipconfig` (Windows)
2. Share URL: `http://YOUR_IP:3000`
3. Client must be on same network

### Option 3: Ngrok Tunnel
```bash
npx ngrok http 3000
```
Share the generated HTTPS URL with your client.

## 📁 Project Structure

```
becof-website/
├── app/
│   ├── [locale]/          # Localized routes
│   │   ├── page.tsx       # Homepage
│   │   ├── blog/          # Blog pages
│   │   ├── services/      # Services page
│   │   ├── appointment/   # Booking page
│   │   └── about/         # About page
│   ├── admin/             # Admin dashboard
│   │   ├── blog/          # Blog management
│   │   ├── appointments/  # Appointment management
│   │   └── settings/      # Site settings
│   └── api/               # API routes
│       ├── auth/          # Authentication
│       ├── blog/          # Blog API
│       ├── appointments/  # Booking API
│       └── payments/      # Payment webhooks
├── components/
│   ├── layout/            # Navbar, Footer
│   ├── home/              # Homepage components
│   ├── blog/              # Blog components
│   ├── admin/             # Admin components
│   └── ui/                # Reusable UI components
├── lib/
│   ├── prisma.ts          # Database client
│   └── utils.ts           # Utility functions
├── prisma/
│   └── schema.prisma      # Database schema
├── messages/              # i18n translations
│   ├── fr.json            # French
│   └── en.json            # English
└── public/                # Static files
```

## 🎨 Design System

- **Colors**: 
  - Primary: Indigo (600)
  - Secondary: Purple (600)
  - Accent: Pink (600)
- **Fonts**: Inter (Google Fonts)
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 👨‍💼 Client Management (Admin Dashboard)

Access the admin dashboard at `/admin` (coming soon).

**What the client can do:**
- ✅ Create/Edit/Delete blog posts
- ✅ Upload images
- ✅ Manage appointments
- ✅ View payments
- ✅ Update site content
- ✅ Manage services and pricing

**No coding required!**

## 🚀 Deployment to Production

### Deploy to Vercel (Recommended - Free)

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Add environment variables
   - Click "Deploy"

3. **Setup Database**
   - Use Vercel Postgres (free tier)
   - Or connect external PostgreSQL

4. **Custom Domain**
   - Add your domain in Vercel settings
   - Update DNS records
   - SSL certificate automatically configured

### Cost Estimate
- **Vercel Hosting**: Free (or $20/month Pro)
- **Database**: Free tier or $10-25/month
- **Domain**: ~$15/year
- **Total**: $15-$300/year depending on traffic

## 🔧 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run database migrations
npx prisma migrate dev

# Open Prisma Studio (database GUI)
npx prisma studio

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🌍 Languages

The website supports:
- **French (fr)** - Default language
- **English (en)**

To add content:
1. Edit translation files in `messages/`
2. Add content in both languages in the admin dashboard

## 📦 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **Internationalization**: next-intl
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **Rich Text Editor**: Tiptap

## 🔐 Security

- Environment variables for sensitive data
- NextAuth.js for authentication
- CSRF protection
- Input validation with Zod
- SQL injection prevention (Prisma)

## 📞 Support

For questions or issues, contact:
- Email: contact@becof.tn
- Website: [www.becof.tn](https://www.becof.tn)

## 📄 License

Copyright © 2024 BECOF. All rights reserved.
