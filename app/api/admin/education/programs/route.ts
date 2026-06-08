import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const programSchema = z.object({
  nameFr: z.string().min(1, 'French name is required'),
  codeId: z.string().optional().nullable(),
  establishmentId: z.string().min(1, 'Establishment is required'),
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
    const establishmentId = searchParams.get('establishmentId') || '';
    const active = searchParams.get('active');

    const programs = await prisma.program.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { nameFr: { contains: search, mode: 'insensitive' } },
              { codeId: { contains: search, mode: 'insensitive' } },
            ],
          } : {},
          establishmentId ? { establishmentId } : {},
          active !== null ? { active: active === 'true' } : {},
        ],
      },
      include: {
        establishment: {
          select: {
            id: true,
            nameFr: true,
            nameAr: true,
            university: {
              select: { id: true, nameFr: true, nameAr: true },
            },
          },
        },
      },
      orderBy: [{ displayOrder: 'asc' }, { nameFr: 'asc' }],
    });

    return NextResponse.json(programs);
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
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
    const data = programSchema.parse(body);

    // Verify establishment exists
    const establishment = await prisma.establishment.findUnique({
      where: { id: data.establishmentId },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: 'Establishment not found' },
        { status: 400 }
      );
    }

    // Check for duplicates
    const existing = await prisma.program.findFirst({
      where: {
        AND: [
          { nameFr: data.nameFr },
          { establishmentId: data.establishmentId },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Program with this name already exists in this establishment' },
        { status: 400 }
      );
    }

    const program = await prisma.program.create({
      data,
      include: {
        establishment: {
          select: {
            id: true,
            nameFr: true,
            nameAr: true,
            university: {
              select: { id: true, nameFr: true, nameAr: true },
            },
          },
        },
      },
    });

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating program:', error);
    return NextResponse.json(
      { error: 'Failed to create program' },
      { status: 500 }
    );
  }
}
