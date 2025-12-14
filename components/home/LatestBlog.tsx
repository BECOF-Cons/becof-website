'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, User } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BlogPost {
  id: string;
  titleEn: string;
  titleFr: string;
  excerptEn: string;
  excerptFr: string;
  slugEn: string;
  slugFr: string;
  coverImage: string | null;
  createdAt: string;
  author: {
    name: string | null;
  };
  category: {
    nameEn: string;
    nameFr: string;
  } | null;
}

export default function LatestBlog() {
  const t = useTranslations('blog');
  const locale = useLocale();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blog/latest')
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching blog posts:', err);
        setLoading(false);
      });
  }, []);

  // Mock blog posts as fallback
  const mockPosts = [
    {
      id: 1,
      title: locale === 'fr' 
        ? 'Guide Complet pour Choisir Votre Université en 2025'
        : 'Complete Guide to Choosing Your University in 2025',
      excerpt: locale === 'fr'
        ? 'Découvrez les critères essentiels pour sélectionner l\'université qui correspond le mieux à vos objectifs...'
        : 'Discover the essential criteria for selecting the university that best matches your goals...',
      image: '/images/blog-1.jpg',
      author: 'Sarah Ben Ali',
      date: '2024-12-10',
      category: 'Guide',
    },
    {
      id: 2,
      title: locale === 'fr'
        ? 'Les Métiers d\'Avenir en Tunisie'
        : 'Future Careers in Tunisia',
      excerpt: locale === 'fr'
        ? 'Explorez les secteurs en pleine croissance et les opportunités de carrière prometteuses...'
        : 'Explore growing sectors and promising career opportunities...',
      image: '/images/blog-2.jpg',
      author: 'Ahmed Mansour',
      date: '2024-12-08',
      category: 'Carrière',
    },
    {
      id: 3,
      title: locale === 'fr'
        ? 'Bourses d\'Études: Tout Ce Que Vous Devez Savoir'
        : 'Scholarships: Everything You Need to Know',
      excerpt: locale === 'fr'
        ? 'Un guide complet sur les opportunités de bourses disponibles pour les étudiants tunisiens...'
        : 'A comprehensive guide to scholarship opportunities available for Tunisian students...',
      image: '/images/blog-3.jpg',
      author: 'Leila Trabelsi',
      date: '2024-12-05',
      category: 'Financement',
    },
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
          >
            {t('title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-gray-600"
          >
            {t('subtitle')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {(posts.length > 0 ? posts : mockPosts).slice(0, 3).map((post, index) => {
            const isFrench = locale === 'fr';
            const isRealPost = 'slugEn' in post;
            const title = isRealPost ? (isFrench ? post.titleFr : post.titleEn) : post.title;
            const excerpt = isRealPost ? (isFrench ? post.excerptFr : post.excerptEn) : post.excerpt;
            const slug = isRealPost ? (isFrench ? post.slugFr : post.slugEn) : `post-${post.id}`;
            const image = isRealPost ? post.coverImage : post.image;
            const category = isRealPost && post.category ? (isFrench ? post.category.nameFr : post.category.nameEn) : (isRealPost ? 'Blog' : post.category);
            const author = isRealPost ? (post.author?.name || 'BECOF Team') : post.author;
            const date = isRealPost ? new Date(post.createdAt).toLocaleDateString(isFrench ? 'fr-FR' : 'en-US') : post.date;

            return (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative rounded-2xl bg-white overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <div className="aspect-video bg-gradient-to-br from-indigo-400 to-purple-400 relative overflow-hidden">
                {image && (
                  <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-600">
                    {category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {title}
                </h3>
                <p className="mt-3 text-gray-600 line-clamp-3">
                  {excerpt}
                </p>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{author}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{date}</span>
                  </div>
                </div>

                <Link
                  href={`/${locale}/blog/${slug}`}
                  className="mt-6 inline-flex items-center text-sm font-semibold text-indigo-600 group-hover:text-indigo-700"
                >
                  {t('readMore')}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.article>
          );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center rounded-full border-2 border-indigo-600 px-8 py-3 text-base font-semibold text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all"
          >
            {t('allPosts')}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
