import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper';
import PricingForm from './PricingForm';

export default async function AdminPricingPage() {
  const session = await auth();

  if (!session) {
    redirect('/admin/login');
  }

  if ((session.user as any)?.role !== 'ADMIN') {
    redirect('/');
  }

  // Fetch current pricing from settings
  const pricingSettings = await prisma.siteSettings.findMany({
    where: {
      key: {
        in: [
          'price_orientation',
          'price_career_counseling',
          'price_career_coaching',
          'price_group_workshop',
        ],
      },
    },
  });

  const prices = {
    orientation: pricingSettings.find((s) => s.key === 'price_orientation')?.value || '150',
    careerCounseling: pricingSettings.find((s) => s.key === 'price_career_counseling')?.value || '200',
    careerCoaching: pricingSettings.find((s) => s.key === 'price_career_coaching')?.value || 'Sur devis',
    groupWorkshop: pricingSettings.find((s) => s.key === 'price_group_workshop')?.value || '80',
  };

  return (
    <AdminLayoutWrapper user={session.user} title="Service Pricing">
      <div className="max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Service Prices</h3>
            <p className="text-sm text-gray-600">
              Update the prices for your services. These prices will be displayed on the services page and during appointment booking.
            </p>
          </div>

          <PricingForm initialPrices={prices} />
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Pricing Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Prices are displayed in Tunisian Dinar (TND)</li>
            <li>• For custom pricing (like Career Coaching), use text like "Sur devis" or "Quote"</li>
            <li>• Changes take effect immediately on the website</li>
            <li>• Make sure prices match what you charge for payment processing</li>
          </ul>
        </div>
      </div>
    </AdminLayoutWrapper>
  );
}
