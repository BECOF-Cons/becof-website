import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Admin123!', 10);

  const users = [
    { name: 'Super Admin', email: 'superadmin@becof.local', role: 'SUPER_ADMIN' as const },
    { name: 'Helmi Boussetta', email: 'helmi@becof.local', role: 'ADMIN' as const },
    { name: 'Sarah Ben Ali', email: 'sarah@becof.local', role: 'ADMIN' as const },
    { name: 'Youssef Mansour', email: 'youssef@becof.local', role: 'ADMIN' as const },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password, emailVerified: new Date() },
    });
    console.log(`✅ ${u.role}: ${u.email}`);
  }

  console.log('\nAll users created. Password for all: Admin123!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
