# 🧪 BECOF Website - Testing Guide

## ✅ The CSS Error is Fixed!

The website should now load successfully at:
- **French**: http://localhost:3000
- **English**: http://localhost:3000/en

---

## 📱 What You Can Test RIGHT NOW

### 1. Homepage - Visual & Design
**URL:** `http://localhost:3000`

✅ **Test Checklist:**
- [ ] Hero section loads with animated gradient blobs
- [ ] "BECOF" logo appears in navigation
- [ ] Main heading and subtitle are visible
- [ ] Two CTA buttons work (try clicking them)
- [ ] Statistics show: 500+, 50+, 95%
- [ ] Scroll indicator animates at bottom
- [ ] Features section displays 3 cards
- [ ] Stats section has gradient background
- [ ] Blog preview shows 3 posts
- [ ] Final CTA section visible
- [ ] Footer contains links and social icons

### 2. Navigation & Language
**Actions to Test:**

✅ **Navigation Bar:**
- [ ] Click "Home" → Should stay on homepage
- [ ] Click "Blog" → Goes to `/blog` (will show error - not built yet)
- [ ] Click "Services" → Goes to `/services` (not built yet)
- [ ] Click "About" → Goes to `/about` (not built yet)
- [ ] Click "Contact" → Goes to `/contact` (not built yet)
- [ ] Click "Book Appointment" button → Goes to `/appointment` (not built yet)

✅ **Language Switcher:**
- [ ] Click "EN" in top right → Switches to English
- [ ] URL changes to `/en`
- [ ] All text changes to English
- [ ] Click "FR" → Switches back to French
- [ ] URL changes to `/fr` or just `/`

### 3. Mobile Responsiveness
**How to Test:**

**Option A: Resize Browser**
1. Press `F12` or `Cmd+Option+I` (Mac)
2. Click device toolbar icon (phone/tablet icon)
3. Select "iPhone 14 Pro" or "iPad"
4. Check layout

**Option B: On Real Mobile Device**
1. Find your computer's IP:
   ```bash
   # On Mac:
   ipconfig getifaddr en0
   
   # On Windows:
   ipconfig
   ```
2. On your phone, open: `http://YOUR_IP:3000`

✅ **Mobile Checklist:**
- [ ] Hamburger menu (☰) appears on small screens
- [ ] Clicking hamburger opens full menu
- [ ] All links work in mobile menu
- [ ] Hero section scales properly
- [ ] Images/sections stack vertically
- [ ] Text remains readable
- [ ] Buttons are tappable (not too small)
- [ ] Footer layout adjusts for mobile

### 4. Animations & Interactions
✅ **Test These:**
- [ ] Hover over navigation links → Color changes
- [ ] Hover over CTA buttons → Scales up slightly
- [ ] Scroll down → Animated blobs move
- [ ] Scroll indicator bounces
- [ ] Feature cards have hover effects
- [ ] Blog post cards scale on hover
- [ ] Social icons in footer change color on hover

### 5. Performance Check
✅ **Test:**
- [ ] Page loads in under 3 seconds
- [ ] Animations are smooth (not laggy)
- [ ] No console errors (press F12, check Console tab)
- [ ] Images load properly
- [ ] No broken links visible

---

## ⚠️ Expected "Not Found" Pages

These pages DON'T exist yet - you'll see 404 errors:
- `/blog` - Blog listing (not built)
- `/blog/[id]` - Individual blog posts (not built)
- `/services` - Services page (not built)
- `/about` - About page (not built)
- `/contact` - Contact page (not built)
- `/appointment` - Booking form (not built)
- `/admin` - Admin dashboard (not built)

**This is NORMAL** - we've only built the homepage so far!

---

## 🔍 How to Check for Errors

### Browser Console
1. Open website: `http://localhost:3000`
2. Press `F12` (Windows) or `Cmd+Option+I` (Mac)
3. Click "Console" tab
4. Check for red errors

**Expected:** No errors (maybe some warnings about missing pages)

### Terminal
Look at the terminal where `npm run dev` is running:
- **Green checkmarks (✓)**: Good!
- **Red errors (✗)**: Problem!
- **Yellow warnings (⚠)**: Usually okay

---

## 📸 Take Screenshots for Client

**What to Capture:**

1. **Homepage - Desktop**
   - Full page scroll
   - Hero section
   - Features
   - Blog preview

2. **Homepage - Mobile**
   - Take screenshot on phone
   - Show hamburger menu open
   - Show language switcher

3. **Both Languages**
   - Homepage in French
   - Homepage in English

---

## 💳 Payment Testing (When We Build It)

### Sandbox/Test Mode Setup

#### 1. Konnect (Paymee) Testing
```javascript
// Test credentials (you'll get from Konnect):
KONNECT_API_URL=https://api.preprod.konnect.network
KONNECT_TEST_WALLET_ID=your-test-wallet
KONNECT_TEST_API_KEY=your-test-key

// Test card numbers (provided by Konnect):
Card: 4000 0000 0000 0002 (Success)
Card: 4000 0000 0000 0069 (Declined)
CVV: 123
Expiry: 12/26
```

#### 2. Flouci Testing
```javascript
// Sandbox URL:
FLOUCI_API_URL=https://developers.flouci.com/api
FLOUCI_TEST_TOKEN=your-test-token

// Test phone numbers:
+216 XX XXX XXX (they provide test numbers)

// Test amounts work without real money
```

#### 3. D17 Testing
```javascript
// Test environment credentials:
D17_TEST_URL=https://test.d17.com.tn
D17_TEST_MERCHANT_ID=your-test-id
D17_TEST_API_KEY=your-test-key

// Test cards (D17 provides):
Card: 4111 1111 1111 1111
CVV: 123
```

#### 4. Bank Transfer Testing
```
// No API needed
// Process:
1. Student enters transfer details
2. Uploads fake receipt (JPG/PDF)
3. Admin approves manually in dashboard
4. Appointment confirmed

// For testing: Use any image as "receipt"
```

### How to Test Payments

**Step 1: Enable Test Mode**
```env
# In .env.local
PAYMENT_MODE=sandbox
```

**Step 2: Test Flow**
1. Go to appointment booking
2. Select service
3. Choose date/time
4. Proceed to payment
5. Select payment method
6. Use TEST credentials above
7. Complete payment
8. Check if appointment is confirmed

**Step 3: Verify**
- Check admin dashboard for payment record
- Verify webhook received (check logs)
- Ensure no real money charged!

---

## 🎯 What Each Payment Method Needs

### Before Going Live:

#### Konnect Account
1. Register at: https://konnect.network/merchant
2. Complete KYC (business verification)
3. Get approved (~3-5 days)
4. Receive production API keys
5. Configure webhook URL

**Documents Needed:**
- Business registration
- ID card
- Bank account (RIB)

#### Flouci Account
1. Register at: https://www.flouci.com/business
2. Submit documents
3. Wait for approval (~2-3 days)
4. Get production credentials
5. Test with small amount

**Documents Needed:**
- Business license
- Tax ID
- Bank details

#### D17 Account
1. Contact D17: support@d17.com.tn
2. Schedule meeting
3. Sign merchant agreement
4. Receive credentials
5. Integration testing

**Documents Needed:**
- Commercial register
- Bank information
- ID documents

#### Bank Transfer
**No Account Needed!**
Just provide:
- Bank name
- Account number (RIB)
- Account holder name

---

## 🔐 Payment Account Configuration

### In Admin Dashboard (When Built):

```
/admin/settings/payments

Client will enter:
├── Konnect
│   ├── Wallet ID: __________
│   ├── API Key: ************
│   └── Test Mode: ☑️ / ☐
│
├── Flouci
│   ├── App Token: __________
│   ├── App Secret: ************
│   └── Test Mode: ☑️ / ☐
│
├── D17
│   ├── Merchant ID: __________
│   ├── API Key: ************
│   └── Test Mode: ☑️ / ☐
│
└── Bank Transfer
    ├── Bank: BIAT
    ├── RIB: TN59XXXXXXXXXXXXXXXX
    ├── Holder: BECOF SARL
    └── Instructions: [Custom text]
```

### Payment Flow for Client

```
Student Makes Payment
    ↓
Payment Gateway Processes
    ↓
Webhook Notifies Website
    ↓
Money Goes to Client's Account
    ↓
Appointment Auto-Confirmed
    ↓
Client Gets Email Notification
    ↓
Money Available in:
├─ Konnect Wallet (instant withdrawal to bank)
├─ Flouci Account (transfer to bank in 2-3 days)
├─ Bank Account via D17 (2-3 business days)
└─ Bank Account direct (immediate)
```

---

## 🎯 Testing Priorities by Phase

### Phase 1 (NOW): Homepage
✅ Visual design
✅ Responsiveness  
✅ Language switching
✅ Navigation links

### Phase 2: Admin Dashboard
- Login/logout
- Create blog post
- Upload images
- Edit/delete content

### Phase 3: Blog
- List all posts
- View single post
- Search/filter
- Categories

### Phase 4: Appointments
- Fill booking form
- Select date/time
- Submit appointment
- Receive confirmation

### Phase 5: Payments
- Choose payment method
- Complete test transaction
- Verify webhook
- Check admin dashboard

---

## 🐛 Common Issues & Fixes

### Issue: "Cannot apply unknown utility class"
**Fix:** Already fixed! Restart server if you still see it.

### Issue: Page shows 404
**Reason:** That page isn't built yet. Normal!

### Issue: Slow loading
**Check:** 
- Internet connection
- Close other applications
- Restart dev server

### Issue: Images not loading
**Check:**
- Images in `public/` folder
- Correct file paths
- File extensions (jpg, png, svg)

### Issue: Language not switching
**Check:**
- Click the EN/FR button
- URL should change
- Clear browser cache (Cmd+Shift+R)

---

## 📊 Performance Benchmarks

**Target Metrics:**
- First Load: < 2 seconds
- Page Weight: < 500 KB
- Lighthouse Score: 90+

**How to Test:**
1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Click "Generate report"
4. Check scores for:
   - Performance
   - Accessibility
   - Best Practices
   - SEO

---

## ✅ Sign-Off Checklist (Before Showing Client)

- [ ] Homepage loads without errors
- [ ] Both languages work (FR/EN)
- [ ] Mobile layout looks good
- [ ] All animations work smoothly
- [ ] No console errors
- [ ] Navigation links present (even if pages don't exist)
- [ ] Footer information correct
- [ ] Screenshots taken
- [ ] Ready to demo!

---

## 🎉 You're Ready!

**The website should now be working perfectly for Phase 1!**

**Next Steps:**
1. Test everything above
2. Take screenshots
3. Show to client
4. Get feedback
5. Decide which phase to build next

**Questions?** Let me know what you'd like to work on next!
