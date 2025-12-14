import { useTranslations } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import Stats from '@/components/home/Stats';
import LatestBlog from '@/components/home/LatestBlog';
import CTA from '@/components/home/CTA';

export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return (
    <div className="flex flex-col">
      <Hero />
      <Features />
      <Stats />
      <LatestBlog />
      <CTA />
    </div>
  );
}
