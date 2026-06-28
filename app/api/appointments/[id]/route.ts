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
        consultant: { select: { displayName: true } },
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

    // Admin explicitly confirms payment received → mark payment COMPLETED + send email
    if (confirmPayment && existingAppointment.payment?.id && existingAppointment.payment.status !== 'COMPLETED') {
      await prisma.payment.update({
        where: { id: existingAppointment.payment.id },
        data: { status: 'COMPLETED' },
      });

      if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
        const { sendAppointmentConfirmation, notifyAdminsOfAppointment } = await import('@/lib/email');
        const baseUrl = process.env.NEXTAUTH_URL || 'https://becof-website.vercel.app';
        const cancelUrl = existingAppointment.cancelToken
          ? `${baseUrl}/fr/appointment/cancel?token=${existingAppointment.cancelToken}`
          : undefined;

        sendAppointmentConfirmation({
          clientName: existingAppointment.name,
          clientEmail: existingAppointment.email,
          date: existingAppointment.date,
          serviceType: existingAppointment.serviceType,
          consultantName: existingAppointment.consultant?.displayName,
          cancelUrl,
        }).catch((err) => console.error('Error sending confirmation email:', err));

        notifyAdminsOfAppointment({
          id: existingAppointment.id,
          clientName: existingAppointment.name,
          clientEmail: existingAppointment.email,
          clientPhone: existingAppointment.phone,
          date: existingAppointment.date,
          serviceType: existingAppointment.serviceType,
          notes: existingAppointment.message ?? undefined,
          consultantName: existingAppointment.consultant?.displayName,
        }).catch((err) => console.error('Error sending admin notification:', err));
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
    if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
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
