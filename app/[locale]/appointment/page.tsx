'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import {
  ChevronRight, ChevronLeft, User, Calendar, Clock,
  Video, CheckCircle, Loader2, GraduationCap
} from 'lucide-react';

interface Service {
  id: string;
  serviceType: string;
  nameFr: string;
  nameEn: string;
  descriptionFr: string;
  descriptionEn: string;
  price: string;
  durationMinutes: number;
  active: boolean;
}

interface Consultant {
  id: string;
  displayName: string;
  titleFr: string | null;
  titleEn: string | null;
  bioFr: string | null;
  bioEn: string | null;
  photoUrl: string | null;
}

const STEPS = ['service', 'consultant', 'datetime', 'details', 'confirm'] as const;
type Step = typeof STEPS[number];

export default function AppointmentPage() {
  const locale = useLocale();
  const isFr = locale === 'fr';
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>('service');
  const [services, setServices] = useState<Service[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | 'any' | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableDays, setAvailableDays] = useState<number[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1);
  const [loadingDays, setLoadingDays] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [details, setDetails] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [slotConsultantMap, setSlotConsultantMap] = useState<Record<string, { id: string; displayName: string }>>({});
  const [resolvedConsultant, setResolvedConsultant] = useState<{ id: string; displayName: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/services').then((r) => r.json()).then((data) => {
      const active = (Array.isArray(data) ? data : []).filter((s: Service) => s.active);
      setServices(active);
      const pre = searchParams.get('service');
      if (pre) {
        const found = active.find((s: Service) => s.serviceType === pre);
        if (found) { setSelectedService(found); setStep('consultant'); }
      }
    });
    fetch('/api/consultants').then((r) => r.json()).then((data) => {
      setConsultants(Array.isArray(data) ? data : []);
    });
  }, []);

  const consultantId = selectedConsultant === 'any' ? 'any' : selectedConsultant?.id ?? null;

  const fetchDays = useCallback(async () => {
    if (!consultantId || !selectedService) return;
    setLoadingDays(true);
    const res = await fetch(`/api/availability?consultantId=${consultantId}&year=${calYear}&month=${calMonth}&serviceType=${selectedService.serviceType}`);
    const data = await res.json();
    setAvailableDays(data.days ?? []);
    setLoadingDays(false);
  }, [consultantId, calYear, calMonth, selectedService]);

  useEffect(() => { if (step === 'datetime') fetchDays(); }, [step, fetchDays]);

  useEffect(() => {
    if (!selectedDate || !consultantId || !selectedService) return;
    setLoadingSlots(true);
    setAvailableSlots([]);
    setSelectedTime('');
    setResolvedConsultant(null);
    setSlotConsultantMap({});
    fetch(`/api/availability?consultantId=${consultantId}&date=${selectedDate}&serviceType=${selectedService.serviceType}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // "any" mode: deduplicate slots, first consultant per slot wins
          const map: Record<string, { id: string; displayName: string }> = {};
          for (const entry of data) {
            for (const slot of entry.slots) {
              if (!map[slot]) map[slot] = { id: entry.consultantId, displayName: entry.consultantName };
            }
          }
          setSlotConsultantMap(map);
          setAvailableSlots([...new Set(data.flatMap((d: any) => d.slots))].sort());
        } else {
          setAvailableSlots(data.slots ?? []);
        }
        setLoadingSlots(false);
      });
  }, [selectedDate, consultantId, selectedService]);

  async function handleSubmit() {
    setSubmitting(true);
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...details,
        date: selectedDate,
        time: selectedTime,
        serviceType: selectedService!.serviceType,
        consultantId: resolvedConsultant?.id ?? (selectedConsultant === 'any' ? null : selectedConsultant?.id),
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setSuccess(true);
      setAppointmentId(data.appointmentId);
      setTimeout(() => {
        window.location.href = `/${locale}/payment?appointmentId=${data.appointmentId}`;
      }, 3000);
    } else {
      alert(data.error ?? (isFr ? 'Erreur lors de la réservation' : 'Booking error'));
    }
    setSubmitting(false);
  }

  const stepIndex = STEPS.indexOf(step);

  const calDays = () => {
    const firstDay = new Date(Date.UTC(calYear, calMonth - 1, 1)).getUTCDay();
    const total = new Date(Date.UTC(calYear, calMonth, 0)).getUTCDate();
    return { firstDay, total };
  };

  const monthNames = isFr
    ? ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const today = new Date();
  const todayY = today.getFullYear(), todayM = today.getMonth() + 1, todayD = today.getDate();

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pt-24">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md">
          <CheckCircle className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isFr ? 'Rendez-vous réservé !' : 'Appointment reserved!'}
          </h2>
          <p className="text-gray-500 mb-2">
            {isFr ? 'Votre rendez-vous est enregistré et en attente de confirmation du paiement.' : 'Your appointment is registered and awaiting payment confirmation.'}
          </p>
          <p className="text-gray-400 text-sm">{isFr ? 'Redirection vers le paiement...' : 'Redirecting to payment...'}</p>
        </div>
      </div>
    );
  }

  const { firstDay, total } = calDays();

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{isFr ? 'Réserver un rendez-vous' : 'Book an appointment'}</h1>
          <div className="flex items-center justify-center gap-1 mt-2 text-sm text-gray-500">
            <Video className="h-4 w-4 text-blue-500" />
            <span>{isFr ? 'Consultation en ligne par vidéo' : 'Online video consultation'}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1 mb-8 justify-center">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`h-2 rounded-full transition-all ${i <= stepIndex ? 'w-8' : 'w-4'} ${i < stepIndex ? 'bg-green-400' : i === stepIndex ? 'bg-blue-600' : 'bg-gray-200'}`} />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Step 1: Service */}
          {step === 'service' && (
            <div className="p-6 space-y-3">
              <h2 className="font-semibold text-gray-900 text-lg mb-4">{isFr ? 'Choisissez un service' : 'Choose a service'}</h2>
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedService(s); setStep('consultant'); }}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all hover:border-blue-400 ${selectedService?.id === s.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{isFr ? s.nameFr : s.nameEn}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{isFr ? s.descriptionFr : s.descriptionEn}</p>
                      <p className="text-xs text-gray-400 mt-1"><Clock className="inline h-3 w-3 mr-1" />{s.durationMinutes} min</p>
                    </div>
                    <span className="font-bold text-blue-700 whitespace-nowrap">{s.price.includes('TND') ? s.price : `${s.price} TND`}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Consultant */}
          {step === 'consultant' && (
            <div className="p-6">
              <h2 className="font-semibold text-gray-900 text-lg mb-4">{isFr ? 'Choisissez un consultant' : 'Choose a consultant'}</h2>
              <div className="space-y-3">
                <button
                  onClick={() => { setSelectedConsultant('any'); setStep('datetime'); }}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all hover:border-blue-400 border-gray-200`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-blue-100">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{isFr ? 'Premier expert disponible' : 'First available expert'}</p>
                      <p className="text-xs text-gray-500">{isFr ? 'Nous vous assignerons le meilleur expert disponible' : 'We\'ll assign the best available expert'}</p>
                    </div>
                  </div>
                </button>
                {consultants.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedConsultant(c); setStep('datetime'); }}
                    className="w-full text-left p-4 rounded-xl border-2 transition-all hover:border-blue-400 border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      {c.photoUrl ? (
                        <img src={c.photoUrl} alt={c.displayName} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{c.displayName}</p>
                        {(isFr ? c.titleFr : c.titleEn) && (
                          <p className="text-xs text-gray-500">{isFr ? c.titleFr : c.titleEn}</p>
                        )}
                        {(isFr ? c.bioFr : c.bioEn) && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{isFr ? c.bioFr : c.bioEn}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep('service')} className="mt-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                <ChevronLeft className="h-4 w-4" />{isFr ? 'Retour' : 'Back'}
              </button>
            </div>
          )}

          {/* Step 3: Date & Time */}
          {step === 'datetime' && (
            <div className="p-6">
              <h2 className="font-semibold text-gray-900 text-lg mb-4">{isFr ? 'Choisissez une date et une heure' : 'Choose a date and time'}</h2>

              {/* Calendar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => { if (calMonth === 1) { setCalMonth(12); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }}
                    disabled={calYear === todayY && calMonth <= todayM}
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="font-medium text-gray-900">{monthNames[calMonth - 1]} {calYear}</span>
                  <button
                    onClick={() => { if (calMonth === 12) { setCalMonth(1); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }}
                    className="p-1.5 rounded hover:bg-gray-100"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {loadingDays ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
                ) : (
                  <div className="grid grid-cols-7 gap-1">
                    {(isFr ? ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'] : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']).map((d) => (
                      <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
                    ))}
                    {/* First day offset — adjust for Monday-first (FR) vs Sunday-first (EN) */}
                    {Array.from({ length: isFr ? (firstDay === 0 ? 6 : firstDay - 1) : firstDay }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: total }, (_, i) => i + 1).map((day) => {
                      const isAvail = availableDays.includes(day);
                      const isPast = calYear === todayY && calMonth === todayM && day < todayD;
                      const dateStr = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const isSelected = selectedDate === dateStr;
                      return (
                        <button
                          key={day}
                          disabled={!isAvail || isPast}
                          onClick={() => setSelectedDate(dateStr)}
                          className={`h-9 w-full rounded-lg text-sm font-medium transition-all ${
                            isSelected ? 'bg-blue-600 text-white' :
                            isAvail && !isPast ? 'hover:bg-blue-50 text-gray-900 bg-green-50 text-green-800' :
                            'text-gray-300 cursor-not-allowed'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Time slots */}
              {selectedDate && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {isFr ? 'Créneaux disponibles' : 'Available slots'} — {new Date(selectedDate + 'T12:00:00').toLocaleDateString(isFr ? 'fr-FR' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                  {loadingSlots ? (
                    <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">{isFr ? 'Aucun créneau disponible ce jour-là.' : 'No slots available on this day.'}</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => {
                            setSelectedTime(slot);
                            if (selectedConsultant === 'any' && slotConsultantMap[slot]) {
                              setResolvedConsultant(slotConsultantMap[slot]);
                            }
                          }}
                          className={`py-2 rounded-lg text-sm font-medium border transition-all ${selectedTime === slot ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 hover:border-blue-400 text-gray-700'}`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                  {resolvedConsultant && selectedTime && (
                    <p className="mt-3 text-xs text-gray-500">
                      <span className="font-medium text-gray-700">{resolvedConsultant.displayName}</span>
                      {isFr ? ' sera votre consultant pour ce créneau.' : ' will be your consultant for this slot.'}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-between mt-6">
                <button onClick={() => setStep('consultant')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                  <ChevronLeft className="h-4 w-4" />{isFr ? 'Retour' : 'Back'}
                </button>
                <button
                  disabled={!selectedDate || !selectedTime}
                  onClick={() => setStep('details')}
                  className="flex items-center gap-1 px-5 py-2 text-sm text-white rounded-lg disabled:opacity-40 hover:opacity-90"
                  style={{ backgroundColor: '#233691' }}
                >
                  {isFr ? 'Continuer' : 'Continue'}<ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Contact details */}
          {step === 'details' && (
            <div className="p-6 space-y-4">
              <h2 className="font-semibold text-gray-900 text-lg">{isFr ? 'Vos coordonnées' : 'Your details'}</h2>
              {[
                { key: 'name', label: isFr ? 'Nom complet *' : 'Full name *', type: 'text', placeholder: isFr ? 'Votre nom' : 'Your name' },
                { key: 'email', label: 'Email *', type: 'email', placeholder: 'email@example.com' },
                { key: 'phone', label: isFr ? 'Téléphone *' : 'Phone *', type: 'tel', placeholder: '+216 XX XXX XXX' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type={type}
                    required
                    value={(details as any)[key]}
                    onChange={(e) => setDetails({ ...details, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{isFr ? 'Message (optionnel)' : 'Message (optional)'}</label>
                <textarea
                  rows={3}
                  value={details.message}
                  onChange={(e) => setDetails({ ...details, message: e.target.value })}
                  placeholder={isFr ? 'Décrivez brièvement votre situation...' : 'Briefly describe your situation...'}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                />
              </div>
              <div className="flex justify-between pt-2">
                <button onClick={() => setStep('datetime')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                  <ChevronLeft className="h-4 w-4" />{isFr ? 'Retour' : 'Back'}
                </button>
                <button
                  disabled={!details.name || !details.email || !details.phone}
                  onClick={() => setStep('confirm')}
                  className="flex items-center gap-1 px-5 py-2 text-sm text-white rounded-lg disabled:opacity-40 hover:opacity-90"
                  style={{ backgroundColor: '#233691' }}
                >
                  {isFr ? 'Continuer' : 'Continue'}<ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Confirm */}
          {step === 'confirm' && (
            <div className="p-6">
              <h2 className="font-semibold text-gray-900 text-lg mb-4">{isFr ? 'Récapitulatif' : 'Summary'}</h2>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm mb-6">
                <div className="flex justify-between"><span className="text-gray-500">{isFr ? 'Service' : 'Service'}</span><span className="font-medium">{isFr ? selectedService?.nameFr : selectedService?.nameEn}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">{isFr ? 'Consultant' : 'Consultant'}</span><span className="font-medium">{resolvedConsultant?.displayName ?? (selectedConsultant === 'any' ? (isFr ? 'Premier disponible' : 'First available') : (selectedConsultant as Consultant)?.displayName)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">{isFr ? 'Date' : 'Date'}</span><span className="font-medium">{new Date(selectedDate + 'T12:00:00').toLocaleDateString(isFr ? 'fr-FR' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">{isFr ? 'Heure' : 'Time'}</span><span className="font-medium">{selectedTime}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">{isFr ? 'Durée' : 'Duration'}</span><span className="font-medium">{selectedService?.durationMinutes} min</span></div>
                <div className="flex justify-between border-t border-gray-200 pt-3"><span className="text-gray-500">{isFr ? 'Nom' : 'Name'}</span><span className="font-medium">{details.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-medium">{details.email}</span></div>
                <div className="flex justify-between border-t border-gray-200 pt-3 text-base"><span className="font-semibold">{isFr ? 'Total' : 'Total'}</span><span className="font-bold text-blue-700">{selectedService?.price.includes('TND') ? selectedService.price : `${selectedService?.price} TND`}</span></div>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 rounded-lg p-3 mb-6">
                <Video className="h-4 w-4 flex-shrink-0" />
                <span>{isFr ? 'Consultation en ligne — le lien vidéo vous sera envoyé par email.' : 'Online consultation — the video link will be sent by email.'}</span>
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep('details')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                  <ChevronLeft className="h-4 w-4" />{isFr ? 'Retour' : 'Back'}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm text-white rounded-lg disabled:opacity-50 hover:opacity-90 font-semibold"
                  style={{ backgroundColor: '#233691' }}
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isFr ? 'Confirmer et payer' : 'Confirm & pay'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
