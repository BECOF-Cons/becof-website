import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper';
import ServiceManagementClient from './ServiceManagementClient';

export default async function AdminPricingPage() {
  const session = await auth();

  if (!session) {
    redirect('/admin/login');
  }

  if (!['ADMIN', 'SUPER_ADMIN'].includes((session.user as any)?.role)) {
    redirect('/');
  }

  // Fetch all services
  const services = await prisma.service.findMany({
    orderBy: {
      displayOrder: 'asc',
    },
  });

  return (
    <AdminLayoutWrapper user={session.user} title="Service Management">
      <ServiceManagementClient initialServices={services} />
    </AdminLayoutWrapper>
  );
}
