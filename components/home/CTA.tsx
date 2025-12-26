'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function CTA() {
  const t = useTranslations('nav');
  const locale = useLocale();

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#233691] via-[#1a2870] to-[#F9AA04] animate-gradient"></div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            {locale === 'fr' 
              ? 'Prêt à Commencer Votre Parcours?'
              : 'Ready to Start Your Journey?'}
          </h2>
          <p className="mt-4 text-lg max-w-2xl mx-auto" style={{color: 'rgba(255, 255, 255, 0.9)'}}>
            {locale === 'fr'
              ? 'Réservez une consultation gratuite et découvrez comment nous pouvons vous aider à atteindre vos objectifs universitaires.'
              : 'Book a free consultation and discover how we can help you achieve your university goals.'}
          </p>
          <div className="mt-10">
            <Link
              href={`/${locale}/appointment`}
              className="group inline-flex items-center rounded-full bg-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all"
              style={{color: '#F9AA04'}}
            >
              {t('bookAppointment')}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
