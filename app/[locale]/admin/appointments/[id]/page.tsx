import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper';
import { getAdminTranslations } from '@/lib/admin-translations';
import { ConfirmPaymentButton } from '../ConfirmPaymentButton';
import {
  ArrowLeft, User, Mail, Phone, Calendar, Clock, Video,
  CreditCard, CheckCircle, AlertCircle, XCircle, MessageSquare,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  PENDING: <AlertCircle className="h-4 w-4" />,
  CONFIRMED: <CheckCircle className="h-4 w-4" />,
  COMPLETED: <CheckCircle className="h-4 w-4" />,
  CANCELLED: <XCircle className="h-4 w-4" />,
};

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const session = await auth();

  if (!session) redirect(`/${locale}/admin/login`);
  if (!['ADMIN', 'SUPER_ADMIN'].includes((session.user as any)?.role)) redirect(`/${locale}`);

  const translations = await getAdminTranslations(locale);
  const isFr = locale === 'fr';

  // Get current admin's consultant profile to enforce ownership
  const myProfile = await prisma.consultantProfile.findUnique({
    where: { userId: (session.user as any).id },
    select: { id: true },
  });

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      consultant: { select: { id: true, displayName: true, titleFr: true, titleEn: true, photoUrl: true } },
      payment: true,
    },
  });

  if (!appointment) notFound();

  const appointmentDate = new Date(appointment.date);

  return (
    <AdminLayoutWrapper user={session.user} locale={locale} translations={translations} title={isFr ? 'Détails du rendez-vous' : 'Appointment Details'}>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Back */}
        <Link
          href={`/${locale}/admin/appointments`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {isFr ? 'Retour aux rendez-vous' : 'Back to appointments'}
        </Link>

        {/* Status header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-gray-400 mb-1">
              {isFr ? 'Réservé le' : 'Booked on'} {new Date(appointment.createdAt).toLocaleDateString(isFr ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <h1 className="text-xl font-bold text-gray-900">{appointment.name}</h1>
            <p className="text-sm text-gray-500">{appointment.serviceType}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${STATUS_STYLES[appointment.status] ?? 'bg-gray-100 text-gray-700'}`}>
              {STATUS_ICONS[appointment.status]}
              {appointment.status}
            </span>
            {appointment.payment && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                appointment.payment.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                appointment.payment.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                <CreditCard className="h-4 w-4" />
                {isFr ? 'Paiement' : 'Payment'}: {appointment.payment.status}
              </span>
            )}
            {myProfile?.id === appointment.consultantId && (
              <ConfirmPaymentButton
                appointmentId={appointment.id}
                paymentStatus={appointment.payment?.status ?? null}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Client info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">{isFr ? 'Informations client' : 'Client information'}</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="font-medium text-gray-900">{appointment.name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <a href={`mailto:${appointment.email}`} className="text-blue-600 hover:underline">{appointment.email}</a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <a href={`tel:${appointment.phone}`} className="text-gray-700">{appointment.phone}</a>
              </div>
            </div>
            {appointment.message && (
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-start gap-3 text-sm">
                  <MessageSquare className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-600 italic">"{appointment.message}"</p>
                </div>
              </div>
            )}
          </div>

          {/* Appointment info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">{isFr ? 'Détails du rendez-vous' : 'Appointment details'}</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700">
                  {appointmentDate.toLocaleDateString(isFr ? 'fr-FR' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700">{appointment.time}</span>
              </div>
              {appointment.isOnline && (
                <div className="flex items-center gap-3 text-sm">
                  <Video className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  <span className="text-blue-600">{isFr ? 'Consultation en ligne' : 'Online consultation'}</span>
                </div>
              )}
              {appointment.consultant && (
                <div className="flex items-center gap-3 text-sm pt-2 border-t border-gray-100">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700 font-semibold text-xs">
                    {appointment.consultant.displayName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{appointment.consultant.displayName}</p>
                    {appointment.consultant.titleFr && (
                      <p className="text-xs text-gray-500">{isFr ? appointment.consultant.titleFr : (appointment.consultant.titleEn ?? appointment.consultant.titleFr)}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment info */}
          {appointment.payment && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3 md:col-span-2">
              <h2 className="font-semibold text-gray-900">{isFr ? 'Paiement' : 'Payment'}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">{isFr ? 'Montant' : 'Amount'}</p>
                  <p className="font-semibold text-gray-900">{appointment.payment.amount} {appointment.payment.currency}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">{isFr ? 'Méthode' : 'Method'}</p>
                  <p className="font-medium text-gray-700">{appointment.payment.paymentMethod ?? '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Statut</p>
                  <p className={`font-medium ${appointment.payment.status === 'COMPLETED' ? 'text-emerald-600' : appointment.payment.status === 'PENDING' ? 'text-orange-600' : 'text-red-600'}`}>
                    {appointment.payment.status}
                  </p>
                </div>
                {appointment.payment.transactionId && (
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">Transaction ID</p>
                    <p className="font-mono text-xs text-gray-700 truncate">{appointment.payment.transactionId}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayoutWrapper>
  );
}
