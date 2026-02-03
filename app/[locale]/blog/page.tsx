import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';

// Revalidate every 60 seconds so new blogs appear quickly
export const revalidate = 60;

interface BlogPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;
  const isFrench = locale === 'fr';

  const posts = await prisma.blogPost.findMany({
    where: {
      published: true,
    },
    include: {
      category: true,
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: [
      { publishedAt: 'desc' },
      { createdAt: 'desc' }
    ],
  });

  const categories = await prisma.blogCategory.findMany({
    orderBy: {
      nameFr: 'asc',
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="text-white py-32 mt-24" style={{background: 'linear-gradient(135deg, #2d5aa8 0%, #1e3a7a 100%)'}}>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {isFrench ? 'Notre Blog' : 'Our Blog'}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {isFrench
              ? 'Conseils, guides et actualités sur l\'orientation et les études'
              : 'Tips, guides and news about orientation and studies'}
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="bg-white rounded-lg shadow-md p-4 max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button className="px-4 py-2 text-white rounded-lg font-medium" style={{backgroundColor: '#233691'}}>
              {isFrench ? 'Tous' : 'All'}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {isFrench ? cat.nameFr : cat.nameEn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="container mx-auto px-4 py-16">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              {isFrench ? 'Aucun article pour le moment' : 'No articles yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {posts.map((post) => {
              const title = isFrench ? post.titleFr : post.titleEn;
              const excerpt = isFrench ? post.excerptFr : post.excerptEn;
              const categoryName = post.category
                ? (isFrench ? post.category.nameFr : post.category.nameEn)
                : (isFrench ? 'Non catégorisé' : 'Uncategorized');
              // Use the appropriate slug, with fallback to the other language's slug if needed
              const slug = isFrench ? (post.slugFr || post.slugEn) : (post.slugEn || post.slugFr);
              
              // Skip if no valid slug exists
              if (!slug) return null;
              
              const publishDate = post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString(
                    locale === 'fr' ? 'fr-FR' : 'en-US',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }
                  )
                : '';

              return (
                <Link
                  key={post.id}
                  href={`/${locale}/blog/${slug}`}
                  className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                >
                  {post.coverImage && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-medium px-2 py-1 rounded" style={{backgroundColor: 'rgba(249, 170, 4, 0.15)', color: '#F9AA04'}}>
                        {categoryName}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar size={14} />
                        <span>{publishDate}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#233691] transition-colors">
                      {title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{excerpt}</p>
                    <div className="flex items-center font-medium" style={{color: '#233691'}}>
                      {isFrench ? 'Lire plus' : 'Read more'}
                      <ArrowRight
                        size={16}
                        className="ml-2 group-hover:translate-x-1 transition-transform"
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: BlogPageProps) {
  const { locale } = await params;
  const isFrench = locale === 'fr';

  return {
    title: isFrench ? 'Blog | BECOF' : 'Blog | BECOF',
    description: isFrench
      ? 'Découvrez nos articles sur l\'orientation, les études et les carrières'
      : 'Discover our articles about orientation, studies and careers',
  };
}
