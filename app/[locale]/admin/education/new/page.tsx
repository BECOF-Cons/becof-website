import { getTranslations } from 'next-intl/server';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import UniversityForm from '../UniversityForm';

export const metadata = {
  title: 'Create University - BECOF Admin',
  description: 'Create a new university',
};

export default async function NewUniversityPage({
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <Link href={`/${locale}/admin/education`} className="text-blue-600 hover:text-blue-700">
              ← Back to Hierarchy
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-6">Create New University</h1>
          <UniversityForm locale={locale} />
        </div>
      </div>
    </div>
  );
}
