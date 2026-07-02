import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET - Get single appointment
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        name: true,
        email: true,
        phone: true,
        date: true,
        time: true,
        serviceType: true,
        message: true,
        status: true,
        isOnline: true,
        cancelToken: true,
        createdAt: true,
        updatedAt: true,
        consultant: {
          select: {
            id: true,
            displayName: true,
            titleFr: true,
            photoUrl: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            paymentMethod: true,
            transactionId: true,
          },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointment' },
      { status: 500 }
    );
  }
}

// PATCH - Update appointment (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role as string;
    if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { status, notes, adminNotes, confirmPayment } = body;

    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        consultant: {
          select: {
            displayName: true,
            user: { select: { email: true } },
          },
        },
        payment: { select: { id: true, status: true } },
      },
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes && { notes }),
        ...(adminNotes && { adminNotes }),
      },
    });

    // Admin explicitly confirms payment received → mark payment COMPLETED + send emails
    if (confirmPayment && existingAppointment.payment?.id && existingAppointment.payment.status !== 'COMPLETED') {
      await prisma.payment.update({
        where: { id: existingAppointment.payment.id },
        data: { status: 'COMPLETED' },
      });

      // 1. Try Google Calendar API to create event + get Meet link
      let meetingLink: string | null = existingAppointment.meetingLink ?? null;
      let googleEventId: string | null = existingAppointment.googleEventId ?? null;

      if (!meetingLink) {
        if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
          try {
            const { createCalendarEvent } = await import('@/lib/google-calendar');

            // Get service duration
            const svc = await prisma.service.findFirst({
              where: { serviceType: existingAppointment.serviceType },
              select: { durationMinutes: true },
            });
            const durationMin = svc?.durationMinutes ?? 60;

            // Anchor the slot to Tunisia time (UTC+1) so it resolves to ONE
            // absolute instant, regardless of where the server runs. Each
            // attendee's calendar then renders it in their own local timezone.
            const dateStr = new Date(existingAppointment.date).toISOString().split('T')[0];
            const [hh, mm] = existingAppointment.time.split(':');
            const startTime = new Date(`${dateStr}T${hh.padStart(2, '0')}:${mm.padStart(2, '0')}:00+01:00`);
            const endTime = new Date(startTime.getTime() + durationMin * 60 * 1000);

            const consultantEmail = (existingAppointment.consultant as any)?.user?.email;
            const attendees = [
              { email: existingAppointment.email, name: existingAppointment.name },
              ...(consultantEmail ? [{ email: consultantEmail, name: existingAppointment.consultant?.displayName ?? '' }] : []),
            ];

            const result = await createCalendarEvent({
              summary: `Rendez-vous BECOF — ${existingAppointment.serviceType}`,
              description: `Client: ${existingAppointment.name}\nConsultant: ${existingAppointment.consultant?.displayName ?? ''}`,
              startTime,
              endTime,
              attendees,
            });

            if (result.meetLink) meetingLink = result.meetLink;
            if (result.eventId) googleEventId = result.eventId;
          } catch (err) {
            console.error('Google Calendar event creation failed:', err);
          }
        }

        // 2. No fallback — if Google Calendar API not configured, meetingLink stays null.
        //    The email will display "consultant will send the link before the appointment."

        // 3. Save meeting link + google event id to DB
        if (meetingLink || googleEventId) {
          await prisma.appointment.update({
            where: { id },
            data: {
              ...(meetingLink ? { meetingLink } : {}),
              ...(googleEventId ? { googleEventId } : {}),
            },
          });
        }
      }

      // 4. Send emails (client + consultant only — not all admins)
      if (process.env.RESEND_API_KEY) {
        const { sendAppointmentConfirmation, notifyConsultantOfAppointment } = await import('@/lib/email');
        const baseUrl = process.env.NEXTAUTH_URL || 'https://www.becofconseil.com';
        const cancelUrl = existingAppointment.cancelToken
          ? `${baseUrl}/fr/appointment/cancel?token=${existingAppointment.cancelToken}`
          : undefined;
        const modifyUrl = existingAppointment.cancelToken
          ? `${baseUrl}/fr/appointment/modify?token=${existingAppointment.cancelToken}`
          : undefined;

        const consultantEmail = (existingAppointment.consultant as any)?.user?.email;

        sendAppointmentConfirmation({
          clientName: existingAppointment.name,
          clientEmail: existingAppointment.email,
          date: existingAppointment.date,
          time: existingAppointment.time,
          serviceType: existingAppointment.serviceType,
          consultantName: existingAppointment.consultant?.displayName,
          consultantEmail: consultantEmail ?? undefined,
          cancelUrl,
          modifyUrl,
          meetingLink: meetingLink ?? undefined,
          appointmentId: existingAppointment.id,
        }).catch((err) => console.error('Error sending client confirmation:', err));

        if (consultantEmail && existingAppointment.consultant?.displayName) {
          notifyConsultantOfAppointment({
            consultantName: existingAppointment.consultant.displayName,
            consultantEmail,
            clientName: existingAppointment.name,
            clientEmail: existingAppointment.email,
            clientPhone: existingAppointment.phone,
            date: existingAppointment.date,
            time: existingAppointment.time,
            serviceType: existingAppointment.serviceType,
            message: existingAppointment.message ?? undefined,
            meetingLink: meetingLink ?? undefined,
            appointmentId: existingAppointment.id,
          }).catch((err) => console.error('Error sending consultant notification:', err));
        }
      }
    }

    // Update Google Calendar event if date changed
    if (body.date && existingAppointment.googleEventId) {
      if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_REFRESH_TOKEN) {
        const { updateCalendarEvent } = await import('@/lib/google-calendar');
        const newDate = new Date(body.date);
        const endTime = new Date(newDate);
        endTime.setHours(endTime.getHours() + 1);

        updateCalendarEvent(existingAppointment.googleEventId, {
          startTime: newDate,
          endTime: endTime,
        }).catch((err) => console.error('Error updating calendar event:', err));
      }
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel appointment
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Update status to cancelled
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    // Delete Google Calendar event
    if (appointment.googleEventId) {
      if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_REFRESH_TOKEN) {
        const { deleteCalendarEvent } = await import('@/lib/google-calendar');
        deleteCalendarEvent(appointment.googleEventId).catch((err) =>
          console.error('Error deleting calendar event:', err)
        );
      }
    }

    // Send cancellation notification
    if (process.env.RESEND_API_KEY) {
      const { sendCancellationNotification } = await import('@/lib/email');
      sendCancellationNotification({
        clientName: appointment.name,
        clientEmail: appointment.email,
        date: appointment.date,
        serviceType: appointment.serviceType,
      }).catch((err) => console.error('Error sending cancellation email:', err));
    }

    return NextResponse.json({
      message: 'Appointment cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return NextResponse.json(
      { error: 'Failed to cancel appointment' },
      { status: 500 }
    );
  }
}
