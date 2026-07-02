/**
 * One-time helper to (re)generate a Google Calendar refresh token.
 *
 * Prerequisites:
 *   1. The Next.js dev server must be running (npm run dev) so the
 *      /oauth-callback page can display the authorization code.
 *   2. GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env
 *   3. In Google Cloud Console → Credentials → your OAuth client,
 *      "Authorized redirect URIs" must include:
 *        http://localhost:3000/oauth-callback
 *
 * Run:  node scripts/get-google-refresh-token.js
 */

require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const { google } = require('googleapis');
const readline = require('readline');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/oauth-callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('\n❌ GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing in .env / .env.local\n');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent', // force a fresh refresh_token every time
});

console.log('\n────────────────────────────────────────────────────────');
console.log('STEP 1 — Open this URL in your browser and authorize:');
console.log('────────────────────────────────────────────────────────\n');
console.log(authUrl);
console.log('\n(Log in with the account whose calendar should hold the events.)');
console.log('If you see "unverified app", click Advanced → Go to BECOF (unsafe) — it is your own app.\n');
console.log('After authorizing you will land on the /oauth-callback page which shows a CODE.\n');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('STEP 2 — Paste the code here (raw from URL is fine, it will be decoded): ', async (rawCode) => {
  rl.close();
  // Accept either a full URL, or the code param (URL-encoded or not)
  let code = rawCode.trim();
  if (code.includes('code=')) {
    code = code.split('code=')[1].split('&')[0];
  }
  code = decodeURIComponent(code);
  try {
    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens.refresh_token) {
      console.error('\n⚠️ No refresh_token returned. Revoke access at https://myaccount.google.com/permissions and retry.\n');
      process.exit(1);
    }
    console.log('\n✅ SUCCESS! Your new refresh token:\n');
    console.log(tokens.refresh_token);
    console.log('\n────────────────────────────────────────────────────────');
    console.log('Update GOOGLE_REFRESH_TOKEN in BOTH:');
    console.log('  • .env (local testing)');
    console.log('  • Vercel → Settings → Environment Variables (production)');
    console.log('────────────────────────────────────────────────────────\n');
  } catch (err) {
    console.error('\n❌ Error exchanging code:', err.message);
    console.error('If "redirect_uri_mismatch": add http://localhost:3000/oauth-callback to your OAuth client redirect URIs.\n');
    process.exit(1);
  }
});
