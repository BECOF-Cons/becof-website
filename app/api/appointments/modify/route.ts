import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET — fetch appointment info by cancelToken (used by modify page)
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

  const appointment = await prisma.appointment.findUnique({
    where: { cancelToken: token },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      date: true,
      time: true,
      serviceType: true,
      status: true,
      consultantId: true,
      consultant: { select: { id: true, displayName: true } },
    },
  });

  if (!appointment) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 });
  }

  if (['CANCELLED', 'COMPLETED'].includes(appointment.status)) {
    return NextResponse.json({ error: 'Cannot modify a cancelled or completed appointment' }, { status: 400 });
  }

  return NextResponse.json(appointment);
}

// POST — apply the modification
export async function POST(req: NextRequest) {
  const { token, date, time, consultantId } = await req.json();

  if (!token || !date || !time) {
    return NextResponse.json({ error: 'Token, date and time are required' }, { status: 400 });
  }

  const appointment = await prisma.appointment.findUnique({
    where: { cancelToken: token },
  });

  if (!appointment) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 });
  }

  if (['CANCELLED', 'COMPLETED'].includes(appointment.status)) {
    return NextResponse.json({ error: 'Cannot modify a cancelled or completed appointment' }, { status: 400 });
  }

  const hoursUntil = (appointment.date.getTime() - Date.now()) / 36e5;
  if (hoursUntil < 24) {
    return NextResponse.json(
      { error: 'Modifications must be made at least 24 hours before the appointment' },
      { status: 400 }
    );
  }

  const updated = await prisma.appointment.update({
    where: { id: appointment.id },
    data: {
      date: new Date(date),
      time,
      consultantId: consultantId ?? appointment.consultantId,
      status: 'PENDING',
    },
    include: {
      consultant: { select: { displayName: true } },
    },
  });

  return NextResponse.json({ message: 'Appointment updated successfully', appointment: updated });
}
