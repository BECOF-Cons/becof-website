import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixServiceOrder() {
  console.log('Fetching all services...');
  
  const services = await prisma.service.findMany({
    orderBy: [
      { displayOrder: 'asc' },
      { createdAt: 'asc' },
    ],
  });

  console.log(`\nFound ${services.length} services. Reassigning display orders...\n`);

  for (let i = 0; i < services.length; i++) {
    const newOrder = i + 1;
    if (services[i].displayOrder !== newOrder) {
      console.log(`Updating "${services[i].nameEn}" from order ${services[i].displayOrder} to ${newOrder}`);
      await prisma.service.update({
        where: { id: services[i].id },
        data: { displayOrder: newOrder },
      });
    }
  }

  console.log('\n✓ All services have been reordered sequentially from 1.');
  
  // Show final order
  const updatedServices = await prisma.service.findMany({
    orderBy: {
      displayOrder: 'asc',
    },
  });

  console.log('\n=== Final Order ===\n');
  updatedServices.forEach((service, index) => {
    console.log(`${index + 1}. ${service.nameEn} (Order: ${service.displayOrder})`);
  });

  await prisma.$disconnect();
}

fixServiceOrder().catch(console.error);
