import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper';
import { getAdminTranslations } from '@/lib/admin-translations';
import TeamMemberForm from '../../TeamMemberForm';

export default async function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const session = await auth();

  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  if (!['ADMIN', 'SUPER_ADMIN'].includes((session.user as any)?.role)) {
    redirect(`/${locale}`);
  }

  const translations = await getAdminTranslations(locale);

  const member = await prisma.teamMember.findUnique({
    where: { id },
  });

  if (!member) {
    redirect(`/${locale}/admin/team`);
  }

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
              {locale === 'fr' ? 'Modifier le Membre' : 'Edit Team Member'}
            </h1>
            <p className="text-gray-600 mt-1">
              {locale === 'fr' ? 'Mettre à jour les informations du membre' : 'Update team member information'}
            </p>
          </div>
        </div>

        {/* Team Member Form */}
        <TeamMemberForm 
          initialData={{
            id: member.id,
            nameFr: member.nameFr,
            nameEn: member.nameEn,
            titleFr: member.titleFr,
            titleEn: member.titleEn,
            bioFr: member.bioFr,
            bioEn: member.bioEn,
            image: member.image,
            displayOrder: member.displayOrder,
            active: member.active,
          }}
          locale={locale}
        />
      </div>
    </AdminLayoutWrapper>
  );
}
