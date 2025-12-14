'use client';

import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const status = searchParams.get('status'); // 'success' or 'failed'
  const paymentId = searchParams.get('paymentId');

  const isSuccess = status === 'success';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {isSuccess ? (
          <>
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {locale === 'fr' ? 'Paiement réussi !' : 'Payment Successful!'}
            </h2>
            <p className="text-gray-600 mb-6">
              {locale === 'fr'
                ? 'Votre paiement a été traité avec succès. Votre rendez-vous est maintenant confirmé.'
                : 'Your payment has been processed successfully. Your appointment is now confirmed.'}
            </p>
            {paymentId && (
              <p className="text-sm text-gray-500 mb-6">
                {locale === 'fr' ? 'Référence' : 'Reference'}: {paymentId}
              </p>
            )}
          </>
        ) : (
          <>
            <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {locale === 'fr' ? 'Paiement échoué' : 'Payment Failed'}
            </h2>
            <p className="text-gray-600 mb-6">
              {locale === 'fr'
                ? 'Votre paiement n\'a pas pu être traité. Veuillez réessayer.'
                : 'Your payment could not be processed. Please try again.'}
            </p>
          </>
        )}
        
        <div className="space-y-3">
          <Link
            href={`/${locale}`}
            className="block w-full bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
          >
            {locale === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}
          </Link>
          {!isSuccess && (
            <Link
              href={`/${locale}/appointment`}
              className="block w-full bg-white text-teal-600 px-6 py-3 rounded-lg border-2 border-teal-600 hover:bg-teal-50 transition-colors"
            >
              {locale === 'fr' ? 'Réessayer' : 'Try Again'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
