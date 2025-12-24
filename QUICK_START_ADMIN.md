# Quick Start Guide - New Admin Features

## 🚀 Getting Started in 3 Minutes

### Step 1: Setup (One Time Only)

```bash
# 1. Run database migration (already done)
npx prisma migrate dev

# 2. Seed default services
npm run seed:services

# 3. Promote yourself to Super Admin (replace with your email)
npm run promote:superadmin admin@becof.tn

# 4. Restart the dev server
# Stop the current server (Ctrl+C) and restart:
npm run dev
```

### Step 2: Access Admin Management

1. **Login** at http://localhost:3000/admin/login
2. You'll see a new **"Admin Management"** item in the sidebar
3. Click it to access the admin management page

### Step 3: Invite Your First Admin

1. Click **"Invite Admin"** button
2. Enter email address (e.g., `newadmin@becof.tn`)
3. Choose role:
   - **Admin**: Can manage content, appointments, payments
   - **Super Admin**: Can do everything + manage other admins
4. Click **"Send Invitation"**
5. ✅ An email will be sent with a setup link

### Step 4: Complete Admin Setup (As the Invitee)

1. Check email for invitation
2. Click the setup link
3. Enter your **full name**
4. Create a **password** (minimum 8 characters)
5. Click **"Create Account"**
6. ✅ You can now login!

### Step 5: Manage Services

1. Go to **"Service Pricing"** in the sidebar
2. Try these actions:

#### Create a New Service
- Click **"Add Service"**
- Fill in English & French names/descriptions
- Set price (e.g., "250" or "Sur devis")
- Choose service type
- Click **"Create Service"**

#### Edit a Service
- Click the **pencil icon** on any service
- Modify any field
- Click **"Save"**

#### Toggle Service Status
- Click the **eye icon** to activate/deactivate
- Inactive services can be hidden from public

#### Delete a Service
- Click the **trash icon**
- Confirm deletion

## 🎨 UI Overview

### Admin Management Page (`/admin/users`)
```
┌─────────────────────────────────────────┐
│  Admin Team              [Invite Admin] │
├─────────────────────────────────────────┤
│  Active Admins (2)                      │
│  ┌───────────────────────────────────┐  │
│  │ 👤 John Doe (You)                 │  │
│  │ admin@becof.tn | Super Admin      │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ 👤 Jane Smith            [Delete] │  │
│  │ jane@becof.tn | Admin             │  │
│  └───────────────────────────────────┘  │
├─────────────────────────────────────────┤
│  Pending Invitations (1)                │
│  ┌───────────────────────────────────┐  │
│  │ 📧 newadmin@becof.tn              │  │
│  │ Admin | Expires Dec 31, 2025      │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Service Management Page (`/admin/pricing`)
```
┌─────────────────────────────────────────┐
│  Service Management      [Add Service]  │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │ Orientation Session / Séance...   │  │
│  │ Individual career guidance...     │  │
│  │ 💰 150 TND | Order: 1 | ACTIVE   │  │
│  │                    [👁] [✏️] [🗑️]  │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ Career Coaching / Coaching...     │  │
│  │ Personalized career coaching...   │  │
│  │ 💰 Sur devis | Order: 5 | ACTIVE │  │
│  │                    [👁] [✏️] [🗑️]  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## ⚡ Quick Commands Reference

```bash
# Seed services with default data
npm run seed:services

# Promote user to Super Admin
npm run promote:superadmin <email>

# Open Prisma Studio (visual database editor)
npm run prisma:studio

# View database
open prisma/dev.db
# or
npx prisma studio
```

## 🔑 Default Credentials

If you used the seed script, you might have:
- **Email**: admin@becof.tn
- **Password**: admin123

(Change these immediately in production!)

## 📧 Email Configuration

Make sure these environment variables are set in `.env.local`:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM="BECOF <noreply@becof.tn>"

# Base URL for invitation links
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 🐛 Troubleshooting

### Issue: "Unauthorized" when accessing Admin Management
**Solution**: Make sure you promoted yourself to Super Admin:
```bash
npm run promote:superadmin your-email@becof.tn
```

### Issue: Email not sending
**Solution**: Check your SMTP credentials in `.env.local`

### Issue: Invitation link expired
**Solution**: Super Admin can send a new invitation (old one becomes invalid)

### Issue: Cannot see Admin Management menu
**Solution**: Only Super Admins see this menu. Regular Admins don't have access.

### Issue: Build fails with memory error
**Solution**: Increase Node memory:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

## 🎯 What's Next?

You now have:
- ✅ Super Admin role system
- ✅ Admin invitation and management
- ✅ Full service CRUD operations
- ✅ Email notifications
- ✅ Secure token-based invitations

Start inviting your team members and managing your services! 🚀

## 📚 Further Reading

- `ADMIN_FEATURES.md` - Complete feature documentation
- `IMPLEMENTATION_SUMMARY.md` - Technical implementation details
- `DOCUMENTATION.md` - General project documentation
