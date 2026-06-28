import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

  const appointment = await prisma.appointment.findUnique({
    where: { cancelToken: token },
  });

  if (!appointment) {
    return NextResponse.json({ error: 'Invalid or already used cancel link' }, { status: 404 });
  }

  if (appointment.status === 'CANCELLED') {
    return NextResponse.json({ error: 'Appointment already cancelled' }, { status: 400 });
  }

  if (['COMPLETED'].includes(appointment.status)) {
    return NextResponse.json({ error: 'Cannot cancel a completed appointment' }, { status: 400 });
  }

  // Enforce 24h cancellation window
  const hoursUntil = (appointment.date.getTime() - Date.now()) / 36e5;
  if (hoursUntil < 24) {
    return NextResponse.json(
      { error: 'Cancellations must be made at least 24 hours before the appointment' },
      { status: 400 }
    );
  }

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: 'CANCELLED' },
  });

  return NextResponse.json({ message: 'Appointment cancelled successfully' });
}
