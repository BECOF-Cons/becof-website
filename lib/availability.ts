import { prisma } from './prisma';

export function generateSlots(startTime: string, endTime: string, durationMinutes: number): string[] {
  const slots: string[] = [];
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let current = sh * 60 + sm;
  const end = eh * 60 + em;
  while (current + durationMinutes <= end) {
    const h = Math.floor(current / 60).toString().padStart(2, '0');
    const m = (current % 60).toString().padStart(2, '0');
    slots.push(`${h}:${m}`);
    current += durationMinutes;
  }
  return slots;
}

export async function getAvailableSlots(
  consultantId: string,
  dateStr: string,
  durationMinutes: number
): Promise<string[]> {
  const date = new Date(dateStr);
  const dayOfWeek = date.getUTCDay();

  // Check override for this specific date
  const override = await prisma.consultantAvailabilityOverride.findUnique({
    where: { consultantId_date: { consultantId, date } },
  });

  let startTime: string | null = null;
  let endTime: string | null = null;

  if (override) {
    if (override.isBlocked) return [];
    startTime = override.startTime;
    endTime = override.endTime;
  }

  if (!startTime || !endTime) {
    const weekly = await prisma.consultantAvailability.findUnique({
      where: { consultantId_dayOfWeek: { consultantId, dayOfWeek } },
    });
    if (!weekly || !weekly.isEnabled) return [];
    startTime = weekly.startTime;
    endTime = weekly.endTime;
  }

  const allSlots = generateSlots(startTime, endTime, durationMinutes);

  // Get existing bookings for this consultant on this date
  const startOfDay = new Date(dateStr + 'T00:00:00.000Z');
  const endOfDay = new Date(dateStr + 'T23:59:59.999Z');

  const booked = await prisma.appointment.findMany({
    where: {
      consultantId,
      date: { gte: startOfDay, lte: endOfDay },
      status: { in: ['PENDING', 'CONFIRMED'] },
    },
    select: { time: true },
  });

  const bookedTimes = new Set(booked.map((a) => a.time));
  return allSlots.filter((s) => !bookedTimes.has(s));
}

export async function getAvailableDaysInMonth(
  consultantId: string,
  year: number,
  month: number
): Promise<number[]> {
  // Get the weekly schedule for this consultant
  const weekly = await prisma.consultantAvailability.findMany({
    where: { consultantId, isEnabled: true },
    select: { dayOfWeek: true },
  });
  const enabledDays = new Set(weekly.map((w) => w.dayOfWeek));

  // Get overrides for this month
  const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59));
  const overrides = await prisma.consultantAvailabilityOverride.findMany({
    where: {
      consultantId,
      date: { gte: startOfMonth, lte: endOfMonth },
    },
  });
  const overrideMap = new Map(overrides.map((o) => [o.date.toISOString().split('T')[0], o]));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const availableDays: number[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(Date.UTC(year, month - 1, day));
    if (d < today) continue;

    const dateStr = d.toISOString().split('T')[0];
    const override = overrideMap.get(dateStr);

    if (override) {
      if (!override.isBlocked && override.startTime && override.endTime) {
        availableDays.push(day);
      }
    } else if (enabledDays.has(d.getUTCDay())) {
      availableDays.push(day);
    }
  }

  return availableDays;
}
