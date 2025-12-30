'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const t = useTranslations('contact');
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Check if response has content before parsing JSON
      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        throw new Error(locale === 'fr' ? 'Réponse du serveur invalide' : 'Invalid server response');
      }

      if (!response.ok) {
        // Handle validation errors with specific field messages
        if (data.details && Array.isArray(data.details)) {
          const fieldErrors = data.details.map((d: any) => {
            const field = d.path.join('.');
            const fieldName = field === 'name' ? (locale === 'fr' ? 'Nom' : 'Name') :
                            field === 'email' ? 'Email' :
                            field === 'subject' ? (locale === 'fr' ? 'Sujet' : 'Subject') :
                            field === 'message' ? 'Message' : field;
            return `${fieldName}: ${d.message}`;
          });
          throw new Error(fieldErrors.join('\n'));
        }
        throw new Error(data.message || data.error || (locale === 'fr' ? 'Échec de l\'envoi du message' : 'Failed to send message'));
      }

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });

      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : (locale === 'fr' ? 'Erreur inconnue' : 'Unknown error');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="text-white py-20" style={{background: 'linear-gradient(135deg, #233691 0%, #1a2870 100%)'}}>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {locale === 'fr' ? 'Contactez-nous' : 'Contact Us'}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {locale === 'fr'
              ? 'Nous sommes là pour répondre à vos questions'
              : 'We\'re here to answer your questions'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {locale === 'fr' ? 'Informations de contact' : 'Contact Information'}
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-teal-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <a
                      href="mailto:becofconseil@gmail.com"
                      className="text-teal-600 hover:text-teal-700"
                    >
                      becofconseil@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-teal-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {locale === 'fr' ? 'Téléphone' : 'Phone'}
                    </p>
                    <a
                      href="tel:+21653216700"
                      className="text-teal-600 hover:text-teal-700"
                    >
                      +216 53 216 700
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-teal-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {locale === 'fr' ? 'Adresse' : 'Address'}
                    </p>
                    <p className="text-gray-600">
                      Hammamet, Tunisie
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-2">
                {locale === 'fr' ? 'Horaires d\'ouverture' : 'Office Hours'}
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>{locale === 'fr' ? 'Lundi - Vendredi' : 'Monday - Friday'}</span>
                  <span>9:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span>{locale === 'fr' ? 'Samedi' : 'Saturday'}</span>
                  <span>9:00 - 13:00</span>
                </div>
                <div className="flex justify-between">
                  <span>{locale === 'fr' ? 'Dimanche' : 'Sunday'}</span>
                  <span>{locale === 'fr' ? 'Fermé' : 'Closed'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {locale === 'fr' ? 'Envoyez-nous un message' : 'Send us a Message'}
              </h2>

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="text-green-800">
                    {locale === 'fr'
                      ? 'Message envoyé avec succès !'
                      : 'Message sent successfully!'}
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-red-800 mb-1">
                        {locale === 'fr' ? 'Erreur lors de l\'envoi' : 'Error sending message'}
                      </h3>
                      <p className="text-sm text-red-700 whitespace-pre-line">
                        {error}
                      </p>
                    </div>
                    <button
                      onClick={() => setError('')}
                      className="flex-shrink-0 text-red-400 hover:text-red-600"
                    >
                      <span className="sr-only">Dismiss</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {locale === 'fr' ? 'Nom' : 'Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder={locale === 'fr' ? 'Votre nom' : 'Your name'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'fr' ? 'Sujet' : 'Subject'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder={
                      locale === 'fr'
                        ? 'Objet de votre message'
                        : 'Subject of your message'
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder={
                      locale === 'fr'
                        ? 'Écrivez votre message ici...'
                        : 'Write your message here...'
                    }
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r bg-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    locale === 'fr' ? 'Envoi...' : 'Sending...'
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      {locale === 'fr' ? 'Envoyer le message' : 'Send Message'}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
