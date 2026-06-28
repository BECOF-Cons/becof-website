import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  nameFr: z.string().min(1),
  nameAr: z.string().optional().nullable(),
  active: z.boolean().optional(),
  displayOrder: z.number().optional(),
});

function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return null;
  }
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const universities = await prisma.university.findMany({
    orderBy: { displayOrder: 'asc' },
    include: { _count: { select: { establishments: true } } },
  });
  return NextResponse.json(universities);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const slug = slugify(parsed.data.nameFr);
  const existing = await prisma.university.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  const university = await prisma.university.create({
    data: {
      nameFr: parsed.data.nameFr,
      nameAr: parsed.data.nameAr ?? null,
      slug: finalSlug,
      active: parsed.data.active ?? true,
      displayOrder: parsed.data.displayOrder ?? 0,
    },
  });
  return NextResponse.json(university, { status: 201 });
}
