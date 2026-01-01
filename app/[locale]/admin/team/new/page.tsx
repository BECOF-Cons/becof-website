import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper';
import { getAdminTranslations } from '@/lib/admin-translations';
import TeamMemberForm from '../TeamMemberForm';

export default async function NewTeamMemberPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();

  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  if (!['ADMIN', 'SUPER_ADMIN'].includes((session.user as any)?.role)) {
    redirect(`/${locale}`);
  }

  const translations = await getAdminTranslations(locale);

  return (
    <AdminLayoutWrapper user={session.user} title="Team Management / Gestion de l'Équipe" locale={locale} translations={translations}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/admin/team`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {locale === 'fr' ? 'Ajouter un Membre' : 'Add Team Member'}
            </h1>
            <p className="text-gray-600 mt-1">
              {locale === 'fr' ? 'Créer un nouveau membre de l\'équipe' : 'Create a new team member'}
            </p>
          </div>
        </div>

        {/* Team Member Form */}
        <TeamMemberForm locale={locale} />
      </div>
    </AdminLayoutWrapper>
  );
}
