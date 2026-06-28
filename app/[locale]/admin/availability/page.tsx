import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAdminTranslations } from '@/lib/admin-translations';
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper';
import AvailabilityPanel from './AvailabilityPanel';

export default async function AvailabilityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();
  if (!session) redirect(`/${locale}/admin/login`);
  if (!['ADMIN', 'SUPER_ADMIN'].includes((session.user as any)?.role)) redirect(`/${locale}`);

  const translations = await getAdminTranslations(locale);

  return (
    <AdminLayoutWrapper user={session.user} title={locale === 'fr' ? 'Mes disponibilités' : 'My Availability'} locale={locale} translations={translations}>
      <AvailabilityPanel locale={locale} />
    </AdminLayoutWrapper>
  );
}
