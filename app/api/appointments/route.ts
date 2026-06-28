import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { getAvailableSlots } from '@/lib/availability';

const appointmentSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  serviceType: z.string().min(1),
  consultantId: z.string().optional().nullable(),
  message: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = appointmentSchema.parse(body);
    const appointmentDate = new Date(`${data.date}T${data.time}:00`);

    // Resolve consultant: if none specified, pick the one with fewest bookings that day
    let consultantId = data.consultantId || null;
    if (!consultantId) {
      const service = await prisma.service.findFirst({
        where: { serviceType: data.serviceType, active: true },
        select: { durationMinutes: true },
      });
      const duration = service?.durationMinutes ?? 60;

      const active = await prisma.consultantProfile.findMany({
        where: { isActive: true },
        select: { id: true },
      });

      let leastBooked: string | null = null;
      let minCount = Infinity;
      for (const c of active) {
        const slots = await getAvailableSlots(c.id, data.date, duration);
        if (!slots.includes(data.time)) continue;
        const count = await prisma.appointment.count({
          where: { consultantId: c.id, status: { in: ['PENDING', 'CONFIRMED'] } },
        });
        if (count < minCount) { minCount = count; leastBooked = c.id; }
      }
      consultantId = leastBooked;
    } else {
      // Validate the requested slot is still available
      const service = await prisma.service.findFirst({
        where: { serviceType: data.serviceType, active: true },
        select: { durationMinutes: true },
      });
      const duration = service?.durationMinutes ?? 60;
      const slots = await getAvailableSlots(consultantId, data.date, duration);
      if (!slots.includes(data.time)) {
        return NextResponse.json({ error: 'This time slot is no longer available' }, { status: 400 });
      }
    }

    if (!consultantId) {
      return NextResponse.json({ error: 'No consultant available for this slot' }, { status: 400 });
    }

    const service = await prisma.service.findFirst({
      where: { serviceType: data.serviceType, active: true },
      select: { price: true },
    });
    const priceNum = parseFloat((service?.price ?? '150').replace(/[^\d.]/g, '')) || 150;

    const adminUser = await prisma.user.findFirst({
      where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
    });
    if (!adminUser) {
      return NextResponse.json({ error: 'System configuration error' }, { status: 500 });
    }

    const cancelToken = randomBytes(32).toString('hex');

    const appointment = await prisma.appointment.create({
      data: {
        userId: adminUser.id,
        consultantId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        date: appointmentDate,
        time: data.time,
        serviceType: data.serviceType,
        message: data.message || '',
        isOnline: true,
        cancelToken,
        status: 'PENDING',
      },
      include: {
        consultant: { select: { displayName: true } },
      },
    });

    await prisma.payment.create({
      data: {
        userId: adminUser.id,
        appointmentId: appointment.id,
        amount: priceNum,
        currency: 'TND',
        paymentMethod: 'BANK_TRANSFER',
        status: 'PENDING',
        transactionId: null,
      },
    });

    return NextResponse.json(
      { message: 'Appointment booked successfully', appointmentId: appointment.id, appointment },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const appointments = await prisma.appointment.findMany({
    where: status ? { status: status as any } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      consultant: { select: { displayName: true, photoUrl: true } },
    },
  });

  return NextResponse.json(appointments);
}
