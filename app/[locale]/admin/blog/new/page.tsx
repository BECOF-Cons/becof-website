import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper';
import BlogPostForm from '../BlogPostForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NewBlogPostPage() {
  const session = await auth();

  if (!session) {
    redirect('/admin/login');
  }

  if (!['ADMIN', 'SUPER_ADMIN'].includes((session.user as any)?.role)) {
    redirect('/');
  }

  const categories = await prisma.blogCategory.findMany({
    orderBy: {
      nameEn: 'asc',
    },
  });

  return (
    <AdminLayoutWrapper user={session.user} title="New Blog Post">
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
            <h1 className="text-3xl font-bold text-gray-900">New Blog Post</h1>
            <p className="text-gray-600 mt-1">Create a new blog article</p>
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
