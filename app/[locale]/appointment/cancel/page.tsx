'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useLocale } from 'next-intl';

export default function CancelPage() {
  const locale = useLocale();
  const isFr = locale === 'fr';
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleCancel() {
    if (!token) return;
    setStatus('loading');
    const res = await fetch('/api/appointments/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus('success');
    } else {
      setStatus('error');
      setMessage(data.error ?? 'Error');
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow p-8 text-center max-w-md">
          <XCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-600">{isFr ? 'Lien invalide.' : 'Invalid link.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pt-28">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
        {status === 'success' ? (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {isFr ? 'Rendez-vous annulé' : 'Appointment cancelled'}
            </h2>
            <p className="text-gray-500 text-sm">
              {isFr ? 'Votre rendez-vous a été annulé avec succès.' : 'Your appointment has been successfully cancelled.'}
            </p>
          </>
        ) : status === 'error' ? (
          <>
            <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">{isFr ? 'Impossible d\'annuler' : 'Cannot cancel'}</h2>
            <p className="text-gray-500 text-sm">{message}</p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              {isFr ? 'Annuler votre rendez-vous ?' : 'Cancel your appointment?'}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {isFr
                ? 'Cette action est irréversible. Les annulations doivent être effectuées au moins 24h avant.'
                : 'This action cannot be undone. Cancellations must be made at least 24 hours before.'}
            </p>
            <div className="flex gap-3 justify-center">
              <a href={`/${locale}`} className="px-5 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                {isFr ? 'Retour' : 'Go back'}
              </a>
              <button
                onClick={handleCancel}
                disabled={status === 'loading'}
                className="flex items-center gap-2 px-5 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {status === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
                {isFr ? 'Confirmer l\'annulation' : 'Confirm cancellation'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
