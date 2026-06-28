import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const universities = await prisma.university.findMany({
      where: { active: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        establishments: {
          where: { active: true },
          orderBy: { displayOrder: 'asc' },
          include: {
            filieres: {
              where: { active: true },
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
      },
    });
    return NextResponse.json(universities);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch formations' }, { status: 500 });
  }
}
