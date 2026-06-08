import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const establishmentSchema = z.object({
  nameFr: z.string().min(1, 'French name is required').optional(),
  nameAr: z.string().min(1, 'Arabic name is required').optional(),
  universityId: z.string().min(1, 'University is required').optional(),
  displayOrder: z.number().optional(),
  active: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const establishment = await prisma.establishment.findUnique({
      where: { id },
      include: {
        university: {
          select: { id: true, nameFr: true, nameAr: true },
        },
        programs: {
          orderBy: [{ displayOrder: 'asc' }, { nameFr: 'asc' }],
        },
      },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: 'Establishment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(establishment);
  } catch (error) {
    console.error('Error fetching establishment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch establishment' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Verify establishment exists
    const existing = await prisma.establishment.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Establishment not found' },
        { status: 404 }
      );
    }

    // If changing university, verify it exists
    if (data.universityId && data.universityId !== existing.universityId) {
      const university = await prisma.university.findUnique({
        where: { id: data.universityId },
      });

      if (!university) {
        return NextResponse.json(
          { error: 'University not found' },
          { status: 400 }
        );
      }
    }

    // Check for duplicates if changing names
    if (data.nameFr || data.nameAr) {
      const duplicate = await prisma.establishment.findFirst({
        where: {
          AND: [
            { nameFr: data.nameFr || existing.nameFr },
            { nameAr: data.nameAr || existing.nameAr },
            { universityId: data.universityId || existing.universityId },
            { id: { not: id } },
          ],
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: 'Establishment with these names already exists in this university' },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.establishment.update({
      where: { id },
      data,
      include: {
        university: {
          select: { id: true, nameFr: true, nameAr: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating establishment:', error);
    return NextResponse.json(
      { error: 'Failed to update establishment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const establishment = await prisma.establishment.findUnique({
      where: { id },
      include: {
        programs: {
          select: { id: true },
        },
      },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: 'Establishment not found' },
        { status: 404 }
      );
    }

    // Check if establishment has programs
    if (establishment.programs.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete establishment with existing programs. Delete programs first.' },
        { status: 400 }
      );
    }

    await prisma.establishment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting establishment:', error);
    return NextResponse.json(
      { error: 'Failed to delete establishment' },
      { status: 500 }
    );
  }
}
