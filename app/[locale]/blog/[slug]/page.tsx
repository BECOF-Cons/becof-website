import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, Tag, ArrowLeft } from 'lucide-react';

interface BlogPostPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  const isFrench = locale === 'fr';

  const post = await prisma.blogPost.findUnique({
    where: isFrench ? { slugFr: slug } : { slugEn: slug },
    include: {
      category: true,
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!post || !post.published) {
    notFound();
  }
  const title = isFrench ? post.titleFr : post.titleEn;
  const content = isFrench ? post.contentFr : post.contentEn;
  const categoryName = post.category ? (isFrench ? post.category.nameFr : post.category.nameEn) : 'Uncategorized';

  // Parse tags
  const tags = post.tags ? post.tags.split(',').map((t) => t.trim()) : [];

  // Format date
  const publishDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  // Calculate reading time (rough estimate: 200 words per minute)
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            {locale === 'fr' ? 'Retour au blog' : 'Back to blog'}
          </Link>
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                {categoryName}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{title}</h1>
            <div className="flex flex-wrap items-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>{publishDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} />
                <span>
                  {readingTime} {locale === 'fr' ? 'min de lecture' : 'min read'}
                </span>
              </div>
              {post.author.name && (
                <div>
                  {locale === 'fr' ? 'Par' : 'By'} {post.author.name}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {post.coverImage && (
        <div className="container mx-auto px-4 -mt-10 mb-12">
          <img
            src={post.coverImage}
            alt={title}
            className="w-full max-w-4xl mx-auto rounded-lg shadow-2xl"
          />
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <article
            className="prose prose-lg max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Tags */}
          {tags.length > 0 && (
            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag size={20} className="text-gray-400" />
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  const isFrench = locale === 'fr';

  const post = await prisma.blogPost.findUnique({
    where: isFrench ? { slugFr: slug } : { slugEn: slug },
  });

  if (!post || !post.published) {
    return {};
  }
  const title = isFrench ? post.titleFr : post.titleEn;
  const excerpt = isFrench ? post.excerptFr : post.excerptEn;

  return {
    title: `${title} | BECOF`,
    description: excerpt,
    openGraph: {
      title,
      description: excerpt,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}
