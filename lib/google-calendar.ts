import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// Check if Google Calendar is configured
function isGoogleCalendarConfigured(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && 
            process.env.GOOGLE_CLIENT_SECRET && 
            process.env.GOOGLE_REFRESH_TOKEN);
}

// Initialize OAuth2 client only if configured
let oauth2Client: any = null;
let calendar: any = null;

if (isGoogleCalendarConfigured()) {
  oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  calendar = google.calendar({ version: 'v3', auth: oauth2Client });
}

export interface CalendarEvent {
  summary: string;
  description: string;
  startTime: Date;
  endTime: Date;
  attendeeEmail: string;
  attendeeName: string;
}

export async function createCalendarEvent(event: CalendarEvent): Promise<string | null> {
  if (!isGoogleCalendarConfigured() || !calendar) {
    console.log('Google Calendar not configured, skipping event creation');
    return null;
  }

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: {
          dateTime: event.startTime.toISOString(),
          timeZone: 'Africa/Tunis',
        },
        end: {
          dateTime: event.endTime.toISOString(),
          timeZone: 'Africa/Tunis',
        },
        attendees: [
          {
            email: event.attendeeEmail,
            displayName: event.attendeeName,
            responseStatus: 'needsAction',
          },
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 60 }, // 1 hour before
          ],
        },
        conferenceData: {
          createRequest: {
            requestId: `becof-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
      conferenceDataVersion: 1,
      sendUpdates: 'all', // Send email invites
    });

    console.log('Calendar event created:', response.data.id);
    return response.data.id || null;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return null;
  }
}

export async function updateCalendarEvent(
  eventId: string,
  updates: Partial<CalendarEvent>
): Promise<boolean> {
  try {
    const event = await calendar.events.get({
      calendarId: 'primary',
      eventId: eventId,
    });

    await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: {
        ...event.data,
        ...(updates.summary && { summary: updates.summary }),
        ...(updates.description && { description: updates.description }),
        ...(updates.startTime && {
          start: {
            dateTime: updates.startTime.toISOString(),
            timeZone: 'Africa/Tunis',
          },
        }),
        ...(updates.endTime && {
          end: {
            dateTime: updates.endTime.toISOString(),
            timeZone: 'Africa/Tunis',
          },
        }),
      },
      sendUpdates: 'all',
    });

    console.log('Calendar event updated:', eventId);
    return true;
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return false;
  }
}

export async function deleteCalendarEvent(eventId: string): Promise<boolean> {
  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
      sendUpdates: 'all', // Notify attendees
    });

    console.log('Calendar event deleted:', eventId);
    return true;
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return false;
  }
}

export async function getCalendarEvent(eventId: string) {
  try {
    const response = await calendar.events.get({
      calendarId: 'primary',
      eventId: eventId,
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching calendar event:', error);
    return null;
  }
}
