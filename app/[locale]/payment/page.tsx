'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { CreditCard, Wallet, Building, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  date: string;
  service: string;
  serviceType: string;
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const appointmentId = searchParams.get('appointmentId');

  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [price, setPrice] = useState<string>('150');

  useEffect(() => {
    if (appointmentId) {
      // Fetch appointment with stored price
      fetch(`/api/appointments/${appointmentId}`)
        .then((res) => res.json())
        .then((data) => {
          setAppointment(data);
          // Use the price from the payment record
          if (data.payment && data.payment.amount) {
            setPrice(data.payment.amount.toString());
          }
        })
        .catch((err) => console.error('Error fetching appointment:', err));
    }
  }, [appointmentId]);

  const handlePayment = async () => {
    if (!paymentMethod || !appointmentId) return;

    setLoading(true);

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId,
          paymentMethod,
          amount: parseFloat(price),
        }),
      });

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      const data = await response.json();

      // Redirect to payment gateway if URL is provided
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setSuccess(true);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert(locale === 'fr' ? 'Erreur de paiement' : 'Payment error');
    } finally {
      setLoading(false);
    }
  };

  if (!appointmentId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            {locale === 'fr' ? 'Rendez-vous non trouvé' : 'Appointment not found'}
          </p>
          <Link
            href={`/${locale}/appointment`}
            className="text-teal-600 hover:text-teal-700"
          >
            {locale === 'fr' ? 'Réserver un rendez-vous' : 'Book an appointment'}
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {paymentMethod === 'BANK_TRANSFER'
              ? locale === 'fr'
                ? 'Demande enregistrée !'
                : 'Request Recorded!'
              : locale === 'fr'
              ? 'Paiement réussi !'
              : 'Payment Successful!'}
          </h2>
          <p className="text-gray-600 mb-4">
            {paymentMethod === 'BANK_TRANSFER'
              ? locale === 'fr'
                ? 'Votre demande de rendez-vous a été enregistrée. Un email de confirmation avec les détails de paiement vous a été envoyé.'
                : 'Your appointment request has been recorded. A confirmation email with payment details has been sent to you.'
              : locale === 'fr'
              ? 'Votre rendez-vous est confirmé. Un email de confirmation a été envoyé.'
              : 'Your appointment is confirmed. A confirmation email has been sent.'}
          </p>
          {paymentMethod === 'BANK_TRANSFER' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-amber-900 font-semibold mb-2">
                {locale === 'fr' ? 'Prochaines étapes:' : 'Next steps:'}
              </p>
              <ol className="text-sm text-amber-800 space-y-1 list-decimal list-inside">
                <li>
                  {locale === 'fr'
                    ? 'Effectuez le virement bancaire avec la référence fournie'
                    : 'Make the bank transfer with the provided reference'}
                </li>
                <li>
                  {locale === 'fr'
                    ? 'Envoyez la preuve de paiement à becofconseil@gmail.com'
                    : 'Send payment proof to becofconseil@gmail.com'}
                </li>
                <li>
                  {locale === 'fr'
                    ? 'Votre rendez-vous sera confirmé sous 24h'
                    : 'Your appointment will be confirmed within 24h'}
                </li>
              </ol>
            </div>
          )}
          <Link
            href={`/${locale}`}
            className="inline-block bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
          >
            {locale === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <Link
          href={`/${locale}/appointment`}
          className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6"
        >
          <ArrowLeft size={20} />
          {locale === 'fr' ? 'Retour' : 'Back'}
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {locale === 'fr' ? 'Paiement' : 'Payment'}
          </h1>
          <p className="text-lg text-gray-600">
            {locale === 'fr'
              ? 'Choisissez votre méthode de paiement'
              : 'Choose your payment method'}
          </p>
        </div>

        {/* Appointment Summary */}
        {appointment && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {locale === 'fr' ? 'Récapitulatif du rendez-vous' : 'Appointment Summary'}
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {locale === 'fr' ? 'Nom' : 'Name'}:
                </span>
                <span className="font-medium">{appointment.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {locale === 'fr' ? 'Date' : 'Date'}:
                </span>
                <span className="font-medium">
                  {new Date(appointment.date).toLocaleString(
                    locale === 'fr' ? 'fr-FR' : 'en-US'
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {locale === 'fr' ? 'Service' : 'Service'}:
                </span>
                <span className="font-medium">{appointment.serviceType}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between text-lg font-bold">
                <span>{locale === 'fr' ? 'Total' : 'Total'}:</span>
                <span>{price} TND</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            {locale === 'fr' ? 'Méthode de paiement' : 'Payment Method'}
          </h2>

          <div className="space-y-4">
            {/* Konnect */}
            <label
              className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                paymentMethod === 'KONNECT'
                  ? 'border-teal-600 bg-teal-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="KONNECT"
                checked={paymentMethod === 'KONNECT'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-teal-600"
              />
              <CreditCard className="h-6 w-6 text-gray-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Konnect</p>
                <p className="text-sm text-gray-500">
                  {locale === 'fr'
                    ? 'Paiement par carte bancaire'
                    : 'Credit/Debit card payment'}
                </p>
              </div>
            </label>

            {/* Flouci */}
            <label
              className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                paymentMethod === 'FLOUCI'
                  ? 'border-teal-600 bg-teal-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="FLOUCI"
                checked={paymentMethod === 'FLOUCI'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-teal-600"
              />
              <Wallet className="h-6 w-6 text-gray-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Flouci</p>
                <p className="text-sm text-gray-500">
                  {locale === 'fr' ? 'Portefeuille mobile' : 'Mobile wallet'}
                </p>
              </div>
            </label>

            {/* D17 */}
            <label
              className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                paymentMethod === 'D17'
                  ? 'border-teal-600 bg-teal-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="D17"
                checked={paymentMethod === 'D17'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-teal-600"
              />
              <Wallet className="h-6 w-6 text-gray-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">D17</p>
                <p className="text-sm text-gray-500">
                  {locale === 'fr' ? 'Paiement D17' : 'D17 Payment'}
                </p>
              </div>
            </label>

            {/* Bank Transfer */}
            <label
              className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                paymentMethod === 'BANK_TRANSFER'
                  ? 'border-teal-600 bg-teal-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="BANK_TRANSFER"
                checked={paymentMethod === 'BANK_TRANSFER'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-teal-600"
              />
              <Building className="h-6 w-6 text-gray-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {locale === 'fr' ? 'Virement bancaire' : 'Bank Transfer'}
                </p>
                <p className="text-sm text-gray-500">
                  {locale === 'fr'
                    ? 'Paiement par virement'
                    : 'Direct bank transfer'}
                </p>
              </div>
            </label>
          </div>

          {/* Bank Transfer Instructions */}
          {paymentMethod === 'BANK_TRANSFER' && appointmentId && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-3">
                  {locale === 'fr'
                    ? 'Instructions de virement'
                    : 'Transfer Instructions'}
                </p>
                <div className="text-sm text-blue-800 space-y-2">
                  <p>
                    <strong>{locale === 'fr' ? 'Banque' : 'Bank'}:</strong> BIAT
                  </p>
                  <p>
                    <strong>RIB:</strong> 08 000 0000000000000 00
                  </p>
                  <p>
                    <strong>{locale === 'fr' ? 'Titulaire' : 'Account Name'}:</strong> BECOF
                  </p>
                  <div className="mt-3 p-2 bg-blue-100 rounded">
                    <p className="font-semibold">
                      {locale === 'fr' ? 'Référence à inclure:' : 'Reference to include:'}
                    </p>
                    <p className="font-mono text-base">
                      {appointment?.clientName || 'Your Name'} - {appointmentId.slice(-8).toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm font-medium text-amber-900 mb-2">
                  {locale === 'fr' ? '⚠️ Important' : '⚠️ Important'}
                </p>
                <p className="text-sm text-amber-800">
                  {locale === 'fr'
                    ? 'Après avoir effectué le virement, envoyez une capture d\'écran de la preuve de paiement à '
                    : 'After making the transfer, send a screenshot of the payment proof to '}
                  <a href="mailto:becofconseil@gmail.com" className="font-semibold underline">becofconseil@gmail.com</a>
                  {locale === 'fr'
                    ? ' avec le numéro de référence ci-dessus pour confirmation rapide.'
                    : ' with the reference number above for quick confirmation.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={!paymentMethod || loading}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? locale === 'fr'
              ? 'Traitement...'
              : 'Processing...'
            : locale === 'fr'
            ? `Procéder au paiement - ${price} TND`
            : `Proceed to Payment - ${price} TND`}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          {locale === 'fr'
            ? 'Paiement sécurisé et crypté'
            : 'Secure and encrypted payment'}
        </p>
      </div>
    </div>
  );
}
