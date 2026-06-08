import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface UniversityRow {
  nameFr: string;
  nameAr: string;
}

interface EstablishmentRow {
  universityNameFr: string;
  nameFr: string;
  nameAr: string;
}

interface ProgramRow {
  establishmentNameAr: string;
  nameFr: string;
  codeId?: string;
}

async function importFormations(filePath: string) {
  console.log(`\n📚 Starting import from: ${filePath}\n`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  try {
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    console.log(`✓ Excel file loaded. Sheets: ${workbook.SheetNames.join(', ')}`);

    // Parse Universities sheet
    console.log('\n1️⃣  Importing Universities...');
    const universitiesSheet = workbook.Sheets['Universites'];
    if (!universitiesSheet) {
      throw new Error('Sheet "Universites" not found');
    }

    const universitiesData: UniversityRow[] = [];
    const universitiesRaw = XLSX.utils.sheet_to_json<any>(universitiesSheet, {
      header: 0,
    });

    // Process universities (skip header rows)
    for (const row of universitiesRaw) {
      const values = Object.values(row) as string[];
      if (values.length >= 2 && values[0] && values[1]) {
        const nameFr = String(values[0]).trim();
        const nameAr = String(values[1]).trim();
        if (nameFr && nameAr && nameFr !== 'll_uni' && nameAr !== 'all_uni') {
          universitiesData.push({ nameFr, nameAr });
        }
      }
    }

    console.log(`  Found ${universitiesData.length} universities`);

    // Create or update universities
    const universitiesMap = new Map<string, string>(); // nameFr -> id
    for (const uni of universitiesData) {
      const existing = await prisma.university.findFirst({
        where: {
          AND: [{ nameFr: uni.nameFr }, { nameAr: uni.nameAr }],
        },
      });

      if (existing) {
        console.log(`  ℹ️  University already exists: ${uni.nameFr}`);
        universitiesMap.set(uni.nameFr, existing.id);
      } else {
        const created = await prisma.university.create({
          data: {
            nameFr: uni.nameFr,
            nameAr: uni.nameAr,
            active: true,
          },
        });
        console.log(`  ✅ Created university: ${uni.nameFr}`);
        universitiesMap.set(uni.nameFr, created.id);
      }
    }

    // Parse Establishments sheet
    console.log('\n2️⃣  Importing Establishments...');
    const establishmentsSheet =
      workbook.Sheets['Etablissements par Universite'];
    if (!establishmentsSheet) {
      throw new Error('Sheet "Etablissements par Universite" not found');
    }

    const establishmentsData: EstablishmentRow[] = [];
    const establishmentsRaw = XLSX.utils.sheet_to_json<any>(
      establishmentsSheet,
      { header: 0 }
    );

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
          establishmentsData.push({ universityNameFr, nameFr, nameAr });
        }
      }
    }

    console.log(`  Found ${establishmentsData.length} establishments`);

    // Create or update establishments
    const establishmentsMap = new Map<string, string>(); // nameAr -> id
    let createdCount = 0;
    let skippedCount = 0;

    for (const etab of establishmentsData) {
      const universityId = universitiesMap.get(etab.universityNameFr);
      if (!universityId) {
        console.warn(
          `  ⚠️  University not found for establishment: ${etab.nameFr}`
        );
        skippedCount++;
        continue;
      }

      const existing = await prisma.establishment.findFirst({
        where: {
          AND: [
            { nameFr: etab.nameFr },
            { nameAr: etab.nameAr },
            { universityId },
          ],
        },
      });

      if (existing) {
        console.log(`  ℹ️  Establishment already exists: ${etab.nameFr}`);
        establishmentsMap.set(etab.nameAr, existing.id);
      } else {
        const created = await prisma.establishment.create({
          data: {
            nameFr: etab.nameFr,
            nameAr: etab.nameAr,
            universityId,
            active: true,
          },
        });
        console.log(`  ✅ Created establishment: ${etab.nameFr}`);
        establishmentsMap.set(etab.nameAr, created.id);
        createdCount++;
      }
    }
    console.log(`  Summary: Created ${createdCount}, Skipped ${skippedCount}`);

    // Parse Programs sheet
    console.log('\n3️⃣  Importing Programs (Filières)...');
    const programsSheet = workbook.Sheets['Filières par etablissement'];
    if (!programsSheet) {
      throw new Error('Sheet "Filières par etablissement" not found');
    }

    const programsData: ProgramRow[] = [];
    const programsRaw = XLSX.utils.sheet_to_json<any>(programsSheet, {
      header: 0,
    });

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
          programsData.push({
            establishmentNameAr,
            nameFr,
            codeId,
          });
        }
      }
    }

    console.log(`  Found ${programsData.length} programs`);

    // Create or update programs
    let programsCreatedCount = 0;
    let programsSkippedCount = 0;

    for (const prog of programsData) {
      const establishmentId = establishmentsMap.get(prog.establishmentNameAr);
      if (!establishmentId) {
        console.warn(
          `  ⚠️  Establishment not found for program: ${prog.nameFr}`
        );
        programsSkippedCount++;
        continue;
      }

      const existing = await prisma.program.findFirst({
        where: {
          AND: [{ nameFr: prog.nameFr }, { establishmentId }],
        },
      });

      if (existing) {
        // Update codeId if provided
        if (prog.codeId && !existing.codeId) {
          await prisma.program.update({
            where: { id: existing.id },
            data: { codeId: prog.codeId },
          });
        }
        console.log(`  ℹ️  Program already exists: ${prog.nameFr}`);
      } else {
        await prisma.program.create({
          data: {
            nameFr: prog.nameFr,
            codeId: prog.codeId,
            establishmentId,
            active: true,
          },
        });
        console.log(`  ✅ Created program: ${prog.nameFr}`);
        programsCreatedCount++;
      }
    }
    console.log(
      `  Summary: Created ${programsCreatedCount}, Skipped ${programsSkippedCount}`
    );

    // Final statistics
    console.log('\n📊 Import Summary:');
    console.log('  ✅ Universities imported');
    console.log('  ✅ Establishments imported');
    console.log('  ✅ Programs imported');
    console.log('\n✨ Import completed successfully!');
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
const excelFilePath =
  process.argv[2] || './offres de formations.xlsx';
importFormations(excelFilePath).catch((error) => {
  console.error(error);
  process.exit(1);
});
