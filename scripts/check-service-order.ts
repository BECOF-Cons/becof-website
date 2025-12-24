import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkServices() {
  const services = await prisma.service.findMany({
    orderBy: {
      displayOrder: 'asc',
    },
  });

  console.log('\n=== Current Services Order ===\n');
  services.forEach((service, index) => {
    console.log(`Position ${index + 1}: ${service.nameEn}`);
    console.log(`  - Display Order: ${service.displayOrder}`);
    console.log(`  - Active: ${service.active}`);
    console.log(`  - Service Type: ${service.serviceType}`);
    console.log('');
  });

  await prisma.$disconnect();
}

checkServices();
