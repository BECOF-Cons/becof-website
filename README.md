# BECOF - Orientation Consulting Website

A modern, bilingual (French/English) orientation consulting platform for Tunisian high school graduates. Built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

- ✅ **Bilingual Support** - French and English
- ✅ **Blog System** - Custom-built CMS for content management
- ✅ **Appointment Booking** - Google Calendar integration
- ✅ **Payment Integration** - Konnect, Flouci, D17, and Bank Transfer
- ✅ **Custom Admin Dashboard** - No subscription CMS needed
- ✅ **Modern UI** - Vibrant, state-of-the-art design for young audience
- ✅ **Fully Responsive** - Mobile-first design
- ✅ **SEO Optimized** - Built-in SEO features

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn
- PostgreSQL database (local or hosted)

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/BECOF-Cons/becof-website.git
cd becof-website
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/becof_website"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

4. **Setup the database**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the website.

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
