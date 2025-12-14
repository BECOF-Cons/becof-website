/**
 * Script to create a new admin user
 * Usage: npx tsx scripts/create-admin.ts <email> <password> <name>
 * Example: npx tsx scripts/create-admin.ts john@becof.tn securepass123 "John Doe"
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin(email: string, password: string, name: string) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.error(`❌ User with email ${email} already exists`);
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log(`Email: ${admin.email}`);
    console.log(`Name: ${admin.name}`);
    console.log(`Role: ${admin.role}`);
    console.log('\n📝 Login credentials:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get command line arguments
const [email, password, name] = process.argv.slice(2);

if (!email || !password || !name) {
  console.error('❌ Usage: npx tsx scripts/create-admin.ts <email> <password> <name>');
  console.error('Example: npx tsx scripts/create-admin.ts john@becof.tn securepass123 "John Doe"');
  process.exit(1);
}

createAdmin(email, password, name);
