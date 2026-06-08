import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

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
    if (!['SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Only SUPER_ADMIN can import data' },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read file buffer
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });

    const stats = {
      universities: { created: 0, updated: 0, skipped: 0 },
      establishments: { created: 0, updated: 0, skipped: 0 },
      programs: { created: 0, updated: 0, skipped: 0 },
    };

    // Parse Universities sheet
    const universitiesSheet = workbook.Sheets['Universites'];
    if (!universitiesSheet) {
      return NextResponse.json(
        { error: 'Sheet "Universites" not found' },
        { status: 400 }
      );
    }

    const universitiesRaw = XLSX.utils.sheet_to_json<any>(universitiesSheet, { header: 0 });
    const universitiesMap = new Map<string, string>();

    for (const row of universitiesRaw) {
      const values = Object.values(row) as string[];
      if (values.length >= 2 && values[0] && values[1]) {
        const nameFr = String(values[0]).trim();
        const nameAr = String(values[1]).trim();

        if (nameFr && nameAr && nameFr !== 'll_uni' && nameAr !== 'all_uni') {
          const existing = await prisma.university.findFirst({
            where: { AND: [{ nameFr }, { nameAr }] },
          });

          if (existing) {
            universitiesMap.set(nameFr, existing.id);
            stats.universities.updated++;
          } else {
            const created = await prisma.university.create({
              data: { nameFr, nameAr, active: true },
            });
            universitiesMap.set(nameFr, created.id);
            stats.universities.created++;
          }
        }
      }
    }

    // Parse Establishments sheet
    const establishmentsSheet = workbook.Sheets['Etablissements par Universite'];
    if (!establishmentsSheet) {
      return NextResponse.json(
        { error: 'Sheet "Etablissements par Universite" not found' },
        { status: 400 }
      );
    }

    const establishmentsRaw = XLSX.utils.sheet_to_json<any>(establishmentsSheet, { header: 0 });
    const establishmentsMap = new Map<string, string>();

    for (const row of establishmentsRaw) {
      const values = Object.values(row) as string[];
      if (values.length >= 3 && values[0] && values[1] && values[2]) {
        const universityNameFr = String(values[0]).trim();
        const nameFr = String(values[1]).trim();
        const nameAr = String(values[2]).trim();

        if (
          universityNameFr &&
          nameFr &&
          nameAr &&
          universityNameFr !== 'll_uni' &&
          nameFr !== 'LL_ETAB'
        ) {
          const universityId = universitiesMap.get(universityNameFr);
          if (!universityId) {
            stats.establishments.skipped++;
            continue;
          }

          const existing = await prisma.establishment.findFirst({
            where: {
              AND: [{ nameFr }, { nameAr }, { universityId }],
            },
          });

          if (existing) {
            establishmentsMap.set(nameAr, existing.id);
            stats.establishments.updated++;
          } else {
            const created = await prisma.establishment.create({
              data: { nameFr, nameAr, universityId, active: true },
            });
            establishmentsMap.set(nameAr, created.id);
            stats.establishments.created++;
          }
        }
      }
    }

    // Parse Programs sheet
    const programsSheet = workbook.Sheets['Filières par etablissement'];
    if (!programsSheet) {
      return NextResponse.json(
        { error: 'Sheet "Filières par etablissement" not found' },
        { status: 400 }
      );
    }

    const programsRaw = XLSX.utils.sheet_to_json<any>(programsSheet, { header: 0 });

    for (const row of programsRaw) {
      const values = Object.values(row) as string[];
      if (values.length >= 3 && values[0] && values[1]) {
        const establishmentNameAr = String(values[0]).trim();
        const codeId = values[1] ? String(values[1]).trim() : undefined;
        const nameFr = values[2] ? String(values[2]).trim() : undefined;

        if (
          establishmentNameAr &&
          nameFr &&
          establishmentNameAr !== 'ALL_ETAB' &&
          codeId !== 'Expr1002'
        ) {
          const establishmentId = establishmentsMap.get(establishmentNameAr);
          if (!establishmentId) {
            stats.programs.skipped++;
            continue;
          }

          const existing = await prisma.program.findFirst({
            where: { AND: [{ nameFr }, { establishmentId }] },
          });

          if (existing) {
            if (codeId && !existing.codeId) {
              await prisma.program.update({
                where: { id: existing.id },
                data: { codeId },
              });
            }
            stats.programs.updated++;
          } else {
            await prisma.program.create({
              data: {
                nameFr,
                codeId,
                establishmentId,
                active: true,
              },
            });
            stats.programs.created++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Data imported successfully',
      stats,
    });
  } catch (error) {
    console.error('Error importing data:', error);
    return NextResponse.json(
      { error: 'Failed to import data', details: String(error) },
      { status: 500 }
    );
  }
}
