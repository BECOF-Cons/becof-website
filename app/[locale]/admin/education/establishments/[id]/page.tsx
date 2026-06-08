import { getTranslations } from 'next-intl/server';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import EstablishmentForm from '../../EstablishmentForm';

export const metadata = {
  title: 'Edit Establishment - BECOF Admin',
  description: 'Edit establishment details',
};

export default async function EditEstablishmentPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/admin/login`);
  }

  const userRole = (session.user as any)?.role;
  if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
    redirect(`/${locale}/admin`);
  }

  const establishment = await prisma.establishment.findUnique({
    where: { id },
  });

  if (!establishment) {
    redirect(`/${locale}/admin/education`);
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <Link href={`/${locale}/admin/education`} className="text-blue-600 hover:text-blue-700">
              ← Back to Hierarchy
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-6">Edit Establishment</h1>
          <EstablishmentForm locale={locale} establishmentSeed={establishment} isEdit />
        </div>
      </div>
    </div>
  );
}
