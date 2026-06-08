import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const programSchema = z.object({
  nameFr: z.string().min(1, 'French name is required').optional(),
  codeId: z.string().optional().nullable(),
  establishmentId: z.string().min(1, 'Establishment is required').optional(),
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

    const program = await prisma.program.findUnique({
      where: { id },
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

    if (!program) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(program);
  } catch (error) {
    console.error('Error fetching program:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program' },
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
    const data = programSchema.parse(body);

    // Verify program exists
    const existing = await prisma.program.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    // If changing establishment, verify it exists
    if (data.establishmentId && data.establishmentId !== existing.establishmentId) {
      const establishment = await prisma.establishment.findUnique({
        where: { id: data.establishmentId },
      });

      if (!establishment) {
        return NextResponse.json(
          { error: 'Establishment not found' },
          { status: 400 }
        );
      }
    }

    // Check for duplicates if changing name
    if (data.nameFr) {
      const duplicate = await prisma.program.findFirst({
        where: {
          AND: [
            { nameFr: data.nameFr },
            { establishmentId: data.establishmentId || existing.establishmentId },
            { id: { not: id } },
          ],
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: 'Program with this name already exists in this establishment' },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.program.update({
      where: { id },
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

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating program:', error);
    return NextResponse.json(
      { error: 'Failed to update program' },
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

    const program = await prisma.program.findUnique({
      where: { id },
    });

    if (!program) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    await prisma.program.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting program:', error);
    return NextResponse.json(
      { error: 'Failed to delete program' },
      { status: 500 }
    );
  }
}
