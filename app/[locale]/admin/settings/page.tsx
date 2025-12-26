import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper';
import { Settings as SettingsIcon, Mail, Calendar, CreditCard, Globe } from 'lucide-react';
import Link from 'next/link';
import { getAdminTranslations } from '@/lib/admin-translations';

export default async function AdminSettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();

  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  if (!['ADMIN', 'SUPER_ADMIN'].includes((session.user as any)?.role)) {
    redirect(`/${locale}`);
  }

  const translations = await getAdminTranslations(locale);

  // Check environment variables
  const hasGoogleCalendar = !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN
  );
  
  const hasEmailConfig = !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD
  );

  const settingsSections = [
    {
      icon: CreditCard,
      title: 'Service Pricing',
      description: 'Manage prices for your services',
      href: '/admin/pricing',
      color: 'bg-indigo-500',
    },
    {
      icon: Mail,
      title: 'Email Settings',
      description: 'Configure SMTP and email notifications',
      href: '#',
      color: 'bg-purple-500',
      badge: 'Configured',
    },
    {
      icon: Calendar,
      title: 'Google Calendar',
      description: 'Manage calendar integration',
      href: '#',
      color: 'bg-pink-500',
      badge: 'Setup Required',
    },
    {
      icon: Globe,
      title: 'Site Settings',
      description: 'General website configuration',
      href: '#',
      color: 'bg-blue-500',
      badge: 'Coming Soon',
    },
  ];

  return (
    <AdminLayoutWrapper user={session.user} title={translations.nav.settings} locale={locale} translations={translations}>
      <div className="max-w-4xl">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">System Configuration</h3>
          <p className="text-sm text-gray-600">
            Manage your website settings and integrations
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {settingsSections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title}>
                {section.href === '#' ? (
                  <div className="bg-white rounded-lg shadow-md p-6 opacity-60 cursor-not-allowed">
                <div className="flex items-start gap-4">
                  <div className={`${section.color} rounded-lg p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {section.title}
                      </h3>
                      {section.badge && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {section.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{section.description}</p>
                  </div>
                </div>
                </div>
                ) : (
                  <Link
                    href={section.href}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow block"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`${section.color} rounded-lg p-3`}>
                        <section.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {section.title}
                          </h3>
                          {section.badge && (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                              {section.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{section.description}</p>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Current Configuration */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Configuration</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Email Service</span>
              {hasEmailConfig ? (
                <span className="text-sm font-medium text-green-600">✓ Gmail SMTP</span>
              ) : (
                <span className="text-sm font-medium text-yellow-600">⚠ Not Configured</span>
              )}
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Google Calendar</span>
              {hasGoogleCalendar ? (
                <span className="text-sm font-medium text-green-600">✓ Configured</span>
              ) : (
                <span className="text-sm font-medium text-yellow-600">⚠ Refresh Token Required</span>
              )}
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Payment Gateways</span>
              <span className="text-sm font-medium text-yellow-600">⚠ API Keys Required</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Database</span>
              <span className="text-sm font-medium text-green-600">✓ SQLite</span>
            </div>
          </div>
        </div>

        {/* Environment Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">ℹ️ Configuration Notes</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Most settings are configured via environment variables (.env.local)</li>
            <li>• Check GOOGLE_SETUP.md for Google Calendar configuration</li>
            <li>• Service pricing can be managed from the Service Pricing section</li>
            <li>• Contact helmiboussetta11@gmail.com for technical support</li>
          </ul>
        </div>
      </div>
    </AdminLayoutWrapper>
  );
}
