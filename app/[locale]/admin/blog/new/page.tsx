import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper';
import BlogPostForm from '../BlogPostForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getAdminTranslations } from '@/lib/admin-translations';

export default async function NewBlogPostPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();

  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  if (!['ADMIN', 'SUPER_ADMIN'].includes((session.user as any)?.role)) {
    redirect(`/${locale}`);
  }

  const translations = await getAdminTranslations(locale);

  const categories = await prisma.blogCategory.findMany({
    orderBy: {
      nameEn: 'asc',
    },
  });

  return (
    <AdminLayoutWrapper user={session.user} title={translations.nav.blogPosts} locale={locale} translations={translations}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/blog"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {locale === 'fr' ? 'Nouvel Article de Blog' : 'New Blog Post'}
            </h1>
            <p className="text-gray-600 mt-1">
              {locale === 'fr' ? 'Créer un nouvel article de blog' : 'Create a new blog article'}
            </p>
          </div>
        </div>

        {/* Blog Post Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <BlogPostForm categories={categories} />
        </div>
      </div>
    </AdminLayoutWrapper>
  );
}
