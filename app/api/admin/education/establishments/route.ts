import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const establishmentSchema = z.object({
  nameFr: z.string().min(1, 'French name is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
  universityId: z.string().min(1, 'University is required'),
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
    const universityId = searchParams.get('universityId') || '';
    const active = searchParams.get('active');

    const establishments = await prisma.establishment.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { nameFr: { contains: search, mode: 'insensitive' } },
              { nameAr: { contains: search, mode: 'insensitive' } },
            ],
          } : {},
          universityId ? { universityId } : {},
          active !== null ? { active: active === 'true' } : {},
        ],
      },
      include: {
        university: {
          select: { id: true, nameFr: true, nameAr: true },
        },
        programs: {
          select: { id: true },
        },
      },
      orderBy: [{ displayOrder: 'asc' }, { nameFr: 'asc' }],
    });

    const establishmentsWithCount = establishments.map((etab) => ({
      ...etab,
      programCount: etab.programs.length,
      programs: undefined,
    }));

    return NextResponse.json(establishmentsWithCount);
  } catch (error) {
    console.error('Error fetching establishments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch establishments' },
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
    const data = establishmentSchema.parse(body);

    // Verify university exists
    const university = await prisma.university.findUnique({
      where: { id: data.universityId },
    });

    if (!university) {
      return NextResponse.json(
        { error: 'University not found' },
        { status: 400 }
      );
    }

    // Check for duplicates
    const existing = await prisma.establishment.findFirst({
      where: {
        AND: [
          { nameFr: data.nameFr },
          { nameAr: data.nameAr },
          { universityId: data.universityId },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Establishment with these names already exists in this university' },
        { status: 400 }
      );
    }

    const establishment = await prisma.establishment.create({
      data,
      include: {
        university: {
          select: { id: true, nameFr: true, nameAr: true },
        },
      },
    });

    return NextResponse.json(establishment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating establishment:', error);
    return NextResponse.json(
      { error: 'Failed to create establishment' },
      { status: 500 }
    );
  }
}
