'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Calendar, Clock, User, Mail, Phone, MessageSquare, CheckCircle } from 'lucide-react';

interface Service {
  id: string;
  serviceType: string;
  nameFr: string;
  nameEn: string;
  descriptionFr: string;
  descriptionEn: string;
  price: string;
  displayOrder: number;
  active: boolean;
}

export default function AppointmentPage() {
  const t = useTranslations('appointment');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    service: '',
    message: '',
  });

  useEffect(() => {
    // Fetch services from API
    fetch('/api/admin/services')
      .then((res) => res.json())
      .then((data) => {
        const activeServices = data.filter((s: Service) => s.active);
        setServices(activeServices);
        setLoadingServices(false);
        
        // Check if there's a preselected service from URL
        const preselectedService = searchParams.get('service');
        if (preselectedService) {
          const matchingService = activeServices.find((s: Service) => s.serviceType === preselectedService);
          if (matchingService) {
            setFormData(prev => ({ ...prev, service: matchingService.serviceType }));
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching services:', err);
        setLoadingServices(false);
      });
  }, [searchParams]);

  const getSelectedServicePrice = () => {
    const selected = services.find(s => s.serviceType === formData.service);
    if (selected) {
      // Remove 'TND' suffix if present and return just the number
      return selected.price.replace(/\s*TND\s*/i, '');
    }
    return '150';
  };

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Response:', { status: response.status, body: errorText });
        
        let errorData: any = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        
        const errorMessage = errorData.error || errorData.message || `Failed to book appointment (${response.status})`;
        console.error('API Error:', errorData);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        service: '',
        message: '',
      });

      // Redirect to payment page
      if (data.appointmentId) {
        setTimeout(() => {
          window.location.href = `/${locale}/payment?appointmentId=${data.appointmentId}`;
        }, 2000);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      const errorMessage = error instanceof Error ? error.message : (locale === 'fr' ? 'Erreur lors de la réservation' : 'Error booking appointment');
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {locale === 'fr' ? 'Rendez-vous confirmé !' : 'Appointment Confirmed!'}
          </h2>
          <p className="text-gray-600 mb-6">
            {locale === 'fr'
              ? 'Redirection vers le paiement...'
              : 'Redirecting to payment...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {locale === 'fr' ? 'Réserver un rendez-vous' : 'Book an Appointment'}
          </h1>
          <p className="text-lg text-gray-600">
            {locale === 'fr'
              ? 'Planifiez une consultation avec nos experts en orientation'
              : 'Schedule a consultation with our orientation experts'}
          </p>
        </div>

        {/* Pricing Info */}
        {formData.service && (
          <div className="bg-gradient-to-r bg-blue-600 rounded-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">
                  {locale === 'fr' ? 'Tarif de consultation' : 'Consultation Fee'}
                </p>
                <p className="text-3xl font-bold">{getSelectedServicePrice()} TND</p>
              </div>
              <Clock className="h-12 w-12 opacity-80" />
            </div>
            <p className="text-sm mt-2 opacity-90">
              {locale === 'fr' ? 'Séance de 60 minutes' : '60-minute session'}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                {locale === 'fr' ? 'Nom complet' : 'Full Name'} *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder={locale === 'fr' ? 'Votre nom' : 'Your name'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="inline h-4 w-4 mr-1" />
              {locale === 'fr' ? 'Téléphone' : 'Phone'} *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="+216 XX XXX XXX"
            />
          </div>

          {/* Service Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'fr' ? 'Type de service' : 'Service Type'} *
            </label>
            {loadingServices ? (
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-500">
                {locale === 'fr' ? 'Chargement des services...' : 'Loading services...'}
              </div>
            ) : (
              <select
                required
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">
                  {locale === 'fr' ? 'Sélectionnez un service' : 'Select a service'}
                </option>
                {services.map((service) => (
                  <option key={service.id} value={service.serviceType}>
                    {locale === 'fr' ? service.nameFr : service.nameEn} - {service.price.includes('TND') ? service.price : `${service.price} TND`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                {locale === 'fr' ? 'Date' : 'Date'} *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                {locale === 'fr' ? 'Heure' : 'Time'} *
              </label>
              <select
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">
                  {locale === 'fr' ? 'Sélectionnez une heure' : 'Select time'}
                </option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="inline h-4 w-4 mr-1" />
              {locale === 'fr' ? 'Message (optionnel)' : 'Message (optional)'}
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder={
                locale === 'fr'
                  ? 'Décrivez brièvement votre situation...'
                  : 'Briefly describe your situation...'
              }
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r bg-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? locale === 'fr'
                ? 'Réservation...'
                : 'Booking...'
              : locale === 'fr'
              ? 'Continuer vers le paiement'
              : 'Continue to Payment'}
          </button>

          <p className="text-sm text-gray-500 text-center">
            {locale === 'fr'
              ? 'Vous serez redirigé vers la page de paiement après confirmation'
              : 'You will be redirected to payment page after confirmation'}
          </p>
        </form>
      </div>
    </div>
  );
}
