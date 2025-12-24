import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper';
import AdminManagementClient from './AdminManagementClient';

export default async function AdminManagementPage() {
  const session = await auth();

  if (!session) {
    redirect('/admin/login');
  }

  if ((session.user as any)?.role !== 'SUPER_ADMIN') {
    redirect('/admin');
  }

  // Fetch admins and pending invitations
  const admins = await prisma.user.findMany({
    where: {
      role: {
        in: ['ADMIN', 'SUPER_ADMIN'],
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const pendingInvitations = await prisma.adminInvitation.findMany({
    where: {
      used: false,
      expiresAt: {
        gt: new Date(),
      },
    },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      expiresAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <AdminLayoutWrapper user={session.user} title="Admin Management">
      <AdminManagementClient 
        initialAdmins={admins} 
        initialInvitations={pendingInvitations}
        currentUserId={session.user.id!}
      />
    </AdminLayoutWrapper>
  );
}
