import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper';
import { getAdminTranslations } from '@/lib/admin-translations';
import { AppointmentsPanel } from './AppointmentsPanel';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminAppointmentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();

  if (!session) redirect(`/${locale}/admin/login`);
  if (!['ADMIN', 'SUPER_ADMIN'].includes((session.user as any)?.role)) redirect(`/${locale}`);

  const translations = await getAdminTranslations(locale);

  // Get the current admin's consultant profile (may be null)
  const myProfile = await prisma.consultantProfile.findUnique({
    where: { userId: (session.user as any).id },
    select: { id: true, displayName: true },
  });

  // All active consultant profiles for the filter dropdown
  const allConsultants = await prisma.consultantProfile.findMany({
    where: { isActive: true },
    select: { id: true, displayName: true },
    orderBy: { displayOrder: 'asc' },
  });

  // All appointments with consultant info
  const appointments = await prisma.appointment.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      date: true,
      time: true,
      serviceType: true,
      status: true,
      message: true,
      consultantId: true,
      createdAt: true,
      consultant: { select: { id: true, displayName: true } },
      payment: { select: { status: true, amount: true, currency: true } },
    },
    orderBy: { date: 'asc' },
  });

  return (
    <AdminLayoutWrapper user={session.user} locale={locale} translations={translations} title={locale === 'fr' ? 'Rendez-vous' : 'Appointments'}>
      <AppointmentsPanel
        appointments={appointments as any}
        myConsultantId={myProfile?.id ?? null}
        allConsultants={allConsultants}
        locale={locale}
      />
    </AdminLayoutWrapper>
  );
}
