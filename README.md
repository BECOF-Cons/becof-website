# BECOF Website

A modern, bilingual (French/English) website for BECOF consulting services, featuring appointment booking, blog management, and payment integration.

## 🚀 Quick Start

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your values
   ```

3. **Set up database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Create admin user**
   ```bash
   npx tsx scripts/create-admin.ts admin@becof.tn password123 "Admin User"
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Website: http://localhost:3000
   - Admin: http://localhost:3000/admin

## 📦 Production Deployment

See [QUICKSTART.md](./QUICKSTART.md) for fastest deployment to Vercel, or [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guide with all options.

## ✨ Features
- **Bilingual Support**: Full French/English translation
- **Admin Dashboard**: Manage appointments, blog, payments, and settings
- **Blog System**: Rich text editor with bilingual content
- **Appointment Booking**: Dynamic pricing based on service type
- **Payment Integration**: Support for Konnect, Flouci, D17, and bank transfer
- **Email Notifications**: Contact form and appointment notifications
- **Google Calendar**: Automatic event creation for appointments
- **SEO Optimized**: Meta tags, sitemaps, structured data
- **Error Boundaries**: Graceful error handling throughout the app
- **Responsive Design**: Mobile-first design with Tailwind CSS

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **Styling**: Tailwind CSS
- **Email**: Nodemailer
- **Forms**: React Hook Form + Zod validation
- **Rich Text**: TipTap editor
- **Icons**: Lucide React

## 📁 Project Structure

```
becof-website/
├── app/                    # Next.js app directory
│   ├── [locale]/          # Localized routes (en/fr)
│   │   ├── page.tsx       # Homepage
│   │   ├── about/         # About page
│   │   ├── services/      # Services page
│   │   ├── blog/          # Blog pages
│   │   ├── appointment/   # Booking page
│   │   ├── payment/       # Payment flow
│   │   └── contact/       # Contact form
│   ├── admin/             # Admin dashboard
│   │   ├── page.tsx       # Dashboard home
│   │   ├── appointments/  # Manage appointments
│   │   ├── payments/      # Manage payments
│   │   ├── blog/          # Blog management
│   │   ├── pricing/       # Pricing settings
│   │   └── settings/      # Site settings
│   └── api/               # API routes
│       ├── appointments/  # Booking API
│       ├── payments/      # Payment API
│       ├── contact/       # Contact form API
│       └── blog/          # Blog API
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── home/             # Homepage components
│   └── ui/               # Reusable UI components
├── lib/                  # Utility functions
│   ├── prisma.ts         # Prisma client
│   ├── email.ts          # Email utilities
│   └── google-calendar.ts # Calendar integration
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Migration history
├── scripts/              # Utility scripts
│   ├── create-admin.ts   # Create admin user
│   ├── create-dummy-blogs.ts # Seed blog data
│   └── setup-production.sh # Production setup script
├── messages/             # Translations
│   ├── en.json           # English translations
│   └── fr.json           # French translations
└── public/               # Static assets
```

## 🔧 Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations (production)
npm run prisma:studio    # Open Prisma Studio
```

## 🌐 Environment Variables

See [ENV_GUIDE.md](./ENV_GUIDE.md) for comprehensive environment variable documentation.

### Required Variables
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Secret for session encryption
- `NEXTAUTH_URL` - Application URL

### Optional Variables
- Email: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
- Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Calendar: `GOOGLE_CALENDAR_ID`, `GOOGLE_REFRESH_TOKEN`
- Payment gateways: `KONNECT_*`, `FLOUCI_*`, `D17_*`

## 📚 Documentation

- [QUICKSTART.md](./QUICKSTART.md) - Fast deployment guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Comprehensive deployment guide
- [ENV_GUIDE.md](./ENV_GUIDE.md) - Environment variables reference

## 🔐 Admin Access

Default admin credentials (change after first login):
- Email: `admin@becof.tn`
- Password: `password123`

## 🎨 Customization

### Branding
- Update colors in `tailwind.config.ts`
- Replace logo in `public/`
- Modify translations in `messages/`

### Services & Pricing
- Update via admin panel: `/admin/pricing`
- Or modify directly in database `SiteSettings` table

### Email Templates
- Located in `lib/email.ts`
- Customize HTML templates for notifications

## 🧪 Testing

Before deploying:
```bash
# Build locally
npm run build

# Start production build
npm run start

# Test all features:
# - Admin login
# - Blog posts
# - Appointment booking
# - Payment flow
# - Contact form
```

## 📄 License

Private - © 2025 BECOF Consulting

## 🤝 Support

For deployment or technical issues, refer to the documentation or check the deployment platform's logs.

---

**Built with ❤️ for BECOF Consulting**
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
