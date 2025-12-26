import { getTranslations } from 'next-intl/server';

export async function getAdminTranslations(locale: string) {
  const t = await getTranslations({ locale, namespace: 'admin' });
  
  return {
    nav: {
      dashboard: t('nav.dashboard'),
      blogPosts: t('nav.blogPosts'),
      appointments: t('nav.appointments'),
      payments: t('nav.payments'),
      servicePricing: t('nav.servicePricing'),
      adminManagement: t('nav.adminManagement'),
      settings: t('nav.settings'),
    },
    welcome: t('welcome'),
    signOut: t('signOut'),
    title: t('title'),
  };
}

export type AdminTranslations = Awaited<ReturnType<typeof getAdminTranslations>>;
