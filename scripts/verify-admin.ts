import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function verifyAdmin() {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@becof.tn' }
    });

    if (!admin) {
      console.log('❌ Admin not found');
      await prisma.$disconnect();
      return;
    }

    console.log('📋 Admin details:');
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('Name:', admin.name);
    console.log('Created:', admin.createdAt);
    console.log('');
    
    // Test passwords
    const passwords = ['Admin123!', 'admin123', 'Admin123'];
    
    for (const pwd of passwords) {
      const matches = await bcrypt.compare(pwd, admin.password);
      console.log(`Password '${pwd}' matches:`, matches ? '✅' : '❌');
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
  }
}

verifyAdmin();
