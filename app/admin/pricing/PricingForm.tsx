'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, Loader2 } from 'lucide-react';

interface PricingFormProps {
  initialPrices: {
    orientation: string;
    careerCounseling: string;
    careerCoaching: string;
    groupWorkshop: string;
  };
}

export default function PricingForm({ initialPrices }: PricingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [prices, setPrices] = useState(initialPrices);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prices),
      });

      if (!response.ok) {
        throw new Error('Failed to update prices');
      }

      setSuccess(true);
      router.refresh();
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating prices:', error);
      alert('Failed to update prices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const services = [
    {
      key: 'orientation',
      label: 'Orientation Session',
      labelFr: 'Séance d\'orientation',
      description: 'Individual orientation and career guidance session',
    },
    {
      key: 'careerCounseling',
      label: 'Career Counseling',
      labelFr: 'Conseil en carrière',
      description: 'In-depth career counseling and development',
    },
    {
      key: 'careerCoaching',
      label: 'Career Coaching',
      labelFr: 'Coaching de carrière',
      description: 'Personalized career coaching program',
    },
    {
      key: 'groupWorkshop',
      label: 'Group Workshop',
      labelFr: 'Atelier de groupe',
      description: 'Interactive group workshop sessions',
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {services.map((service) => (
        <div key={service.key} className="border-b border-gray-200 pb-6 last:border-0">
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <label htmlFor={service.key} className="block text-sm font-semibold text-gray-900 mb-1">
                {service.label} / {service.labelFr}
              </label>
              <p className="text-xs text-gray-500 mb-3">{service.description}</p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  id={service.key}
                  value={prices[service.key as keyof typeof prices]}
                  onChange={(e) => setPrices({ ...prices, [service.key]: e.target.value })}
                  className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="150 or Sur devis"
                  required
                />
                <span className="text-sm text-gray-600">TND</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        {success && (
          <div className="text-sm text-green-600 font-medium">
            ✓ Prices updated successfully!
          </div>
        )}
        <div className="ml-auto">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
}
