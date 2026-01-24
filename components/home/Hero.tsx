'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Hero() {
  const t = useTranslations('home.hero');
  const locale = useLocale();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-orange-50 pt-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" style={{backgroundColor: '#F9AA04'}} />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" style={{backgroundColor: '#233691'}} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000" style={{backgroundColor: '#F9AA04'}} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 rounded-full px-4 py-2 text-sm font-medium mb-8 shadow-lg"
            style={{backgroundColor: 'rgba(35, 54, 145, 0.1)', color: '#233691'}}
          >
            <Sparkles className="h-4 w-4" />
            <span>{locale === 'fr' ? 'Orientation Scolaire et Universitaire Personnalisée' : 'Personalized Academic and University Guidance'}</span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl"
          >
            <span className="block">{t('title').split(' ').slice(0, 3).join(' ')}</span>
            <span className="block bg-gradient-to-r from-[#233691] to-[#233691] bg-clip-text text-transparent">
              {t('title').split(' ').slice(3).join(' ')}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl"
          >
            {t('subtitle')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href={`/${locale}/appointment`}
              className="group inline-flex items-center rounded-full px-8 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all"
              style={{background: 'linear-gradient(135deg, #233691 0%, #1a2870 100%)'}}
            >
              {t('cta')}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href={`/${locale}/blog`}
              className="inline-flex items-center rounded-full border-2 px-8 py-4 text-lg font-semibold transition-all hover:shadow-lg"
              style={{borderColor: '#F9AA04', color: '#F9AA04', backgroundColor: 'rgba(249, 170, 4, 0.05)'}}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(249, 170, 4, 0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(249, 170, 4, 0.05)'}
            >
              {t('secondaryCta')}
            </Link>
          </motion.div>

          {/* Stats Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl font-bold" style={{color: '#233691'}}>500+</div>
              <div className="mt-1 text-sm text-gray-600">{locale === 'fr' ? 'Étudiants' : 'Students'}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{color: '#F9AA04'}}>50+</div>
              <div className="text-sm text-gray-600">{locale === 'fr' ? 'Universités Partenaires' : 'Partner Universities'}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{color: '#233691'}}>95%</div>
              <div className="mt-1 text-sm text-gray-600">Satisfaction</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-gray-400 rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}
