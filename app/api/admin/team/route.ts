import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const teamMemberSchema = z.object({
  nameFr: z.string().min(1),
  nameEn: z.string().min(1),
  titleFr: z.string().min(1),
  titleEn: z.string().min(1),
  bioFr: z.string().optional().nullable(),
  bioEn: z.string().optional().nullable(),
  image: z.string().min(1),
  displayOrder: z.number(),
  active: z.boolean(),
});

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
    const validatedData = teamMemberSchema.parse(body);

    const member = await prisma.teamMember.create({
      data: validatedData,
    });

    return NextResponse.json(member);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating team member:', error);
    return NextResponse.json(
      { error: 'Failed to create team member' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const members = await prisma.teamMember.findMany({
      where: {
        active: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}
