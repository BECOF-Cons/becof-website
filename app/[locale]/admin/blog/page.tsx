import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper';
import { Edit, Trash2, Plus, Eye } from 'lucide-react';
import { getAdminTranslations } from '@/lib/admin-translations';
import { getTranslations } from 'next-intl/server';
import DeleteBlogButton from './DeleteBlogButton';
import TogglePublishButton from './TogglePublishButton';

export default async function BlogManagementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();

  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  if (!['ADMIN', 'SUPER_ADMIN'].includes((session.user as any)?.role)) {
    redirect(`/${locale}`);
  }

  const translations = await getAdminTranslations(locale);
  const t = await getTranslations({ locale, namespace: 'admin' });

  const posts = await prisma.blogPost.findMany({
    include: {
      category: true,
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <AdminLayoutWrapper user={session.user} title={translations.nav.blogPosts} locale={locale} translations={translations}>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('blog.title')}</h1>
          <p className="text-gray-600 mt-1">{t('blog.subtitle')}</p>
        </div>
        <Link
          href={`/${locale}/admin/blog/new`}
          className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors"
        >
          <Plus size={20} />
          {t('blog.createNew')}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Posts</p>
          <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Published</p>
          <p className="text-2xl font-bold text-green-600">
            {posts.filter((p) => p.published).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Drafts</p>
          <p className="text-2xl font-bold text-yellow-600">
            {posts.filter((p) => !p.published).length}
          </p>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">{t('blog.noPosts')}</p>
            <Link
              href={`/${locale}/admin/blog/new`}
              className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700"
            >
              <Plus size={20} />
              {t('blog.createNew')}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('blog.table.title')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('blog.table.category')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('blog.table.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('blog.table.author')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('blog.table.date')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('blog.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {post.coverImage && (
                          <img
                            src={post.coverImage}
                            alt=""
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{post.titleFr}</p>
                          <p className="text-sm text-gray-500">{post.titleEn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {post.category ? (
                        <span className="px-2 py-1 bg-gray-100 rounded">
                          {post.category.nameFr}
                        </span>
                      ) : (
                        <span className="text-gray-400">No category</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          post.published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {post.published ? t('blog.status.published') : t('blog.status.draft')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {post.author.name || post.author.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <TogglePublishButton
                          postId={post.id}
                          currentStatus={post.published}
                          locale={locale}
                        />
                        {post.published && (
                          <Link
                            href={`/${locale}/blog/${post.slugFr}`}
                            target="_blank"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View post"
                          >
                            <Eye size={18} />
                          </Link>
                        )}
                        <Link
                          href={`/${locale}/admin/blog/edit/${post.id}`}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                          title="Edit post"
                        >
                          <Edit size={18} />
                        </Link>
                        <DeleteBlogButton 
                          postId={post.id} 
                          postTitle={post.titleEn} 
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
      </div>
    </AdminLayoutWrapper>
  );
}
