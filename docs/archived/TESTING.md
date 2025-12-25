# BECOF Website - Quick Testing Guide

## ✅ Completed Features

### Phase 1: Foundation
- Homepage with modern design
- Bilingual support (FR/EN)
- Blog system with CMS
- Admin authentication

### Phase 2: Blog
- Blog post creation/editing
- Rich text editor (Tiptap)
- Image uploads
- Categories and tags
- Public blog pages

### Phase 3: Appointments & Payments
- Appointment booking form
- Payment integration (4 methods)
- Contact form
- Admin appointment management

---

## 🧪 Testing URLs

### Public Pages
- **Homepage (FR)**: http://localhost:3000
- **Homepage (EN)**: http://localhost:3000/en
- **Blog**: http://localhost:3000/blog
- **Book Appointment**: http://localhost:3000/appointment
- **Contact**: http://localhost:3000/contact

### Admin Pages (Login: admin@becof.tn / admin123)
- **Login**: http://localhost:3000/admin/login
- **Dashboard**: http://localhost:3000/admin
- **Blog Management**: http://localhost:3000/admin/blog
- **Appointments**: http://localhost:3000/admin/appointments

---

## 📋 Test Scenarios

### 1. Book an Appointment
1. Go to http://localhost:3000/appointment
2. Fill form (name, email, phone, service, date, time)
3. Click "Continue to Payment"
4. Select payment method (Konnect/Flouci/D17/Bank Transfer)
5. Complete payment
6. Check admin panel for new appointment

### 2. Create Blog Post
1. Login to admin (admin@becof.tn / admin123)
2. Go to "Blog Posts" → "New Post"
3. Fill French & English content
4. Add featured image (URL or upload)
5. Click "Publish"
6. View on public blog page

### 3. Contact Form
1. Go to http://localhost:3000/contact
2. Fill form (name, email, subject, message)
3. Submit
4. See success message

---

## 💳 Payment Methods

**Available Options:**
- **Konnect** - Card payment (API integration pending)
- **Flouci** - Mobile wallet (API integration pending)
- **D17** - D17 payment (API integration pending)
- **Bank Transfer** - Manual transfer with bank details shown

**Current Status:**
- Forms and UI: ✅ Complete
- Payment records: ✅ Saved to database
- Gateway integration: 🚧 Ready for API keys

---

## 🔑 Environment Variables Needed

### Optional Integrations (in .env.local)

**Email Notifications:**
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

**Payment Gateways:**
```env
# Konnect
KONNECT_API_KEY="..."
KONNECT_WALLET_ID="..."

# Flouci
FLOUCI_APP_TOKEN="..."
FLOUCI_APP_SECRET="..."

# D17
D17_API_KEY="..."
```

**Google Calendar:**
```env
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_REFRESH_TOKEN="..."
```

---

## 📊 Database

**Location:** `prisma/dev.db`

**View Data:**
```bash
npx prisma studio
```

**Models:**
- User (admin accounts)
- BlogPost (blog articles)
- BlogCategory
- Appointment (bookings)
- Payment (transactions)

---

## 🚀 Next Steps

### To Complete Payment Integration:
1. Get API keys from payment providers
2. Add to `.env.local`
3. Implement payment gateway logic in `app/api/payments/route.ts`
4. Test with real transactions

### To Enable Email Notifications:
1. Set up Gmail App Password or SMTP
2. Add credentials to `.env.local`
3. Uncomment email code in API routes

### To Add Google Calendar:
1. Create Google Cloud project
2. Enable Calendar API
3. Get OAuth credentials
4. Add to `.env.local`

---

## 📱 Mobile Testing

Website is fully responsive. Test on:
- Desktop (Chrome, Firefox, Safari)
- Tablet (iPad)
- Mobile (iPhone, Android)

Use browser dev tools or real devices.

---

## 🎨 Customization

**Colors:** Teal (#14B8A6) and Purple (#9333EA)
**Fonts:** System fonts (optimized for performance)
**Logo:** "BECOF" text (can be replaced with image)

**To customize:**
- Colors: `app/globals.css` and Tailwind classes
- Content: `messages/fr.json` and `messages/en.json`
- Database: Seed script in `prisma/seed.ts`

---

## 💡 Tips

- Use **Prisma Studio** to view/edit database data
- Check browser console for API errors
- Admin email is `admin@becof.tn` (password: `admin123`)
- All forms have validation with Zod
- Payment methods are ready for integration
- Bank transfer shows account details immediately

---

## 🐛 Troubleshooting

**Port 3000 already in use:**
```bash
lsof -ti:3000 | xargs kill
npm run dev
```

**Database issues:**
```bash
rm prisma/dev.db
npx prisma migrate dev --name init
```

**Missing dependencies:**
```bash
npm install
```

**TypeScript errors:**
```bash
npx prisma generate
```
