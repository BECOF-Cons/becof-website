import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'SUPER_ADMIN') return null;
  return session;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const consultant = await prisma.consultantProfile.update({
    where: { id },
    data: {
      displayName: body.displayName,
      titleFr: body.titleFr ?? null,
      titleEn: body.titleEn ?? null,
      bioFr: body.bioFr ?? null,
      bioEn: body.bioEn ?? null,
      photoUrl: body.photoUrl ?? null,
      isActive: body.isActive ?? true,
      displayOrder: body.displayOrder ?? 0,
    },
  });
  return NextResponse.json(consultant);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await prisma.consultantProfile.delete({ where: { id } });
  return NextResponse.json({ message: 'Deleted' });
}
