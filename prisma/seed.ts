import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@becof.tn' },
    update: {
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
    create: {
      email: 'admin@becof.tn',
      name: 'Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create sample blog categories
  const categoryOrientation = await prisma.blogCategory.upsert({
    where: { slugEn: 'orientation' },
    update: {},
    create: {
      nameEn: 'Orientation',
      nameFr: 'Orientation',
      slugEn: 'orientation',
      slugFr: 'orientation',
    },
  });

  const categoryCareer = await prisma.blogCategory.upsert({
    where: { slugEn: 'career' },
    update: {},
    create: {
      nameEn: 'Career',
      nameFr: 'Carrière',
      slugEn: 'career',
      slugFr: 'carriere',
    },
  });

  const categoryStudies = await prisma.blogCategory.upsert({
    where: { slugEn: 'studies' },
    update: {},
    create: {
      nameEn: 'Studies',
      nameFr: 'Études',
      slugEn: 'studies',
      slugFr: 'etudes',
    },
  });

  console.log('✅ Blog categories created');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
