'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';

export function ConfirmPaymentButton({ appointmentId, paymentStatus }: { appointmentId: string; paymentStatus: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const confirmPayment = async () => {
    if (!confirm('Confirmer le paiement reçu ? Un email de confirmation sera envoyé au client.')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmPayment: true }),
      });

      if (!response.ok) throw new Error('Failed to confirm');

      router.refresh();
    } catch {
      alert('Erreur lors de la confirmation du paiement');
    } finally {
      setLoading(false);
    }
  };

  if (paymentStatus !== 'PENDING') return null;

  return (
    <button
      onClick={confirmPayment}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
      {loading ? 'Confirmation...' : 'Confirmer le paiement'}
    </button>
  );
}
