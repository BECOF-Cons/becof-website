import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function testGoogleCalendar() {
  console.log('Testing Google Calendar Integration...\n');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Not set');
  console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✓ Set' : '✗ Not set');
  console.log('GOOGLE_REFRESH_TOKEN:', process.env.GOOGLE_REFRESH_TOKEN ? '✓ Set' : '✗ Not set');
  console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'Not set');
  console.log('');

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
    console.error('❌ Missing required Google Calendar environment variables');
    return;
  }

  try {
    // Initialize OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    console.log('✓ OAuth2 client initialized');
    console.log('Testing calendar access...\n');

    // Test: List calendar
    const calendarList = await calendar.calendarList.list();
    console.log('✓ Successfully connected to Google Calendar');
    console.log('Available calendars:', calendarList.data.items?.length || 0);
    console.log('');

    // Test: Create a test event
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 7); // 7 days from now
    const endDate = new Date(testDate);
    endDate.setHours(endDate.getHours() + 1);

    console.log('Creating test event...');
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: 'BECOF Test Event - Calendar Integration Check',
        description: 'This is a test event created by the BECOF calendar integration test script. You can delete this event.',
        start: {
          dateTime: testDate.toISOString(),
          timeZone: 'Africa/Tunis',
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: 'Africa/Tunis',
        },
        attendees: [
          {
            email: process.env.SMTP_USER || 'test@example.com',
            displayName: 'Test User',
            responseStatus: 'needsAction',
          },
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 60 },
          ],
        },
        conferenceData: {
          createRequest: {
            requestId: `becof-test-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
      conferenceDataVersion: 1,
      sendUpdates: 'all',
    });

    console.log('✅ Test event created successfully!');
    console.log('Event ID:', response.data.id);
    console.log('Event Link:', response.data.htmlLink);
    console.log('Meet Link:', response.data.hangoutLink);
    console.log('');
    console.log('🎉 Google Calendar integration is working correctly!');
    console.log('');
    console.log('Note: A test event has been created in your calendar.');
    console.log('You can delete it if you want.');

  } catch (error: any) {
    console.error('❌ Error testing Google Calendar:', error.message);
    if (error.code) {
      console.error('Error Code:', error.code);
    }
    if (error.errors) {
      console.error('Details:', error.errors);
    }
  }
}

testGoogleCalendar();
