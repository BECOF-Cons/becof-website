import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating blog categories...');

  try {
    const orientation = await prisma.blogCategory.create({
      data: {
        nameEn: 'Orientation',
        nameFr: 'Orientation',
        slugEn: 'orientation',
        slugFr: 'orientation',
      },
    });
    console.log('✅ Created:', orientation.nameEn);

    const career = await prisma.blogCategory.create({
      data: {
        nameEn: 'Career',
        nameFr: 'Carrière',
        slugEn: 'career',
        slugFr: 'carriere',
      },
    });
    console.log('✅ Created:', career.nameEn);

    const studies = await prisma.blogCategory.create({
      data: {
        nameEn: 'Studies',
        nameFr: 'Études',
        slugEn: 'studies',
        slugFr: 'etudes',
      },
    });
    console.log('✅ Created:', studies.nameEn);

    console.log('🎉 All categories created!');
  } catch (error) {
    console.error('Error creating categories:', error);
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
