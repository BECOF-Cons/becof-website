import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  nameFr: z.string().min(1),
  nameAr: z.string().optional().nullable(),
  establishmentId: z.string().min(1),
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
  const establishmentId = searchParams.get('establishmentId');

  const filieres = await prisma.filiere.findMany({
    where: establishmentId ? { establishmentId } : undefined,
    orderBy: { displayOrder: 'asc' },
  });
  return NextResponse.json(filieres);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const slug = slugify(parsed.data.nameFr);
  const existing = await prisma.filiere.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  const filiere = await prisma.filiere.create({
    data: {
      nameFr: parsed.data.nameFr,
      nameAr: parsed.data.nameAr ?? null,
      slug: finalSlug,
      establishmentId: parsed.data.establishmentId,
      active: parsed.data.active ?? true,
      displayOrder: parsed.data.displayOrder ?? 0,
    },
  });
  return NextResponse.json(filiere, { status: 201 });
}
