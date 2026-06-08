import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ universityId: string }> }
) {
  try {
    const { universityId } = await params;
    const university = await prisma.university.findUnique({
      where: { id: universityId },
      include: {
        establishments: {
          where: { active: true },
          include: {
            programs: {
              where: { active: true },
              select: { id: true, nameFr: true, codeId: true, displayOrder: true },
              orderBy: [{ displayOrder: 'asc' }, { nameFr: 'asc' }],
            },
          },
          orderBy: [{ displayOrder: 'asc' }, { nameFr: 'asc' }],
        },
      },
    });

    if (!university) {
      return NextResponse.json(
        { error: 'University not found' },
        { status: 404 }
      );
    }

    // Only return if active
    if (!university || university.active === false) {
      return NextResponse.json(
        { error: 'University not available' },
        { status: 404 }
      );
    }

    return NextResponse.json(university);
  } catch (error) {
    console.error('Error fetching university details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch university details' },
      { status: 500 }
    );
  }
}
