import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const universitySchema = z.object({
  nameFr: z.string().min(1, 'French name is required').optional(),
  nameAr: z.string().min(1, 'Arabic name is required').optional(),
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

    const university = await prisma.university.findUnique({
      where: { id },
      include: {
        establishments: {
          include: {
            programs: {
              select: { id: true },
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

    return NextResponse.json(university);
  } catch (error) {
    console.error('Error fetching university:', error);
    return NextResponse.json(
      { error: 'Failed to fetch university' },
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
    const data = universitySchema.parse(body);

    // Verify university exists
    const existing = await prisma.university.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'University not found' },
        { status: 404 }
      );
    }

    // Check for duplicate names if changing them
    if (data.nameFr && data.nameFr !== existing.nameFr) {
      const duplicate = await prisma.university.findFirst({
        where: {
          AND: [
            { nameFr: data.nameFr },
            { nameAr: data.nameAr || existing.nameAr },
            { id: { not: id } },
          ],
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: 'University with these names already exists' },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.university.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating university:', error);
    return NextResponse.json(
      { error: 'Failed to update university' },
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

    const university = await prisma.university.findUnique({
      where: { id },
      include: {
        establishments: {
          select: { id: true },
        },
      },
    });

    if (!university) {
      return NextResponse.json(
        { error: 'University not found' },
        { status: 404 }
      );
    }

    // Check if university has establishments
    if (university.establishments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete university with existing establishments. Delete establishments first.' },
        { status: 400 }
      );
    }

    await prisma.university.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting university:', error);
    return NextResponse.json(
      { error: 'Failed to delete university' },
      { status: 500 }
    );
  }
}
