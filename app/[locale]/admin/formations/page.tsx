import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAdminTranslations } from '@/lib/admin-translations';
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper';
import FormationsAdminTree from './FormationsAdminTree';

export default async function FormationsAdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();

  if (!session) redirect(`/${locale}/admin/login`);
  if (!['ADMIN', 'SUPER_ADMIN'].includes((session.user as any)?.role)) redirect(`/${locale}`);

  const translations = await getAdminTranslations(locale);

  return (
    <AdminLayoutWrapper
      user={session.user}
      title={translations.nav.formations}
      locale={locale}
      translations={translations}
    >
      <FormationsAdminTree locale={locale} />
    </AdminLayoutWrapper>
  );
}
