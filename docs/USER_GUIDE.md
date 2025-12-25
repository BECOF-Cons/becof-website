# BECOF Website - User Guide

## 🌐 Your Live Website

**Production URL:** https://becof-website-eq4wxpa5f-helmis-projects-e3f11f27.vercel.app

- **Homepage:** `/` (French & English)
- **Blog:** `/blog`
- **Services:** `/appointment`
- **Contact:** `/contact`
- **Admin Panel:** `/admin`

---

## 🔐 Admin Access

### Login as Administrator

1. Go to: `/admin/login`
2. Enter credentials:
   - **Email:** `admin@becof.tn`
   - **Password:** `Admin123!`
3. Click "Sign In"

**After login, you can:**
- Manage blog posts
- View appointments
- Manage services
- View payments
- Add other admins (SUPER_ADMIN only)

---

## 👥 User Management (SUPER_ADMIN Only)

### Add a New Admin

**Option 1: Manual Creation (Recommended when email is not configured)**

1. Login as SUPER_ADMIN
2. Go to: `/admin/users`
3. Click **"Add User"** button (if available)
4. Fill in the form:
   - **Name:** Full name of the admin
   - **Email:** Their email address
   - **Password:** Minimum 8 characters
   - **Role:** Choose:
     - `ADMIN` - Can manage content (blog, appointments)
     - `SUPER_ADMIN` - Full access + can add/remove users

5. Click **"Create User"**

**Option 2: Email Invitation (Requires SMTP configuration)**

1. Configure SMTP settings in Vercel (see Optional Configuration section)
2. Go to: `/admin/users`
3. Click **"Invite Admin"** button
4. Enter email and select role
5. They'll receive an invitation link to set up their account

**Note:** If email is not configured, you'll get an error when trying to send invitations. Use Option 1 instead.

### Role Differences

| Permission | ADMIN | SUPER_ADMIN |
|------------|-------|-------------|
| Manage blog posts | ✅ | ✅ |
| View appointments | ✅ | ✅ |
| Manage services | ✅ | ✅ |
| View payments | ✅ | ✅ |
| Add/remove users | ❌ | ✅ |

### Delete a User

1. Go to: `/admin/users`
2. Find the user in the table
3. Click the trash icon (🗑️) next to their name
4. Confirm deletion

**Note:** You cannot delete yourself!

---

## 📝 Blog Management

### Create a Blog Post

1. Login to admin panel
2. Go to: `/admin/blog`
3. Click **"Create New Post"**
4. Fill in **both languages** (French & English):
   - **Title EN/FR:** Post title
   - **Slug EN/FR:** URL-friendly version (e.g., `my-post-title`)
   - **Excerpt EN/FR:** Short summary (shows on blog list)
   - **Content EN/FR:** Full article (rich text editor)
   - **Category:** Choose from dropdown
   - **Cover Image:** Optional image URL
   - **Status:** 
     - `DRAFT` - Not visible to public
     - `PUBLISHED` - Visible on website

5. Click **"Publish"** or **"Save Draft"**

### Edit a Blog Post

1. Go to: `/admin/blog`
2. Click on the post you want to edit
3. Make changes
4. Click **"Update Post"**

### Delete a Blog Post

1. Go to: `/admin/blog`
2. Click the trash icon next to the post
3. Confirm deletion

---

## 📅 Appointment Management

### View Appointments

1. Login to admin panel
2. Go to: `/admin/appointments`
3. See all bookings with:
   - Student name & email
   - Service type
   - Preferred date/time
   - Status (Pending, Confirmed, Cancelled)

### Update Appointment Status

1. Click on an appointment
2. Change status:
   - **PENDING** - Waiting for confirmation
   - **CONFIRMED** - Approved by admin
   - **CANCELLED** - Rejected or cancelled

3. Add admin notes (optional)
4. Click **"Save"**

---

## 💰 Services & Pricing

### Edit Service Pricing

1. Login to admin panel
2. Go to: `/admin/services`
3. Click on a service
4. Update:
   - **Name EN/FR:** Service name
   - **Description EN/FR:** What's included
   - **Price:** Amount in TND (e.g., `150`, `200`, or `Sur devis`)
   - **Active:** Toggle to show/hide on website

5. Click **"Save Changes"**

---

## ⚙️ Optional Configuration

**📌 Important: Your site is fully functional without these optional settings!**

### What Works Without Optional Configuration:

✅ **Core Features (Always Work)**:
- Admin login and dashboard
- Blog post creation and management
- Appointment booking (saved to database)
- Service pricing management
- User management (manual user creation only)
- Contact form submissions (saved to database)

❌ **Features Requiring Optional Setup**:
- Email notifications (invitations, confirmations)
- Google Calendar integration
- Online payment processing
- Google OAuth login for admins

---

### Email Notifications (Optional)

**Without email configuration:**
- ❌ Cannot send admin invitations (create users manually via admin panel instead)
- ❌ No appointment confirmation emails sent to clients
- ❌ No contact form notifications sent to admins
- ✅ All data is still saved to database and visible in admin panel

**To enable email features**, add these to Vercel Environment Variables:

1. Go to Vercel → Your Project → Settings → Environment Variables
2. Add these variables:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
ADMIN_EMAIL=admin@becof.tn
```

**Get Gmail App Password:**
1. Go to: https://myaccount.google.com/apppasswords
2. Create new App Password
3. Copy the 16-character code
4. Use it as `SMTP_PASSWORD`

**After adding:** Redeploy your site on Vercel

---

### Google OAuth (Optional)

To enable Google login for admins:

1. Go to: https://console.cloud.google.com
2. Create OAuth Client ID
3. Add redirect URI: `https://your-site.vercel.app/api/auth/callback/google`
4. Add to Vercel Environment Variables:

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
```

**After adding:** Redeploy your site

---

### Google Calendar Integration (Optional)

To auto-create calendar events for appointments:

1. Complete Google OAuth setup (above)
2. Run `scripts/get-refresh-token.js` to get refresh token
3. Add to Vercel Environment Variables:

```bash
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
GOOGLE_REFRESH_TOKEN=1//your-refresh-token
```

**After adding:** Redeploy your site

---

### Payment Gateway Integration (Optional)

To enable online payments (Konnect, Flouci, D17):

1. Get API credentials from payment provider
2. Add to Vercel Environment Variables:

**Konnect:**
```bash
KONNECT_API_KEY=your-api-key
KONNECT_WALLET_ID=your-wallet-id
```

**Flouci:**
```bash
FLOUCI_APP_TOKEN=your-token
FLOUCI_APP_SECRET=your-secret
```

**D17:**
```bash
D17_API_KEY=your-api-key
D17_MERCHANT_ID=your-merchant-id
```

**After adding:** Redeploy your site

---

## 🚀 Deploying Changes

When you add environment variables:

1. Go to Vercel → Your Project
2. Go to **Deployments** tab
3. Click **"Redeploy"** on latest deployment
4. Wait for build to complete (~2 minutes)

---

## 🆘 Troubleshooting

### Cannot Login to /admin

- **Check:** Are you using the correct email/password?
  - Email: `admin@becof.tn`
  - Password: `Admin123!` (with capital A and exclamation mark)
- **Try:** Clear browser cookies and cache
- **Reset password:** Contact your database administrator

### Blog Creation Shows "Unauthorized"

- **Check:** Are you logged in as admin or super admin?
- **Fix:** Logout and login again, ensure your session is active

### Admin Invitation Fails with "Internal server error"

- **Cause:** Email (SMTP) is not configured
- **Fix:** Either:
  - Configure SMTP settings (see Optional Configuration section)
  - OR create users manually via admin panel without email invitations

### Blog Page Shows Error

- **Check:** Is there at least one published blog post?
- **Fix:** Create a blog post via `/admin/blog`

### Services Not Showing

- **Check:** Are services marked as "Active"?
- **Fix:** Go to `/admin/services` and toggle active status

### Appointment Confirmations Not Sent

- **Cause:** Email (SMTP) is not configured
- **Impact:** Appointments are still saved and visible in admin panel
- **Fix:** Configure SMTP settings to enable email notifications

### Email Not Sending

- **Check:** Are SMTP environment variables set in Vercel?
- **Check:** Is Gmail App Password correct (not regular password)?
- **Fix:** Verify settings and redeploy

---

## 📋 Feature Status

### ✅ Always Working (No Configuration Needed):
- **Admin Panel**: Login, dashboard, navigation
- **Blog Management**: Create, edit, delete, publish posts
- **Appointment Management**: View, update status, add notes
- **Service Management**: Edit pricing, descriptions, active status
- **User Management**: View admins, delete users, create users manually
- **Contact Form**: Submissions saved to database
- **Public Website**: Homepage, blog, services, contact pages

### 🔧 Requires Optional Configuration:
- **Email Invitations**: Requires SMTP settings
- **Appointment Emails**: Requires SMTP settings
- **Contact Form Emails**: Requires SMTP settings
- **Google Calendar**: Requires Google OAuth + Calendar API
- **Online Payments**: Requires payment gateway API keys (Konnect/Flouci/D17)
- **Google OAuth Login**: Requires Google Cloud credentials

---

## 📞 Quick Links

- **Live Site:** https://becof-website-eq4wxpa5f-helmis-projects-e3f11f27.vercel.app
- **Admin Login:** https://becof-website-eq4wxpa5f-helmis-projects-e3f11f27.vercel.app/admin/login
- **Vercel Dashboard:** https://vercel.com
- **GitHub Repo:** https://github.com/BECOF-Cons/becof-website

---

## 🔒 Security Tips

1. **Change default password** immediately after first login
2. **Use strong passwords** (minimum 12 characters, mixed case, numbers, symbols)
3. **Don't share credentials** - create separate accounts for each admin
4. **Regular backups** - Export database periodically via Neon dashboard
5. **Monitor activity** - Check `/admin/appointments` and `/admin/payments` regularly

---

## 📊 Current Setup

Your website is configured with:

- ✅ **7 Services** - Orientation, Counseling, Coaching, Workshop, etc.
- ✅ **1 SUPER_ADMIN** - admin@becof.tn
- ✅ **1 Blog Post** - Welcome to BECOF
- ✅ **Database** - PostgreSQL (Neon.tech)
- ✅ **Hosting** - Vercel

**Everything is ready to use!** 🎉
