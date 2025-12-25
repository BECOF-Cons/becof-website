# Google Calendar & Email Setup Guide

This guide will help you set up Google Calendar integration and email notifications for the BECOF website.

---

## 📧 Part 1: Gmail SMTP Setup (Email Notifications)

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Find "2-Step Verification" and enable it
3. Complete the setup process

### Step 2: Create App Password
1. After enabling 2FA, go to https://myaccount.google.com/apppasswords
2. Select "Mail" as the app
3. Select "Other" as the device and name it "BECOF Website"
4. Click "Generate"
5. **Copy the 16-character password** (format: xxxx xxxx xxxx xxxx)

### Step 3: Update .env.local
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="helmiboussetta11@gmail.com"
SMTP_PASSWORD="your-16-char-app-password-here"
EMAIL_FROM="BECOF <noreply@becof.tn>"
```

### Test Email
Run this in the browser console after booking an appointment to test:
```javascript
fetch('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test User',
    email: 'helmiboussetta11@gmail.com',
    subject: 'Test Email',
    message: 'Testing email notifications'
  })
})
```

---

## 📅 Part 2: Google Calendar API Setup

### Step 1: Create Google Cloud Project
1. Go to https://console.cloud.google.com/
2. Click "Select a project" → "New Project"
3. Name: "BECOF Website"
4. Click "Create"

### Step 2: Enable Google Calendar API
1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google Calendar API"
3. Click on it and press "Enable"

### Step 3: Configure OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" (unless you have a Google Workspace)
3. Click "Create"
4. Fill in:
   - App name: **BECOF Website**
   - User support email: **helmiboussetta11@gmail.com**
   - Developer contact: **helmiboussetta11@gmail.com**
5. Click "Save and Continue"
6. On Scopes page, click "Add or Remove Scopes"
7. Search for "calendar" and select:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
8. Click "Update" → "Save and Continue"
9. On Test users page, add: **helmiboussetta11@gmail.com**
10. Click "Save and Continue" → "Back to Dashboard"

### Step 4: Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: **Web application**
4. Name: **BECOF OAuth Client**
5. Authorized redirect URIs:
   - Add: `http://localhost:3000`
   - Add: `http://localhost:3000/api/auth/callback/google`
6. Click "Create"
7. **Save the Client ID and Client Secret** (you'll need them)

### Step 5: Get Refresh Token
1. Create a file `get-refresh-token.js` in your project root:

```javascript
const { google } = require('googleapis');
const readline = require('readline');

const oauth2Client = new google.auth.OAuth2(
  'YOUR_CLIENT_ID', // Replace with your Client ID
  'YOUR_CLIENT_SECRET', // Replace with your Client Secret
  'http://localhost:3000'
);

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent'
});

console.log('Authorize this app by visiting this url:', authUrl);
console.log('\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the code from that page here: ', (code) => {
  rl.close();
  oauth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Error retrieving access token', err);
    console.log('\nYour refresh token is:');
    console.log(token.refresh_token);
    console.log('\nAdd this to your .env.local file');
  });
});
```

2. Run it:
```bash
node get-refresh-token.js
```

3. Open the URL shown in your browser
4. Log in with **helmiboussetta11@gmail.com**
5. Click "Advanced" → "Go to BECOF Website (unsafe)" (it's safe, it's your app)
6. Click "Continue"
7. Copy the authorization code from the URL or page
8. Paste it in the terminal
9. **Copy the refresh token** shown

### Step 6: Update .env.local
```env
GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
GOOGLE_REFRESH_TOKEN="your-refresh-token-here"
```

---

## ✅ Testing

### Test Appointment with Calendar + Email:
1. Go to http://localhost:3000/appointment
2. Fill in the form with your details
3. Use **helmiboussetta11@gmail.com** as the email
4. Choose a date and time
5. Submit the form
6. Complete payment (use Bank Transfer for instant confirmation)

**You should receive:**
1. ✉️ Appointment confirmation email
2. ✉️ Payment confirmation email
3. 📅 Google Calendar invitation at helmiboussetta11@gmail.com
4. ✉️ Admin notification (if other admins exist)

**Check:**
- Your Gmail inbox for emails
- Google Calendar for the event
- Admin dashboard: http://localhost:3000/admin/appointments

---

## 🎯 What Each Integration Does

### Email Notifications:
1. **New Appointment** → Admins receive notification
2. **Payment Confirmed** → Client receives receipt
3. **Appointment Confirmed** → Client receives confirmation with details
4. **Appointment Cancelled** → Client receives cancellation notice
5. **Contact Form** → Admins receive message

### Google Calendar:
1. **Creates event** when appointment is booked
2. **Sends invitation** to client's email
3. **Sets reminders** (1 day before, 1 hour before)
4. **Creates Google Meet link** automatically
5. **Updates event** if appointment is rescheduled
6. **Deletes event** if appointment is cancelled

---

## 🚀 Production Setup

### For Production (.env):
```env
# Use your production domain
NEXTAUTH_URL="https://becof.tn"
NEXT_PUBLIC_SITE_URL="https://becof.tn"

# Gmail (same as dev)
SMTP_USER="helmiboussetta11@gmail.com"
SMTP_PASSWORD="your-app-password"
EMAIL_FROM="BECOF <noreply@becof.tn>"

# Google Calendar (same as dev)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_REFRESH_TOKEN="..."
```

### Update OAuth Redirect URIs:
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth client
3. Add production URLs:
   - `https://becof.tn`
   - `https://becof.tn/api/auth/callback/google`

---

## 🔧 Troubleshooting

### Emails Not Sending:
- Check SMTP password (no spaces, 16 characters)
- Verify 2FA is enabled on Gmail
- Check spam folder
- Look at terminal logs for errors

### Calendar Not Creating Events:
- Verify all 3 Google env variables are set
- Check refresh token is not expired (shouldn't expire)
- Verify Calendar API is enabled
- Check terminal logs for errors

### "Invalid grant" Error:
- Regenerate refresh token
- Make sure you used `access_type: 'offline'` and `prompt: 'consent'`

### Calendar Invite Not Received:
- Check if event was created in your Google Calendar
- Verify attendee email is correct
- Check spam folder
- Make sure `sendUpdates: 'all'` is in the code

### Admin Shows "⚠ Refresh Token Required" But It's Set:
- The admin UI now checks if `GOOGLE_REFRESH_TOKEN` exists in `.env.local`
- Restart your dev server after adding/changing environment variables
- If it still shows as required, verify the token is actually in `.env.local`

---

## 🔑 About Refresh Tokens

**Important:** Google refresh tokens **DO NOT expire** under normal circumstances!

### When You Need to Regenerate:
- ❌ You revoked the app's access in your Google Account settings
- ❌ You significantly changed OAuth consent screen settings
- ❌ You're seeing actual API errors like `invalid_grant` (this means the token is invalid)
- ❌ More than 6 months passed without using the token (rare)
- ❌ You changed the redirect URI in Google Cloud Console

### When You DON'T Need to Regenerate:
- ✅ Server restarts
- ✅ Code deployments
- ✅ Environment variable reloads
- ✅ Time passing (tokens don't expire by time)
- ✅ UI showing warnings (check if token is actually set)

### If You Get `invalid_grant` Error:
This error means your refresh token is no longer valid. You need to regenerate it:
1. Run `node get-refresh-token.js`
2. Visit the URL shown in your browser
3. Authorize the app
4. Copy the new refresh token
5. Update `GOOGLE_REFRESH_TOKEN` in `.env.local`
6. Restart your dev server

**Bottom line:** Generate the refresh token **once** and use it until you see an `invalid_grant` error, then regenerate.

---

## 📝 Notes

- **Gmail limits**: 500 emails/day for free Gmail accounts
- **Calendar limits**: Generally no practical limits for this use case
- **Time zone**: All events are created in "Africa/Tunis" timezone
- **Meeting links**: Google Meet links are auto-created for all events
- **Attendees**: Clients automatically receive calendar invites via email

---

## 🎉 Success!

Once configured, the system will:
- ✅ Send professional HTML emails to clients and admins
- ✅ Create Google Calendar events automatically
- ✅ Send calendar invitations to clients
- ✅ Include Google Meet links for virtual meetings
- ✅ Send reminders before appointments
- ✅ Keep everything synchronized

**Email templates** are professional with:
- BECOF branding (teal/purple gradient)
- Responsive HTML design
- Clear information
- Call-to-action buttons
- Footer with contact info
