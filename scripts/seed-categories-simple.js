const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Creating blog categories...');

  // Create categories
  await prisma.blogCategory.create({
    data: {
      nameEn: 'Orientation',
      nameFr: 'Orientation',
      slugEn: 'orientation',
      slugFr: 'orientation',
    },
  });

  await prisma.blogCategory.create({
    data: {
      nameEn: 'Career',
      nameFr: 'Carrière',
      slugEn: 'career',
      slugFr: 'carriere',
    },
  });

  await prisma.blogCategory.create({
    data: {
      nameEn: 'Studies',
      nameFr: 'Études',
      slugEn: 'studies',
      slugFr: 'etudes',
    },
  });

  console.log('✅ Categories created!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
