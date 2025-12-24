import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding services...');

  // Create default services
  const services = [
    {
      nameEn: 'Orientation Session',
      nameFr: 'Séance d\'orientation',
      descriptionEn: 'Individual career guidance and orientation session',
      descriptionFr: 'Séance d\'orientation et de conseil en carrière individuelle',
      price: '150',
      serviceType: 'ORIENTATION_SESSION',
      active: true,
      displayOrder: 1,
    },
    {
      nameEn: 'University Selection',
      nameFr: 'Sélection universitaire',
      descriptionEn: 'Help with selecting the right university and program',
      descriptionFr: 'Aide à la sélection de la bonne université et du bon programme',
      price: '200',
      serviceType: 'UNIVERSITY_SELECTION',
      active: true,
      displayOrder: 2,
    },
    {
      nameEn: 'Application Help',
      nameFr: 'Aide aux candidatures',
      descriptionEn: 'Assistance with university and job applications',
      descriptionFr: 'Assistance pour les candidatures universitaires et professionnelles',
      price: '180',
      serviceType: 'APPLICATION_HELP',
      active: true,
      displayOrder: 3,
    },
    {
      nameEn: 'Career Counseling',
      nameFr: 'Conseil en carrière',
      descriptionEn: 'In-depth career counseling and development planning',
      descriptionFr: 'Conseil en carrière approfondi et planification du développement',
      price: '200',
      serviceType: 'CAREER_COUNSELING',
      active: true,
      displayOrder: 4,
    },
    {
      nameEn: 'Career Coaching',
      nameFr: 'Coaching de carrière',
      descriptionEn: 'Personalized career coaching program',
      descriptionFr: 'Programme de coaching de carrière personnalisé',
      price: 'Sur devis',
      serviceType: 'CAREER_COACHING',
      active: true,
      displayOrder: 5,
    },
    {
      nameEn: 'Group Workshop',
      nameFr: 'Atelier de groupe',
      descriptionEn: 'Interactive group workshop sessions',
      descriptionFr: 'Séances d\'atelier de groupe interactives',
      price: '80',
      serviceType: 'GROUP_WORKSHOP',
      active: true,
      displayOrder: 6,
    },
    {
      nameEn: 'Follow-up Session',
      nameFr: 'Séance de suivi',
      descriptionEn: 'Follow-up session after initial consultation',
      descriptionFr: 'Séance de suivi après la consultation initiale',
      price: '100',
      serviceType: 'FOLLOW_UP_SESSION',
      active: true,
      displayOrder: 7,
    },
  ];

  for (const service of services) {
    try {
      await prisma.service.upsert({
        where: { serviceType: service.serviceType },
        update: service,
        create: service,
      });
      console.log(`✅ Created/Updated service: ${service.nameEn}`);
    } catch (error) {
      console.error(`❌ Error creating service ${service.nameEn}:`, error);
    }
  }

  console.log('✨ Services seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
