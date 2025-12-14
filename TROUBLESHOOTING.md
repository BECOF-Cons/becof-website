# Troubleshooting Guide

## Common Issues and Solutions

### 1. Google OAuth Error: "401: invalid_client"

**Problem**: When running `node get-refresh-token.js`, you get "Access blocked: Authorization Error 401: invalid_client"

**Solution**: The script now automatically loads credentials from `.env.local`. Make sure:
1. Your `.env.local` file has the correct `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
2. The redirect URI in Google Cloud Console is exactly: `http://localhost:3000`
3. Run the script: `node get-refresh-token.js`

**How to verify credentials**:
```bash
# Check if credentials are set
cat .env.local | grep GOOGLE_CLIENT
```

---

### 2. Appointment Booking Fails with "Error booking appointment"

**Problem**: Form submission fails when trying to book an appointment

**Possible Causes & Solutions**:

#### A. Google Calendar Not Configured (Safe - Booking still works)
- **Symptom**: Console shows "Google Calendar not configured, skipping event creation"
- **Impact**: Appointment is created but no calendar event is added
- **Solution**: This is OK! Complete the Google Calendar setup when ready
- **To Fix**: Follow `GOOGLE_SETUP.md` to get OAuth credentials

#### B. Email Configuration Missing (Safe - Booking still works)
- **Symptom**: Console shows "Email not configured, skipping admin notification"
- **Impact**: Appointment is created but no email notifications sent
- **Solution**: This is OK! Add Gmail app password when ready
- **To Fix**: Follow `GOOGLE_SETUP.md` Part 1 for Gmail setup

#### C. Database Connection Error (Critical)
- **Symptom**: "System error: No admin user found"
- **Impact**: Booking fails completely
- **Solution**: 
  ```bash
  npx prisma generate
  npx prisma db push
  npx prisma db seed
  ```

#### D. Invalid Date/Time Format
- **Symptom**: Validation error in API response
- **Solution**: Make sure date is in `YYYY-MM-DD` format and time in `HH:MM` format

---

### 3. Fetch API Error: "URL scheme 'chrome' is not supported"

**Problem**: Running fetch in browser console on `chrome://new-tab-page/` gives protocol error

**Solution**: Use the full URL when testing from console:
```javascript
// ❌ Wrong - relative URL doesn't work on chrome:// pages
fetch('/api/contact', { ... })

// ✅ Correct - use full URL
fetch('http://localhost:3000/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    subject: 'Test',
    message: 'Testing'
  })
})
```

**Better**: Navigate to your actual site first, then test from there:
1. Go to `http://localhost:3000`
2. Open console (F12)
3. Run fetch with relative URL `/api/contact`

---

### 4. Missing Environment Variables

**Problem**: Features don't work or error messages about missing config

**Solution**: Check your `.env.local` has all required keys from `.env.example`:

```bash
# Compare files
diff <(grep -o '^[A-Z_]*=' .env.example | sort) <(grep -o '^[A-Z_]*=' .env.local | sort)
```

**Required Keys**:
- `DATABASE_URL` - Database connection (required)
- `NEXTAUTH_SECRET` - Auth secret (required)
- `AUTH_SECRET` - Auth secret (required)

**Optional Keys** (features work without them):
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` - Calendar integration
- `SMTP_USER`, `SMTP_PASSWORD` - Email notifications
- `KONNECT_API_KEY`, `FLOUCI_APP_TOKEN`, `D17_API_KEY` - Payment gateways

---

### 5. Development Server Issues

**Problem**: Changes not reflecting or server errors

**Solutions**:

#### A. Hard Restart
```bash
# Kill all Node processes on port 3000
lsof -ti:3000 | xargs kill -9

# Clear Next.js cache
rm -rf .next

# Restart
npm run dev
```

#### B. Database Schema Issues
```bash
# Regenerate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push
```

#### C. TypeScript Errors
```bash
# Check for errors
npx tsc --noEmit

# Common fix: reinstall types
npm install --save-dev @types/node @types/react
```

---

### 6. Email Notifications Not Sending

**Problem**: Appointments created but no emails received

**Diagnosis**:
1. Check server console for "Email not configured" message
2. Check Gmail app password is correct (16 characters, no spaces)
3. Check 2FA is enabled on Gmail account

**Solutions**:

#### A. Test Email Configuration
```javascript
// In browser console on http://localhost:3000
fetch('http://localhost:3000/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test',
    email: 'your-email@gmail.com',
    subject: 'Test',
    message: 'Testing email'
  })
}).then(r => r.json()).then(console.log)
```

#### B. Verify Gmail Settings
- 2FA must be enabled: https://myaccount.google.com/security
- App password generated: https://myaccount.google.com/apppasswords
- Use the 16-character password (remove spaces)

#### C. Check SMTP Configuration
```bash
# Verify SMTP settings in .env.local
cat .env.local | grep SMTP
```

Should be:
```
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="helmiboussetta11@gmail.com"
SMTP_PASSWORD="xxxx xxxx xxxx xxxx"
```

---

### 7. Calendar Events Not Creating

**Problem**: Appointments work but no calendar events

**Solutions**:

#### A. Check Configuration
```bash
# All three must be set
cat .env.local | grep GOOGLE_
```

#### B. Test Refresh Token
```bash
node get-refresh-token.js
# Follow the OAuth flow
# Copy the refresh token to .env.local
```

#### C. Verify API is Enabled
1. Go to Google Cloud Console
2. APIs & Services → Enabled APIs
3. Confirm "Google Calendar API" is enabled

---

### 8. Payment Gateway Errors

**Problem**: Payment methods show errors or don't work

**Expected Behavior**:
- **Bank Transfer**: Works immediately (no API needed)
- **Konnect/Flouci/D17**: Need API keys from providers

**Setup Status**:
- ✅ Bank Transfer - Ready to use
- 🟡 Konnect - Add API keys to `.env.local`
- 🟡 Flouci - Add API keys to `.env.local`
- 🟡 D17 - Add API keys to `.env.local`

**To Test Bank Transfer**:
1. Book appointment at `/appointment`
2. Select "Bank Transfer" on payment page
3. See bank account details displayed
4. Appointment marked as PENDING
5. Admin can confirm after verifying transfer

---

## Quick Checks

### Is Everything Working?

Run this checklist:

1. **Database**: `npx prisma studio` - Should open admin interface
2. **Dev Server**: Navigate to `http://localhost:3000` - Should load homepage
3. **Admin Login**: Go to `/admin` - Login with `admin@becof.tn` / `admin123`
4. **Book Appointment**: Go to `/appointment` - Fill form, should create appointment
5. **View Appointments**: Go to `/admin/appointments` - Should see your test appointment

### Check Logs

```bash
# Watch server logs
npm run dev

# Look for these messages:
# ✅ "Google Calendar not configured, skipping event creation" - OK, calendar optional
# ✅ "Email not configured, skipping admin notification" - OK, email optional
# ❌ "Error creating appointment" - Problem, check database
# ❌ "System error: No admin user found" - Run prisma db seed
```

---

## Getting Help

If you're still stuck:

1. **Check Console Logs**: Look for error messages in terminal running `npm run dev`
2. **Check Browser Console**: Press F12, look for errors
3. **Check Database**: Run `npx prisma studio` to view data
4. **Check .env.local**: Compare with `.env.example` to ensure all keys present
5. **Restart Everything**: Kill server, clear cache, restart

**Key Files to Check**:
- `.env.local` - Configuration
- `prisma/dev.db` - Database file
- `app/api/appointments/route.ts` - Appointment API
- `lib/google-calendar.ts` - Calendar integration
- `lib/email.ts` - Email notifications
