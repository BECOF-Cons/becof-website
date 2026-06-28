import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'SUPER_ADMIN') return null;
  return session;
}

export async function GET() {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const consultants = await prisma.consultantProfile.findMany({
    orderBy: { displayOrder: 'asc' },
    include: {
      user: { select: { id: true, email: true, name: true } },
      _count: { select: { appointments: true } },
    },
  });
  return NextResponse.json(consultants);
}

export async function POST(req: NextRequest) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { userId, displayName, titleFr, titleEn, bioFr, bioEn, photoUrl, displayOrder } = body;

  if (!userId || !displayName) {
    return NextResponse.json({ error: 'userId and displayName are required' }, { status: 400 });
  }

  const existing = await prisma.consultantProfile.findUnique({ where: { userId } });
  if (existing) {
    return NextResponse.json({ error: 'This user already has a consultant profile' }, { status: 400 });
  }

  const consultant = await prisma.consultantProfile.create({
    data: {
      userId,
      displayName,
      titleFr: titleFr || null,
      titleEn: titleEn || null,
      bioFr: bioFr || null,
      bioEn: bioEn || null,
      photoUrl: photoUrl || null,
      displayOrder: displayOrder ?? 0,
    },
  });
  return NextResponse.json(consultant, { status: 201 });
}
