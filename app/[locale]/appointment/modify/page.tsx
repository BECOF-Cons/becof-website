'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Calendar, Clock, CheckCircle, XCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface AppointmentInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  serviceType: string;
  consultantId: string | null;
  consultant: { id: string; displayName: string } | null;
}

const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAYS_FR = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];

export default function ModifyAppointmentPage() {
  const locale = useLocale();
  const isFr = locale === 'fr';
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appointment, setAppointment] = useState<AppointmentInfo | null>(null);

  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1);
  const [availableDays, setAvailableDays] = useState<number[]>([]);
  const [loadingDays, setLoadingDays] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotConsultantMap, setSlotConsultantMap] = useState<Record<string, { id: string; displayName: string }>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [resolvedConsultant, setResolvedConsultant] = useState<{ id: string; displayName: string } | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Load appointment from token
  useEffect(() => {
    if (!token) { setError('Lien invalide.'); setLoading(false); return; }
    fetch(`/api/appointments/modify?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); }
        else { setAppointment(data); }
        setLoading(false);
      })
      .catch(() => { setError('Erreur de chargement.'); setLoading(false); });
  }, [token]);

  // Fetch available days for current month
  const fetchDays = useCallback(async () => {
    if (!appointment) return;
    const consultantId = appointment.consultantId ?? 'any';
    setLoadingDays(true);
    const res = await fetch(`/api/availability?consultantId=${consultantId}&year=${calYear}&month=${calMonth}&serviceType=${appointment.serviceType}`);
    const data = await res.json();
    setAvailableDays(data.days ?? []);
    setLoadingDays(false);
  }, [appointment, calYear, calMonth]);

  useEffect(() => { if (appointment) fetchDays(); }, [appointment, fetchDays]);

  // Fetch slots for selected date
  useEffect(() => {
    if (!selectedDate || !appointment) return;
    const consultantId = appointment.consultantId ?? 'any';
    setLoadingSlots(true);
    setAvailableSlots([]);
    setSelectedTime('');
    setResolvedConsultant(null);
    fetch(`/api/availability?consultantId=${consultantId}&date=${selectedDate}&serviceType=${appointment.serviceType}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
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
  }, [selectedDate, appointment]);

  async function handleSubmit() {
    if (!selectedDate || !selectedTime || !token) return;
    setSubmitting(true);
    const consultantId = resolvedConsultant?.id ?? appointment?.consultantId ?? null;
    const res = await fetch('/api/appointments/modify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, date: selectedDate, time: selectedTime, consultantId }),
    });
    const data = await res.json();
    if (res.ok) {
      setSuccess(true);
    } else {
      alert(data.error ?? 'Erreur lors de la modification');
      setSubmitting(false);
    }
  }

  const calDays = () => {
    const firstDay = new Date(Date.UTC(calYear, calMonth - 1, 1)).getUTCDay();
    const total = new Date(Date.UTC(calYear, calMonth, 0)).getUTCDate();
    return { firstDay, total };
  };

  const prevMonth = () => {
    if (calMonth === 1) { setCalYear(calYear - 1); setCalMonth(12); }
    else setCalMonth(calMonth - 1);
    setSelectedDate(''); setAvailableSlots([]); setSelectedTime('');
  };
  const nextMonth = () => {
    if (calMonth === 12) { setCalYear(calYear + 1); setCalMonth(1); }
    else setCalMonth(calMonth + 1);
    setSelectedDate(''); setAvailableSlots([]); setSelectedTime('');
  };

  const today = new Date();
  const isBeforeToday = (d: number) => new Date(calYear, calMonth - 1, d) < today;

  // ── States ──────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow p-8 text-center max-w-md">
        <XCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900 mb-2">{isFr ? 'Lien invalide' : 'Invalid link'}</h2>
        <p className="text-gray-500 text-sm">{error}</p>
        <a href={`/${locale}/appointment`} className="mt-4 inline-block text-teal-600 text-sm hover:underline">
          {isFr ? 'Réserver un nouveau rendez-vous' : 'Book a new appointment'}
        </a>
      </div>
    </div>
  );

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
        <CheckCircle className="h-16 w-16 text-teal-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {isFr ? 'Rendez-vous modifié !' : 'Appointment updated!'}
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          {isFr
            ? `Votre rendez-vous a été déplacé au ${selectedDate} à ${selectedTime}. Un admin devra reconfirmer le paiement.`
            : `Your appointment has been moved to ${selectedDate} at ${selectedTime}. An admin will need to reconfirm the payment.`}
        </p>
        <a href={`/${locale}`} className="inline-block mt-2 px-6 py-2 bg-teal-500 text-white rounded-lg text-sm hover:bg-teal-600">
          {isFr ? 'Retour à l\'accueil' : 'Back to home'}
        </a>
      </div>
    </div>
  );

  const { firstDay, total } = calDays();
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: total }, (_, i) => i + 1));

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 pt-28">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {isFr ? 'Modifier votre rendez-vous' : 'Modify your appointment'}
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          {isFr ? 'Choisissez une nouvelle date et heure.' : 'Choose a new date and time.'}
        </p>

        {/* Current appointment info */}
        {appointment && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-3 font-semibold">
              {isFr ? 'Rendez-vous actuel' : 'Current appointment'}
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-400">{isFr ? 'Date' : 'Date'}</span>
                <p className="font-medium text-gray-900 mt-0.5">
                  {new Date(appointment.date).toLocaleDateString(isFr ? 'fr-FR' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
              <div>
                <span className="text-gray-400">{isFr ? 'Heure' : 'Time'}</span>
                <p className="font-medium text-gray-900 mt-0.5">{appointment.time}</p>
              </div>
              <div>
                <span className="text-gray-400">{isFr ? 'Service' : 'Service'}</span>
                <p className="font-medium text-gray-900 mt-0.5">{appointment.serviceType}</p>
              </div>
              {appointment.consultant && (
                <div>
                  <span className="text-gray-400">{isFr ? 'Consultant' : 'Consultant'}</span>
                  <p className="font-medium text-gray-900 mt-0.5">{appointment.consultant.displayName}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Calendar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            <h3 className="font-semibold text-gray-900 text-sm">
              {MONTHS_FR[calMonth - 1]} {calYear}
            </h3>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_FR.map((d) => (
              <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
            ))}
          </div>

          {loadingDays ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-teal-500" /></div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (!day) return <div key={`e-${i}`} />;
                const isPast = isBeforeToday(day);
                const dateStr = `${calYear}-${String(calMonth).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                const isAvail = availableDays.includes(day) && !isPast;
                const isSelected = selectedDate === dateStr;
                return (
                  <button
                    key={day}
                    disabled={!isAvail}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-teal-500 text-white'
                        : isAvail
                        ? 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                        : 'text-gray-300 cursor-not-allowed'
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
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-teal-500" />
              <h3 className="font-semibold text-gray-900 text-sm">
                {isFr ? 'Créneaux disponibles' : 'Available slots'}
              </h3>
            </div>
            {loadingSlots ? (
              <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-teal-500" /></div>
            ) : availableSlots.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                {isFr ? 'Aucun créneau disponible ce jour.' : 'No slots available this day.'}
              </p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => {
                      setSelectedTime(slot);
                      if (slotConsultantMap[slot]) setResolvedConsultant(slotConsultantMap[slot]);
                    }}
                    className={`py-2 rounded-lg text-sm font-medium transition-all border ${
                      selectedTime === slot
                        ? 'bg-teal-500 text-white border-teal-500'
                        : 'border-gray-200 text-gray-700 hover:border-teal-400 hover:text-teal-600'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
            {resolvedConsultant && selectedTime && (
              <p className="text-xs text-teal-600 mt-3">
                👤 {resolvedConsultant.displayName} {isFr ? 'sera votre consultant pour ce créneau.' : 'will be your consultant for this slot.'}
              </p>
            )}
          </div>
        )}

        {/* Confirm button */}
        {selectedDate && selectedTime && (
          <div className="flex gap-3">
            <a
              href={`/${locale}`}
              className="flex-1 text-center py-3 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
            >
              {isFr ? 'Annuler' : 'Cancel'}
            </a>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-teal-600 disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isFr ? `Confirmer — ${selectedDate} à ${selectedTime}` : `Confirm — ${selectedDate} at ${selectedTime}`}
            </button>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-4">
          {isFr
            ? 'Les modifications sont possibles jusqu\'à 24h avant votre rendez-vous.'
            : 'Modifications are possible up to 24 hours before your appointment.'}
        </p>
      </div>
    </div>
  );
}
