import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const universityId = searchParams.get('universityId') || '';

    let universities;

    if (universityId) {
      // Get specific university with all establishments and programs
      universities = await prisma.university.findMany({
        where: { id: universityId, active: true },
        include: {
          establishments: {
            where: { active: true },
            include: {
              programs: {
                where: { active: true },
                orderBy: [{ displayOrder: 'asc' }, { nameFr: 'asc' }],
              },
            },
            orderBy: [{ displayOrder: 'asc' }, { nameFr: 'asc' }],
          },
        },
        orderBy: [{ displayOrder: 'asc' }, { nameFr: 'asc' }],
      });
    } else {
      // Get all universities with establishments count
      universities = await prisma.university.findMany({
        where: { active: true },
        include: {
          establishments: {
            where: { active: true },
            select: { id: true },
          },
        },
        orderBy: [{ displayOrder: 'asc' }, { nameFr: 'asc' }],
      });

      // Return universities without the establishments array
      return NextResponse.json(
        universities.map((uni) => ({
          id: uni.id,
          nameFr: uni.nameFr,
          nameAr: uni.nameAr,
          displayOrder: uni.displayOrder,
          establishmentCount: uni.establishments.length,
        }))
      );
    }

    return NextResponse.json(universities);
  } catch (error) {
    console.error('Error fetching hierarchy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hierarchy' },
      { status: 500 }
    );
  }
}
