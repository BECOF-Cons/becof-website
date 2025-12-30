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
    dashboard: {
      stats: {
        totalPosts: t('dashboard.stats.totalPosts'),
        totalAppointments: t('dashboard.stats.totalAppointments'),
        totalRevenue: t('dashboard.stats.totalRevenue'),
        activeUsers: t('dashboard.stats.activeUsers'),
      },
      quickActions: {
        title: t('dashboard.quickActions.title'),
        newPost: t('dashboard.quickActions.newPost'),
        newPostDesc: t('dashboard.quickActions.newPostDesc'),
        viewAppointments: t('dashboard.quickActions.viewAppointments'),
        viewAppointmentsDesc: t('dashboard.quickActions.viewAppointmentsDesc'),
        settings: t('dashboard.quickActions.settings'),
        settingsDesc: t('dashboard.quickActions.settingsDesc'),
      },
      gettingStarted: {
        title: t('dashboard.gettingStarted.title'),
        step1Title: t('dashboard.gettingStarted.step1Title'),
        step1Desc: t('dashboard.gettingStarted.step1Desc'),
        step2Title: t('dashboard.gettingStarted.step2Title'),
        step2Desc: t('dashboard.gettingStarted.step2Desc'),
        step3Title: t('dashboard.gettingStarted.step3Title'),
        step3Desc: t('dashboard.gettingStarted.step3Desc'),
      },
    },
  };
}

export type AdminTranslations = Awaited<ReturnType<typeof getAdminTranslations>>;
