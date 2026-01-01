import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper';
import { getAdminTranslations } from '@/lib/admin-translations';
import DeleteTeamMemberButton from './DeleteTeamMemberButton';

// Convert Google Drive share links to direct image URLs
const convertGoogleDriveUrl = (url: string): string => {
  if (!url) return url;
  
  const patterns = [
    /drive\.google\.com\/file\/d\/([^/]+)/,
    /drive\.google\.com\/open\?id=([^&]+)/,
    /drive\.google\.com\/uc\?id=([^&]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
    }
  }
  
  return url;
};

export default async function TeamManagementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();

  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  if (!['ADMIN', 'SUPER_ADMIN'].includes((session.user as any)?.role)) {
    redirect(`/${locale}`);
  }

  const translations = await getAdminTranslations(locale);

  const teamMembers = await prisma.teamMember.findMany({
    orderBy: {
      displayOrder: 'asc',
    },
  });

  return (
    <AdminLayoutWrapper user={session.user} title="Team Management / Gestion de l'Équipe" locale={locale} translations={translations}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {locale === 'fr' ? 'Gestion de l\'Équipe' : 'Team Management'}
            </h1>
            <p className="text-gray-600 mt-1">
              {locale === 'fr' 
                ? 'Gérez les membres de votre équipe affichés sur la page À propos'
                : 'Manage team members displayed on the About page'}
            </p>
          </div>
          <Link
            href={`/${locale}/admin/team/new`}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all"
            style={{background: 'linear-gradient(135deg, #233691 0%, #1a2870 100%)'}}
          >
            <Plus size={20} />
            {locale === 'fr' ? 'Ajouter un Membre' : 'Add Member'}
          </Link>
        </div>

        {/* Team Members Table */}
        {teamMembers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Users size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {locale === 'fr' ? 'Aucun membre d\'équipe' : 'No team members'}
            </h3>
            <p className="text-gray-600 mb-6">
              {locale === 'fr'
                ? 'Commencez par ajouter votre premier membre d\'équipe'
                : 'Start by adding your first team member'}
            </p>
            <Link
              href={`/${locale}/admin/team/new`}
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-all"
              style={{background: 'linear-gradient(135deg, #233691 0%, #1a2870 100%)'}}
            >
              <Plus size={20} />
              {locale === 'fr' ? 'Ajouter un Membre' : 'Add Member'}
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'fr' ? 'Membre' : 'Member'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'fr' ? 'Titre' : 'Title'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'fr' ? 'Ordre' : 'Order'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'fr' ? 'Statut' : 'Status'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'fr' ? 'Actions' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={convertGoogleDriveUrl(member.image)}
                          alt={member.nameEn}
                          className="w-12 h-12 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{member.nameFr}</p>
                          <p className="text-sm text-gray-500">{member.nameEn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{member.titleFr}</p>
                      <p className="text-xs text-gray-500">{member.titleEn}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {member.displayOrder}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          member.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {member.active
                          ? (locale === 'fr' ? 'Actif' : 'Active')
                          : (locale === 'fr' ? 'Inactif' : 'Inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/${locale}/admin/team/edit/${member.id}`}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                          title="Edit member"
                        >
                          <Edit size={18} />
                        </Link>
                        <DeleteTeamMemberButton 
                          memberId={member.id} 
                          memberName={member.nameEn} 
                          locale={locale}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayoutWrapper>
  );
}
