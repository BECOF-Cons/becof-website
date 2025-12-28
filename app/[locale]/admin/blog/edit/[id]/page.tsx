import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper';
import BlogPostForm from '../../BlogPostForm';
import { getAdminTranslations } from '@/lib/admin-translations';

export default async function EditBlogPostPage({
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

  const post = await prisma.blogPost.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      image: true,
      published: true,
      authorId: true,
      createdAt: true,
      updatedAt: true,
      titleFr: true,
      excerptFr: true,
      contentFr: true,
    },
  });

  if (!post) {
    redirect('/admin/blog');
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Edit Blog Post</h1>
            <p className="text-gray-600 mt-1">Update your blog content</p>
          </div>
        </div>

        {/* Blog Post Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <BlogPostForm
            categories={categories}
            initialData={{
              id: post.id,
              titleEn: post.titleEn,
              titleFr: post.titleFr,
              contentEn: post.contentEn,
              contentFr: post.contentFr,
              excerptEn: post.excerptEn,
              excerptFr: post.excerptFr,
              slugEn: post.slugEn,
              slugFr: post.slugFr,
              coverImage: post.coverImage,
              categoryId: post.categoryId,
              published: post.published,
            }}
          />
        </div>
      </div>
    </AdminLayoutWrapper>
  );
}
