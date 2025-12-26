'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Compass, GraduationCap, FileText, Users } from 'lucide-react';

export default function Features() {
  const t = useTranslations('home.features');

  const features = [
    {
      icon: Compass,
      title: t('counseling.title'),
      description: t('counseling.description'),
      color: 'from-blue-600 to-blue-700',
    },
    {
      icon: GraduationCap,
      title: t('universities.title'),
      description: t('universities.description'),
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: FileText,
      title: t('application.title'),
      description: t('application.description'),
      color: 'from-amber-500 to-orange-400',
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
          >
            {t('title')}
          </motion.h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative rounded-2xl border border-gray-200 p-8 hover:shadow-xl transition-all duration-300"
            >
              <div className={`inline-flex rounded-xl bg-gradient-to-br ${feature.color} p-3 text-white shadow-lg`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                {feature.title}
              </h3>
              <p className="mt-2 text-gray-600">
                {feature.description}
              </p>
              {/* Decorative gradient */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
