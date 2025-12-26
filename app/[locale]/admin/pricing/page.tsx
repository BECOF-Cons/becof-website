import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper';
import ServiceManagementClient from './ServiceManagementClient';
import { getAdminTranslations } from '@/lib/admin-translations';

export default async function AdminPricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();

  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  if (!['ADMIN', 'SUPER_ADMIN'].includes((session.user as any)?.role)) {
    redirect(`/${locale}`);
  }

  const translations = await getAdminTranslations(locale);

  // Fetch all services
  const services = await prisma.service.findMany({
    orderBy: {
      displayOrder: 'asc',
    },
  });

  return (
    <AdminLayoutWrapper user={session.user} title={translations.nav.servicePricing} locale={locale} translations={translations}>
      <ServiceManagementClient initialServices={services} />
    </AdminLayoutWrapper>
  );
}
