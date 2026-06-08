import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const universitySchema = z.object({
  nameFr: z.string().min(1, 'French name is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
  displayOrder: z.number().optional().default(0),
  active: z.boolean().optional().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userRole = (session.user as any)?.role as string;
    if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const active = searchParams.get('active');

    const universities = await prisma.university.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { nameFr: { contains: search, mode: 'insensitive' } },
              { nameAr: { contains: search, mode: 'insensitive' } },
            ],
          } : {},
          active !== null ? { active: active === 'true' } : {},
        ],
      },
      include: {
        establishments: {
          select: { id: true },
        },
      },
      orderBy: [{ displayOrder: 'asc' }, { nameFr: 'asc' }],
    });

    const universitiesWithCount = universities.map((uni) => ({
      ...uni,
      establishmentCount: uni.establishments.length,
      establishments: undefined,
    }));

    return NextResponse.json(universitiesWithCount);
  } catch (error) {
    console.error('Error fetching universities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch universities' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userRole = (session.user as any)?.role as string;
    if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const data = universitySchema.parse(body);

    // Check for duplicates
    const existing = await prisma.university.findFirst({
      where: {
        AND: [
          { nameFr: data.nameFr },
          { nameAr: data.nameAr },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'University with these names already exists' },
        { status: 400 }
      );
    }

    const university = await prisma.university.create({
      data,
    });

    return NextResponse.json(university, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating university:', error);
    return NextResponse.json(
      { error: 'Failed to create university' },
      { status: 500 }
    );
  }
}
