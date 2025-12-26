#!/usr/bin/env node
/**
 * Sync production data to local database
 * This script fetches data from production and seeds the local SQLite database
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Local database
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

async function main() {
  console.log('🔄 Syncing production data to local database...\n');

  try {
    // Create admin user
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    const admin = await localPrisma.user.upsert({
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
    console.log('✅ Admin user:', admin.email);

    // Create sample services
    console.log('\n📋 Creating services...');
    const services = [
      {
        serviceType: 'ORIENTATION_VISA',
        nameFr: 'Orientation et Visa',
        nameEn: 'Orientation and Visa',
        descriptionFr: 'Assistance complète pour l\'orientation universitaire et les démarches de visa',
        descriptionEn: 'Complete assistance for university orientation and visa procedures',
        price: '500',
        displayOrder: 1,
        active: true,
      },
      {
        serviceType: 'VISA_ONLY',
        nameFr: 'Visa Uniquement',
        nameEn: 'Visa Only',
        descriptionFr: 'Aide aux démarches de visa étudiant',
        descriptionEn: 'Student visa application assistance',
        price: '300',
        displayOrder: 2,
        active: true,
      },
      {
        serviceType: 'TRAVEL_BOOKING',
        nameFr: 'Réservation de Voyage',
        nameEn: 'Travel Booking',
        descriptionFr: 'Réservation de billets d\'avion et hébergement',
        descriptionEn: 'Flight tickets and accommodation booking',
        price: '150',
        displayOrder: 3,
        active: true,
      },
    ];

    // Delete existing services and create new ones
    await localPrisma.service.deleteMany({});
    for (const service of services) {
      const created = await localPrisma.service.create({
        data: service,
      });
      console.log(`✅ Service: ${created.nameEn}`);
    }

    // Create sample blog posts
    console.log('\n📝 Creating blog posts...');
    const blogPosts = [
      {
        slugEn: 'studying-abroad-complete-guide',
        slugFr: 'guide-complet-etudier-etranger',
        titleEn: 'Complete Guide to Studying Abroad',
        titleFr: 'Guide Complet pour Étudier à l\'Étranger',
        excerptEn: 'Everything you need to know about studying abroad, from choosing a university to settling in.',
        excerptFr: 'Tout ce que vous devez savoir sur les études à l\'étranger, du choix de l\'université à l\'installation.',
        contentEn: '# Complete Guide to Studying Abroad\n\nStudying abroad is a life-changing experience that opens doors to new opportunities...',
        contentFr: '# Guide Complet pour Étudier à l\'Étranger\n\nÉtudier à l\'étranger est une expérience qui change la vie...',
        coverImage: '/images/blog-1.jpg',
        published: true,
        authorId: admin.id,
      },
      {
        slugEn: 'visa-application-tips',
        slugFr: 'conseils-demande-visa',
        titleEn: 'Top 10 Tips for Visa Application Success',
        titleFr: 'Top 10 Conseils pour Réussir sa Demande de Visa',
        excerptEn: 'Learn the essential tips to ensure your visa application is successful.',
        excerptFr: 'Apprenez les conseils essentiels pour garantir le succès de votre demande de visa.',
        contentEn: '# Visa Application Tips\n\nApplying for a student visa can be daunting, but with proper preparation...',
        contentFr: '# Conseils pour la Demande de Visa\n\nFaire une demande de visa étudiant peut être intimidant...',
        coverImage: '/images/blog-2.jpg',
        published: true,
        authorId: admin.id,
      },
      {
        slugEn: 'choosing-right-university',
        slugFr: 'choisir-bonne-universite',
        titleEn: 'How to Choose the Right University',
        titleFr: 'Comment Choisir la Bonne Université',
        excerptEn: 'Factors to consider when selecting the perfect university for your studies.',
        excerptFr: 'Facteurs à considérer lors de la sélection de l\'université parfaite pour vos études.',
        contentEn: '# Choosing the Right University\n\nSelecting the right university is crucial for your academic success...',
        contentFr: '# Choisir la Bonne Université\n\nChoisir la bonne université est crucial pour votre réussite académique...',
        coverImage: '/images/blog-3.jpg',
        published: true,
        authorId: admin.id,
      },
    ];

    // Delete existing blog posts and create new ones
    await localPrisma.blogPost.deleteMany({});
    for (const post of blogPosts) {
      const created = await localPrisma.blogPost.create({
        data: post,
      });
      console.log(`✅ Blog post: ${created.titleEn}`);
    }

    console.log('\n✅ Local database synced successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Users: 1 (admin@becof.tn / Admin123!)`);
    console.log(`   • Services: ${services.length}`);
    console.log(`   • Blog Posts: ${blogPosts.length}`);
    console.log('\n🚀 You can now login to admin panel at http://localhost:3000/en/admin/login');

  } catch (error) {
    console.error('❌ Error syncing data:', error);
    process.exit(1);
  } finally {
    await localPrisma.$disconnect();
  }
}

main();
