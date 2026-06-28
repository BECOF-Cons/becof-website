import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

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

function uniqueSlug(base: string, existing: Set<string>) {
  let slug = base;
  let counter = 2;
  while (existing.has(slug)) slug = `${base}-${counter++}`;
  existing.add(slug);
  return slug;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const wb = XLSX.read(buffer, { type: 'buffer' });

  const uniSheet = wb.Sheets['Universites'];
  const etabSheet = wb.Sheets['Etablissements par Universite'];
  const filSheet = wb.Sheets['Filières par etablissement'];

  if (!uniSheet || !etabSheet || !filSheet) {
    return NextResponse.json({ error: 'Invalid Excel format: missing required sheets' }, { status: 400 });
  }

  const uniRows = XLSX.utils.sheet_to_json<{ ll_uni: string; all_uni: string }>(uniSheet);
  const etabRows = XLSX.utils.sheet_to_json<{ ll_uni: string; LL_ETAB: string; ALL_ETAB: string }>(etabSheet);
  const filRows = XLSX.utils.sheet_to_json<{ ALL_ETAB: string; libf: string }>(filSheet);

  const uniSlugs = new Set<string>();
  const etabSlugs = new Set<string>();
  const filSlugs = new Set<string>();
  const uniNameToId = new Map<string, string>();
  const etabArToId = new Map<string, string>();

  let uniCount = 0, etabCount = 0, filCount = 0;

  for (let i = 0; i < uniRows.length; i++) {
    const { ll_uni, all_uni } = uniRows[i];
    if (!ll_uni?.trim()) continue;
    const nameFr = ll_uni.trim();
    const slug = uniqueSlug(slugify(nameFr), uniSlugs);
    const uni = await prisma.university.upsert({
      where: { slug },
      update: { nameFr, nameAr: all_uni?.trim() ?? null },
      create: { nameFr, nameAr: all_uni?.trim() ?? null, slug, displayOrder: i },
    });
    uniNameToId.set(nameFr, uni.id);
    uniCount++;
  }

  for (let i = 0; i < etabRows.length; i++) {
    const { ll_uni, LL_ETAB, ALL_ETAB } = etabRows[i];
    const nameFr = LL_ETAB?.replace(/\r\n|\r|\n/g, ' ').trim();
    const uniNameFr = ll_uni?.trim();
    if (!nameFr || !uniNameFr) continue;
    const universityId = uniNameToId.get(uniNameFr);
    if (!universityId) continue;
    const slug = uniqueSlug(slugify(nameFr), etabSlugs);
    const etab = await prisma.establishment.upsert({
      where: { slug },
      update: { nameFr, nameAr: ALL_ETAB?.trim() ?? null, universityId },
      create: { nameFr, nameAr: ALL_ETAB?.trim() ?? null, slug, universityId, displayOrder: i },
    });
    if (ALL_ETAB?.trim()) etabArToId.set(ALL_ETAB.trim(), etab.id);
    etabCount++;
  }

  for (let i = 0; i < filRows.length; i++) {
    const { ALL_ETAB, libf } = filRows[i];
    const nameFr = libf?.trim();
    const etabNameAr = ALL_ETAB?.trim();
    if (!nameFr || !etabNameAr) continue;
    const establishmentId = etabArToId.get(etabNameAr);
    if (!establishmentId) continue;
    const slug = uniqueSlug(slugify(nameFr), filSlugs);
    await prisma.filiere.upsert({
      where: { slug },
      update: { nameFr, establishmentId },
      create: { nameFr, slug, establishmentId, displayOrder: i },
    });
    filCount++;
  }

  return NextResponse.json({ universities: uniCount, establishments: etabCount, filieres: filCount });
}
