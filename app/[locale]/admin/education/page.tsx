import { getTranslations } from 'next-intl/server';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper';
import EducationHierarchy from './EducationHierarchy';

export const metadata = {
  title: 'Education Hierarchy - BECOF Admin',
  description: 'Manage universities, establishments, and programs',
};

export default async function EducationPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/admin/login`);
  }

  const userRole = (session.user as any)?.role;
  if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
    redirect(`/${locale}/admin`);
  }

  const t = await getTranslations();

  const translations = {
    nav: {
      dashboard: t('admin.nav.dashboard'),
      blogPosts: t('admin.nav.blogPosts'),
      appointments: t('admin.nav.appointments'),
      payments: t('admin.nav.payments'),
      servicePricing: t('admin.nav.servicePricing'),
      adminManagement: t('admin.nav.adminManagement'),
      settings: t('admin.nav.settings'),
    },
    title: 'Education Hierarchy',
  };

  return (
    <AdminLayoutWrapper
      user={session.user}
      title={translations.title}
      locale={locale}
      translations={translations as any}
    >
      <EducationHierarchy locale={locale} />
    </AdminLayoutWrapper>
  );
}
