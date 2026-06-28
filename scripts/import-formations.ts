import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove diacritics
    .replace(/[^a-z0-9\s-]/g, '')    // remove non-alphanumeric
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}

function uniqueSlug(base: string, existing: Set<string>): string {
  let slug = base;
  let counter = 2;
  while (existing.has(slug)) {
    slug = `${base}-${counter++}`;
  }
  existing.add(slug);
  return slug;
}

async function main() {
  const filePath = path.resolve(process.cwd(), 'offres de formations.xlsx');
  console.log('📂 Reading:', filePath);

  const wb = XLSX.readFile(filePath);

  // ── Sheet 1: Universities ──────────────────────────────────────────────────
  const uniSheet = wb.Sheets['Universites'];
  const uniRows = XLSX.utils.sheet_to_json<{ ll_uni: string; all_uni: string }>(uniSheet);

  const uniSlugs = new Set<string>();
  console.log(`\n🏛️  Importing ${uniRows.length} universities...`);

  const uniNameToId = new Map<string, string>();

  for (let i = 0; i < uniRows.length; i++) {
    const row = uniRows[i];
    const nameFr = row.ll_uni?.trim();
    const nameAr = row.all_uni?.trim() ?? null;
    if (!nameFr) continue;

    const slug = uniqueSlug(slugify(nameFr), uniSlugs);
    const uni = await prisma.university.upsert({
      where: { slug },
      update: { nameFr, nameAr },
      create: { nameFr, nameAr, slug, displayOrder: i },
    });
    uniNameToId.set(nameFr, uni.id);
  }

  console.log(`✅ Universities: ${uniNameToId.size}`);

  // ── Sheet 2: Establishments ────────────────────────────────────────────────
  const etabSheet = wb.Sheets['Etablissements par Universite'];
  const etabRows = XLSX.utils.sheet_to_json<{
    ll_uni: string;
    LL_ETAB: string;
    ALL_ETAB: string;
  }>(etabSheet);

  const etabSlugs = new Set<string>();
  console.log(`\n🏫  Importing ${etabRows.length} establishments...`);

  // Map by Arabic name (used in filières sheet for linking)
  const etabArToId = new Map<string, string>();

  for (let i = 0; i < etabRows.length; i++) {
    const row = etabRows[i];
    const uniNameFr = row.ll_uni?.trim();
    const nameFr = row.LL_ETAB?.replace(/\r\n|\r|\n/g, ' ').trim();
    const nameAr = row.ALL_ETAB?.trim() ?? null;
    if (!nameFr || !uniNameFr) continue;

    const universityId = uniNameToId.get(uniNameFr);
    if (!universityId) {
      console.warn(`  ⚠️  Unknown university: "${uniNameFr}"`);
      continue;
    }

    const slug = uniqueSlug(slugify(nameFr), etabSlugs);
    const etab = await prisma.establishment.upsert({
      where: { slug },
      update: { nameFr, nameAr, universityId },
      create: { nameFr, nameAr, slug, universityId, displayOrder: i },
    });

    if (nameAr) etabArToId.set(nameAr.trim(), etab.id);
  }

  console.log(`✅ Establishments: ${etabArToId.size}`);

  // ── Sheet 3: Filières ──────────────────────────────────────────────────────
  const filSheet = wb.Sheets['Filières par etablissement'];
  const filRows = XLSX.utils.sheet_to_json<{
    ALL_ETAB: string;
    libf: string;
  }>(filSheet);

  const filSlugs = new Set<string>();
  let filCount = 0;
  let filSkipped = 0;
  console.log(`\n📚  Importing ${filRows.length} filières...`);

  for (let i = 0; i < filRows.length; i++) {
    const row = filRows[i];
    const etabNameAr = row.ALL_ETAB?.trim();
    const nameFr = row.libf?.trim();
    if (!nameFr || !etabNameAr) continue;

    const establishmentId = etabArToId.get(etabNameAr);
    if (!establishmentId) {
      filSkipped++;
      if (filSkipped <= 5) console.warn(`  ⚠️  Unknown establishment (AR): "${etabNameAr}"`);
      continue;
    }

    const slug = uniqueSlug(slugify(nameFr), filSlugs);
    await prisma.filiere.upsert({
      where: { slug },
      update: { nameFr, establishmentId },
      create: { nameFr, slug, establishmentId, displayOrder: i },
    });
    filCount++;
  }

  console.log(`✅ Filières: ${filCount} imported, ${filSkipped} skipped (unknown establishment)`);
  console.log('\n🎉 Import complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
