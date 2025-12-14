'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ConfirmPaymentButton({ appointmentId, currentStatus }: { appointmentId: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const confirmPayment = async () => {
    if (!confirm('Confirm this payment and appointment?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONFIRMED' }),
      });

      if (!response.ok) throw new Error('Failed to confirm');
      
      router.refresh();
    } catch (error) {
      alert('Error confirming payment');
    } finally {
      setLoading(false);
    }
  };

  if (currentStatus !== 'PENDING') return null;

  return (
    <button
      onClick={confirmPayment}
      disabled={loading}
      className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
    >
      {loading ? 'Confirming...' : 'Confirm Payment'}
    </button>
  );
}
