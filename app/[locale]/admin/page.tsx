import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { getTranslations } from 'next-intl/server';

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();

  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role as string)) {
    redirect(`/${locale}`);
  }

  // Get translations
  const t = await getTranslations({ locale, namespace: 'admin' });

  // Fetch real statistics
  const [appointments, payments, users, blogPosts] = await Promise.all([
    prisma.appointment.count(),
    prisma.payment.findMany({
      where: {
        appointment: {
          status: 'CONFIRMED'
        }
      }
    }),
    prisma.user.count(),
    prisma.blogPost.count().catch(() => 0), // Blog posts might not exist yet
  ]);

  // Calculate total revenue from confirmed payments
  const totalRevenue = payments.reduce((sum, payment) => {
    const amount = parseFloat(payment.amount) || 0;
    return sum + amount;
  }, 0);

  const stats = {
    totalAppointments: appointments,
    totalRevenue: totalRevenue,
    totalUsers: users,
    totalPosts: blogPosts,
  };

  const translations = {
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

  // Serialize user data to avoid non-serializable values
  const serializedUser = session?.user ? {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    role: session.user.role,
  } : null;

  return <AdminDashboard user={serializedUser} stats={stats} locale={locale} translations={translations} />;
}
