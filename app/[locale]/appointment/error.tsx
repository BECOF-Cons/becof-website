'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function AppointmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();
  const isFrench = locale === 'fr';

  useEffect(() => {
    console.error('Appointment page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isFrench ? 'Erreur de réservation' : 'Appointment Error'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {isFrench
              ? 'Une erreur s\'est produite lors du chargement de la page de réservation. Veuillez réessayer.'
              : 'An error occurred while loading the appointment page. Please try again.'}
          </p>

          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <p className="text-sm font-mono text-red-800 break-all">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={reset}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <RefreshCw size={18} />
              {isFrench ? 'Réessayer' : 'Try Again'}
            </button>
            
            <Link
              href={`/${locale}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={18} />
              {isFrench ? 'Accueil' : 'Home'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
