import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAvailableSlots, getAvailableDaysInMonth } from '@/lib/availability';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const consultantId = searchParams.get('consultantId');
  const date = searchParams.get('date');
  const serviceType = searchParams.get('serviceType');
  const year = searchParams.get('year');
  const month = searchParams.get('month');

  if (!consultantId) {
    return NextResponse.json({ error: 'consultantId required' }, { status: 400 });
  }

  // Return available days for a month
  if (year && month) {
    // If "any" consultant, merge availability across all active consultants
    if (consultantId === 'any') {
      const consultants = await prisma.consultantProfile.findMany({
        where: { isActive: true },
        select: { id: true },
      });
      const daysSets = await Promise.all(
        consultants.map((c) => getAvailableDaysInMonth(c.id, parseInt(year), parseInt(month)))
      );
      const merged = new Set(daysSets.flat());
      return NextResponse.json({ days: Array.from(merged).sort((a, b) => a - b) });
    }
    const days = await getAvailableDaysInMonth(consultantId, parseInt(year), parseInt(month));
    return NextResponse.json({ days });
  }

  // Return available slots for a specific date
  if (date && serviceType) {
    const service = await prisma.service.findFirst({
      where: { serviceType, active: true },
      select: { durationMinutes: true },
    });
    const duration = service?.durationMinutes ?? 60;

    if (consultantId === 'any') {
      const consultants = await prisma.consultantProfile.findMany({
        where: { isActive: true },
        select: { id: true, displayName: true },
      });
      // Return slots per consultant so the UI can show who's available when
      const results = await Promise.all(
        consultants.map(async (c) => ({
          consultantId: c.id,
          consultantName: c.displayName,
          slots: await getAvailableSlots(c.id, date, duration),
        }))
      );
      return NextResponse.json(results.filter((r) => r.slots.length > 0));
    }

    const slots = await getAvailableSlots(consultantId, date, duration);
    return NextResponse.json({ slots });
  }

  return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
}
