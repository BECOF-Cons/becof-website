'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Heart } from 'lucide-react';

export default function Stats() {
  const t = useTranslations('home.stats');

  const stats = [
    {
      value: '500+',
      label: t('students'),
      icon: TrendingUp,
      color: '#233691',
    },
    {
      value: '50+',
      label: t('universities'),
      icon: Award,
      color: '#F9AA04',
    },
    {
      value: '95%',
      label: t('successRate'),
      icon: Heart,
      color: '#233691',
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#233691] via-[#1a2870] to-[#233691] animate-gradient"></div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 p-8 text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-white p-3">
                  <stat.icon className="h-8 w-8" style={{color: stat.color}} />
                </div>
              </div>
              <div className="text-5xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-lg text-white/80">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
