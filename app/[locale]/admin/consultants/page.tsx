import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAdminTranslations } from '@/lib/admin-translations';
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper';
import ConsultantsAdminPanel from './ConsultantsAdminPanel';

export default async function ConsultantsAdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();
  if (!session) redirect(`/${locale}/admin/login`);
  if ((session.user as any)?.role !== 'SUPER_ADMIN') redirect(`/${locale}/admin`);

  const translations = await getAdminTranslations(locale);

  return (
    <AdminLayoutWrapper user={session.user} title="Consultants" locale={locale} translations={translations}>
      <ConsultantsAdminPanel locale={locale} />
    </AdminLayoutWrapper>
  );
}
