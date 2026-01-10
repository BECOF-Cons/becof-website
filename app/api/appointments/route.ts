import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const appointmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  service: z.string().min(1, 'Service is required'),
  message: z.string().optional(),
});

// Map frontend service values to database enum values
const serviceTypeMap: Record<string, string> = {
  orientation: 'ORIENTATION_SESSION',
  career: 'CAREER_COUNSELING',
  university: 'UNIVERSITY_SELECTION',
  abroad: 'UNIVERSITY_SELECTION', // Map to closest existing value
  other: 'FOLLOW_UP_SESSION', // Map to closest existing value
  // Also accept the enum values directly (for when frontend sends enum values)
  ORIENTATION_SESSION: 'ORIENTATION_SESSION',
  CAREER_COUNSELING: 'CAREER_COUNSELING',
  CAREER_COACHING: 'CAREER_COACHING',
  GROUP_WORKSHOP: 'GROUP_WORKSHOP',
  UNIVERSITY_SELECTION: 'UNIVERSITY_SELECTION',
  FOLLOW_UP_SESSION: 'FOLLOW_UP_SESSION',
};

// POST - Create new appointment
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Received appointment booking request:', body);
    const validatedData = appointmentSchema.parse(body);

    // Combine date and time into datetime
    const appointmentDate = new Date(`${validatedData.date}T${validatedData.time}:00`);

    // Check if slot is already taken
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        date: appointmentDate,
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    });

    if (existingAppointment) {
      return NextResponse.json(
        { error: 'This time slot is already booked' },
        { status: 400 }
      );
    }

    // Create appointment (using temp userId - will be updated when auth is required)
    // For now, get the first admin user as a placeholder
    const adminUser = await prisma.user.findFirst({
      where: { 
        role: {
          in: ['ADMIN', 'SUPER_ADMIN']
        }
      },
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: 'System error: No admin user found' },
        { status: 500 }
      );
    }

    // Map service type to database enum
    const mappedServiceType = serviceTypeMap[validatedData.service] || validatedData.service;

    // Fetch pricing from Service table
    const service = await prisma.service.findFirst({
      where: {
        serviceType: mappedServiceType,
        active: true,
      },
    });

    // Parse price from service (remove 'TND' and convert to number)
    let servicePrice = 150; // Default fallback
    if (service) {
      const priceString = service.price.replace(/\s*TND\s*/i, '').trim();
      const parsedPrice = parseFloat(priceString);
      if (!isNaN(parsedPrice)) {
        servicePrice = parsedPrice;
      }
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId: adminUser.id, // Placeholder - in production, this would be the client's user ID
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        date: appointmentDate,
        time: validatedData.time,
        serviceType: mappedServiceType as any,
        message: validatedData.message || '',
        status: 'PENDING',
        payment: {
          create: {
            userId: adminUser.id,
            amount: servicePrice.toString(),
            currency: 'TND',
            status: 'PENDING',
          },
        },
      },
      include: {
        payment: true,
      },
    });

    // Create Google Calendar event (async, don't wait) - OPTIONAL
    try {
      if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
        const { createCalendarEvent } = await import('@/lib/google-calendar');
        const endTime = new Date(appointmentDate);
        endTime.setHours(endTime.getHours() + 1); // 1 hour appointment

        createCalendarEvent({
          summary: `BECOF - ${validatedData.service} - ${validatedData.name}`,
          description: `Consultation with ${validatedData.name}\n\nService: ${validatedData.service}\nEmail: ${validatedData.email}\nPhone: ${validatedData.phone}\n\nNotes: ${validatedData.message || 'N/A'}`,
          startTime: appointmentDate,
          endTime: endTime,
          attendeeEmail: validatedData.email,
          attendeeName: validatedData.name,
        })
          .then((eventId) => {
            if (eventId) {
              // Store calendar event ID in appointment
              prisma.appointment
                .update({
                  where: { id: appointment.id },
                  data: { googleEventId: eventId },
                })
                .catch((err) => console.error('Error storing calendar event ID:', err));
            }
          })
          .catch((err) => console.error('Error creating calendar event (non-critical):', err));
      } else {
        console.log('Google Calendar not configured, skipping event creation');
      }
    } catch (calendarError) {
      // Calendar errors should not block appointment creation
      console.error('Calendar integration error (non-critical):', calendarError);
    }

    // Send notification to admins (async, don't wait) - OPTIONAL
    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
        const { notifyAdminsOfAppointment } = await import('@/lib/email');
        notifyAdminsOfAppointment({
          id: appointment.id,
          clientName: validatedData.name,
          clientEmail: validatedData.email,
          clientPhone: validatedData.phone,
          date: appointmentDate,
          serviceType: mappedServiceType,
          notes: validatedData.message,
        }).catch((err) => console.error('Error sending admin notification (non-critical):', err));
      } else {
        console.log('Email not configured, skipping admin notification');
      }
    } catch (emailError) {
      // Email errors should not block appointment creation
      console.error('Email notification error (non-critical):', emailError);
    }

    return NextResponse.json(
      {
        message: 'Appointment booked successfully',
        appointmentId: appointment.id,
        appointment,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.issues);
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating appointment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create appointment';
    return NextResponse.json(
      { error: errorMessage, details: process.env.NODE_ENV === 'development' ? String(error) : undefined },
      { status: 500 }
    );
  }
}

// GET - List appointments (admin only - add auth later)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const appointments = await prisma.appointment.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}
