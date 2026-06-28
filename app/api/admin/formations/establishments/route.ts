import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  nameFr: z.string().min(1),
  nameAr: z.string().optional().nullable(),
  universityId: z.string().min(1),
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
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) return null;
  return session;
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const universityId = searchParams.get('universityId');

  const establishments = await prisma.establishment.findMany({
    where: universityId ? { universityId } : undefined,
    orderBy: { displayOrder: 'asc' },
    include: { _count: { select: { filieres: true } } },
  });
  return NextResponse.json(establishments);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const slug = slugify(parsed.data.nameFr);
  const existing = await prisma.establishment.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  const establishment = await prisma.establishment.create({
    data: {
      nameFr: parsed.data.nameFr,
      nameAr: parsed.data.nameAr ?? null,
      slug: finalSlug,
      universityId: parsed.data.universityId,
      active: parsed.data.active ?? true,
      displayOrder: parsed.data.displayOrder ?? 0,
    },
  });
  return NextResponse.json(establishment, { status: 201 });
}
