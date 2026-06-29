import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

async function getConsultantId(session: any): Promise<string | null> {
  const profile = await prisma.consultantProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  return profile?.id ?? null;
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) return null;
  return session;
}

// GET own availability schedule
export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get('consultantId');

  // Superadmin can view any consultant's schedule; others can only view their own
  let consultantId: string | null;
  if (targetId && (session.user as any).role === 'SUPER_ADMIN') {
    consultantId = targetId;
  } else {
    consultantId = await getConsultantId(session);
  }

  if (!consultantId) {
    return NextResponse.json({ weekly: [], overrides: [] });
  }

  const [weekly, overrides] = await Promise.all([
    prisma.consultantAvailability.findMany({
      where: { consultantId },
      orderBy: { dayOfWeek: 'asc' },
    }),
    prisma.consultantAvailabilityOverride.findMany({
      where: {
        consultantId,
        date: { gte: new Date() },
      },
      orderBy: { date: 'asc' },
    }),
  ]);

  return NextResponse.json({ consultantId, weekly, overrides });
}

// PUT — upsert weekly schedule (array of day configs)
export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get('consultantId');

  let consultantId: string | null;
  if (targetId && (session.user as any).role === 'SUPER_ADMIN') {
    consultantId = targetId;
  } else {
    consultantId = await getConsultantId(session);
  }

  if (!consultantId) {
    return NextResponse.json({ error: 'No consultant profile found for this user' }, { status: 404 });
  }

  const { weekly } = await req.json();
  if (!Array.isArray(weekly)) {
    return NextResponse.json({ error: 'weekly must be an array' }, { status: 400 });
  }

  await Promise.all(
    weekly.map((day: { dayOfWeek: number; startTime: string; endTime: string; isEnabled: boolean }) =>
      prisma.consultantAvailability.upsert({
        where: { consultantId_dayOfWeek: { consultantId: consultantId!, dayOfWeek: day.dayOfWeek } },
        create: {
          consultantId: consultantId!,
          dayOfWeek: day.dayOfWeek,
          startTime: day.startTime,
          endTime: day.endTime,
          isEnabled: day.isEnabled,
        },
        update: {
          startTime: day.startTime,
          endTime: day.endTime,
          isEnabled: day.isEnabled,
        },
      })
    )
  );

  return NextResponse.json({ message: 'Availability updated' });
}

// POST — add or update a date override
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get('consultantId');

  let consultantId: string | null;
  if (targetId && (session.user as any).role === 'SUPER_ADMIN') {
    consultantId = targetId;
  } else {
    consultantId = await getConsultantId(session);
  }

  if (!consultantId) {
    return NextResponse.json({ error: 'No consultant profile found' }, { status: 404 });
  }

  const { date, isBlocked, startTime, endTime } = await req.json();
  const dateObj = new Date(date);

  const override = await prisma.consultantAvailabilityOverride.upsert({
    where: { consultantId_date: { consultantId, date: dateObj } },
    create: { consultantId, date: dateObj, isBlocked, startTime, endTime },
    update: { isBlocked, startTime, endTime },
  });

  return NextResponse.json(override);
}

// DELETE — remove a date override
export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const overrideId = searchParams.get('overrideId');
  if (!overrideId) return NextResponse.json({ error: 'overrideId required' }, { status: 400 });

  await prisma.consultantAvailabilityOverride.delete({ where: { id: overrideId } });
  return NextResponse.json({ message: 'Override removed' });
}
