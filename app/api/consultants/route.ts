import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const consultants = await prisma.consultantProfile.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
    select: {
      id: true,
      displayName: true,
      titleFr: true,
      titleEn: true,
      bioFr: true,
      bioEn: true,
      photoUrl: true,
    },
  });
  return NextResponse.json(consultants);
}
