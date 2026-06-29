'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar, List, ChevronLeft, ChevronRight,
  Mail, Phone, AlertCircle, CheckCircle, XCircle, Clock,
  CreditCard, Loader2, History,
} from 'lucide-react';

interface Appointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  serviceType: string;
  status: string;
  message: string | null;
  consultantId: string | null;
  consultant: { id: string; displayName: string } | null;
  payment: { status: string; amount: number; currency: string } | null;
}

interface Consultant { id: string; displayName: string }

interface Props {
  appointments: Appointment[];
  myConsultantId: string | null;
  allConsultants: Consultant[];
  locale: string;
}

const CONSULTANT_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-emerald-500',
  'bg-orange-500', 'bg-rose-500', 'bg-teal-500', 'bg-indigo-500',
];
const CONSULTANT_LIGHT = [
  'bg-blue-100 text-blue-800', 'bg-purple-100 text-purple-800', 'bg-emerald-100 text-emerald-800',
  'bg-orange-100 text-orange-800', 'bg-rose-100 text-rose-800', 'bg-teal-100 text-teal-800', 'bg-indigo-100 text-indigo-800',
];

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-slate-100 text-slate-600',
  CANCELLED: 'bg-red-100 text-red-700',
};
const STATUS_ICONS: Record<string, React.ReactNode> = {
  PENDING: <AlertCircle className="h-3 w-3" />,
  CONFIRMED: <CheckCircle className="h-3 w-3" />,
  COMPLETED: <CheckCircle className="h-3 w-3" />,
  CANCELLED: <XCircle className="h-3 w-3" />,
};

function ConfirmBtn({ appointmentId, paymentStatus }: { appointmentId: string; paymentStatus: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (paymentStatus !== 'PENDING') return null;

  const confirm = async () => {
    if (!window.confirm('Confirmer le paiement reçu ? Un email sera envoyé au client.')) return;
    setLoading(true);
    await fetch(`/api/appointments/${appointmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmPayment: true }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <button
      onClick={confirm}
      disabled={loading}
      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium whitespace-nowrap"
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CreditCard className="h-3 w-3" />}
      {loading ? '...' : 'Confirmer paiement'}
    </button>
  );
}

// An appointment is "past" if its date is before today OR status is terminal
function isPastAppointment(a: Appointment): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const apptDate = new Date(a.date);
  apptDate.setHours(0, 0, 0, 0);
  return apptDate < today || a.status === 'COMPLETED' || a.status === 'CANCELLED';
}

export function AppointmentsPanel({ appointments, myConsultantId, allConsultants, locale }: Props) {
  const isFr = locale === 'fr';
  const [timeFilter, setTimeFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [filter, setFilter] = useState<string>(myConsultantId ? 'mine' : 'all');
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Split into upcoming vs past
  const upcomingAll = useMemo(() => appointments.filter(a => !isPastAppointment(a)).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [appointments]);
  const pastAll = useMemo(() => appointments.filter(a => isPastAppointment(a)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [appointments]);

  const baseList = timeFilter === 'upcoming' ? upcomingAll : pastAll;
  const isHistory = timeFilter === 'past';

  // Counts scoped to the active consultant filter (for pill badges + subtitle)
  const applyConsultantFilter = (list: Appointment[]) => {
    if (filter === 'mine') return list.filter(a => a.consultantId === myConsultantId);
    if (filter === 'all') return list;
    return list.filter(a => a.consultantId === filter);
  };
  const upcomingCount = useMemo(() => applyConsultantFilter(upcomingAll).length, [upcomingAll, filter, myConsultantId]);
  const pastCount = useMemo(() => applyConsultantFilter(pastAll).length, [pastAll, filter, myConsultantId]);

  // Consultant color index
  const consultantColorIndex = useMemo(() => {
    const map: Record<string, number> = {};
    allConsultants.forEach((c, i) => { map[c.id] = i % CONSULTANT_COLORS.length; });
    return map;
  }, [allConsultants]);
  const colorFor = (cId: string | null) => cId ? (consultantColorIndex[cId] ?? 0) : 0;

  // Filtered by consultant
  const filtered = useMemo(() => {
    if (filter === 'mine') return baseList.filter(a => a.consultantId === myConsultantId);
    if (filter === 'all') return baseList;
    return baseList.filter(a => a.consultantId === filter);
  }, [baseList, filter, myConsultantId]);

  const stats = useMemo(() => ({
    total: filtered.length,
    pending: filtered.filter(a => a.status === 'PENDING').length,
    confirmed: filtered.filter(a => a.status === 'CONFIRMED').length,
    paymentPending: filtered.filter(a => a.payment?.status === 'PENDING').length,
  }), [filtered]);

  // Calendar helpers
  const monthNames = isFr
    ? ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
    : ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames = isFr ? ['Lu','Ma','Me','Je','Ve','Sa','Di'] : ['Mo','Tu','We','Th','Fr','Sa','Su'];

  const firstDayAdj = (new Date(calYear, calMonth, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  const apptByDay = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    filtered.forEach(a => {
      const d = new Date(a.date);
      if (d.getFullYear() === calYear && d.getMonth() === calMonth) {
        const key = `${calYear}-${String(calMonth + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        if (!map[key]) map[key] = [];
        map[key].push(a);
      }
    });
    return map;
  }, [filtered, calYear, calMonth]);

  const selectedDayAppts = selectedDay ? (apptByDay[selectedDay] ?? []) : [];

  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); setSelectedDay(null); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); setSelectedDay(null); };

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isFr ? 'Rendez-vous' : 'Appointments'}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {upcomingCount} {isFr ? 'à venir' : 'upcoming'} · {pastCount} {isFr ? 'passés' : 'past'}
          </p>
        </div>
        {/* View toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
          <button onClick={() => setView('list')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            <List className="h-4 w-4" />{isFr ? 'Liste' : 'List'}
          </button>
          <button onClick={() => setView('calendar')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'calendar' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            <Calendar className="h-4 w-4" />{isFr ? 'Calendrier' : 'Calendar'}
          </button>
        </div>
      </div>

      {/* ── Time filter (Upcoming / History) ── */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => { setTimeFilter('upcoming'); setSelectedDay(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeFilter === 'upcoming' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Clock className="h-4 w-4" />
          {isFr ? 'À venir' : 'Upcoming'}
          {upcomingCount > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${timeFilter === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}`}>
              {upcomingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => { setTimeFilter('past'); setSelectedDay(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeFilter === 'past' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <History className="h-4 w-4" />
          {isFr ? 'Historique' : 'History'}
          {pastCount > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${timeFilter === 'past' ? 'bg-slate-200 text-slate-600' : 'bg-gray-200 text-gray-500'}`}>
              {pastCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Consultant filter tabs ── */}
      <div className="flex flex-wrap gap-2">
        {myConsultantId && (
          <button onClick={() => setFilter('mine')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${filter === 'mine' ? 'border-transparent text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`} style={filter === 'mine' ? { backgroundColor: '#233691' } : {}}>
            {isFr ? 'Mes rendez-vous' : 'My appointments'}
          </button>
        )}
        <button onClick={() => setFilter('all')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${filter === 'all' ? 'border-transparent text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`} style={filter === 'all' ? { backgroundColor: '#233691' } : {}}>
          {isFr ? 'Tous' : 'All'}
        </button>
        {allConsultants.filter(c => c.id !== myConsultantId).map(c => (
          <button key={c.id} onClick={() => setFilter(c.id)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${filter === c.id ? 'border-transparent text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`} style={filter === c.id ? { backgroundColor: '#233691' } : {}}>
            {c.displayName}
          </button>
        ))}
      </div>

      {/* ── Calendar legend ── */}
      {view === 'calendar' && allConsultants.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {allConsultants.map(c => (
            <div key={c.id} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className={`h-2.5 w-2.5 rounded-full ${CONSULTANT_COLORS[colorFor(c.id)]}`} />
              {c.displayName}
            </div>
          ))}
        </div>
      )}

      {/* ── Stats ── */}
      {!isHistory && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: isFr ? 'Total' : 'Total', value: stats.total, color: 'text-gray-900' },
            { label: isFr ? 'En attente' : 'Pending', value: stats.pending, color: 'text-yellow-600' },
            { label: isFr ? 'Confirmés' : 'Confirmed', value: stats.confirmed, color: 'text-green-600' },
            { label: isFr ? 'Paiement en attente' : 'Payment pending', value: stats.paymentPending, color: 'text-orange-500' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {view === 'list' && (
        <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${isHistory ? 'border-gray-100 opacity-90' : 'border-gray-100'}`}>
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              {isHistory
                ? <History className="mx-auto h-10 w-10 text-gray-200 mb-3" />
                : <Calendar className="mx-auto h-10 w-10 text-gray-200 mb-3" />}
              <p className="font-medium text-gray-400 text-sm">
                {isHistory
                  ? (isFr ? 'Aucun rendez-vous passé.' : 'No past appointments.')
                  : filter === 'mine'
                    ? (isFr ? "Vous n'avez pas encore de rendez-vous à venir." : "You have no upcoming appointments.")
                    : (isFr ? 'Aucun rendez-vous à venir.' : 'No upcoming appointments.')}
              </p>
              {!isHistory && filter === 'mine' && (
                <p className="text-xs text-gray-300 mt-1">{isFr ? 'Filtrez sur "Tous" pour voir ceux de vos collègues.' : 'Switch to "All" to see colleagues\' appointments.'}</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`border-b ${isHistory ? 'bg-slate-50 border-slate-100' : 'bg-gray-50 border-gray-100'}`}>
                  <tr>
                    {[
                      isFr ? 'Client' : 'Client',
                      isFr ? 'Date & Heure' : 'Date & Time',
                      isFr ? 'Service' : 'Service',
                      isFr ? 'Consultant' : 'Consultant',
                      isFr ? 'Statut' : 'Status',
                      isFr ? 'Paiement' : 'Payment',
                      isFr ? 'Actions' : 'Actions',
                    ].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(a => {
                    const isOwn = a.consultantId === myConsultantId;
                    const ci = colorFor(a.consultantId);
                    return (
                      <tr key={a.id} className={`transition-colors ${isHistory ? 'hover:bg-slate-50/60' : 'hover:bg-gray-50'} ${!isOwn && myConsultantId ? 'opacity-70' : ''}`}>
                        <td className="px-5 py-4">
                          <div className={`font-medium text-sm ${isHistory ? 'text-gray-500' : 'text-gray-900'}`}>{a.name}</div>
                          <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Mail className="h-3 w-3" />{a.email}</div>
                          <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" />{a.phone}</div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm">
                          <div className={`flex items-center gap-1.5 ${isHistory ? 'text-gray-400' : 'text-gray-700'}`}>
                            <Calendar className="h-3.5 w-3.5 text-gray-300" />
                            {new Date(a.date).toLocaleDateString(isFr ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 text-gray-400 text-xs">
                            <Clock className="h-3 w-3" />{a.time}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2 py-1 rounded font-medium ${isHistory ? 'bg-gray-50 text-gray-400' : 'bg-gray-100 text-gray-700'}`}>{a.serviceType}</span>
                        </td>
                        <td className="px-5 py-4">
                          {a.consultant
                            ? <span className={`text-xs px-2 py-1 rounded-full font-medium ${CONSULTANT_LIGHT[ci]}`}>{a.consultant.displayName}</span>
                            : <span className="text-xs text-gray-300">—</span>}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[a.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {STATUS_ICONS[a.status]}{a.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {a.payment ? (
                            <div>
                              <span className={`text-xs font-medium ${a.payment.status === 'COMPLETED' ? 'text-emerald-600' : a.payment.status === 'PENDING' ? 'text-orange-500' : 'text-red-400'}`}>
                                {a.payment.status}
                              </span>
                              <div className="text-xs text-gray-300">{a.payment.amount} {a.payment.currency}</div>
                            </div>
                          ) : <span className="text-xs text-gray-200">—</span>}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            {/* No actions in history view; own upcoming appointments can confirm payment */}
                            {!isHistory && isOwn && (
                              <ConfirmBtn appointmentId={a.id} paymentStatus={a.payment?.status ?? null} />
                            )}
                            <Link
                              href={`/${locale}/admin/appointments/${a.id}`}
                              className="text-xs px-2.5 py-1 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 whitespace-nowrap"
                            >
                              {isFr ? 'Détails' : 'Details'}
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── CALENDAR VIEW ── */}
      {view === 'calendar' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100"><ChevronLeft className="h-5 w-5 text-gray-400" /></button>
              <span className="font-semibold text-gray-900">{monthNames[calMonth]} {calYear}</span>
              <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100"><ChevronRight className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-7 border-b border-gray-50">
              {dayNames.map(d => <div key={d} className="py-2 text-center text-xs font-medium text-gray-300">{d}</div>)}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDayAdj }).map((_, i) => <div key={`e-${i}`} className="min-h-[80px] border-b border-r border-gray-50 bg-gray-50/30" />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const dateKey = `${calYear}-${String(calMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                const dayAppts = apptByDay[dateKey] ?? [];
                const today = new Date();
                const isToday = today.getFullYear() === calYear && today.getMonth() === calMonth && today.getDate() === day;
                const isSelected = selectedDay === dateKey;
                const isPastDay = new Date(calYear, calMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                return (
                  <div
                    key={day}
                    onClick={() => dayAppts.length && setSelectedDay(isSelected ? null : dateKey)}
                    className={`min-h-[80px] border-b border-r border-gray-50 p-1.5 transition-colors ${dayAppts.length ? 'cursor-pointer' : ''} ${isSelected ? 'bg-blue-50' : isPastDay ? 'bg-gray-50/50 hover:bg-gray-50' : 'hover:bg-gray-50'}`}
                  >
                    <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'text-white' : isPastDay ? 'text-gray-300' : 'text-gray-600'}`}
                      style={isToday ? { backgroundColor: '#233691' } : {}}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayAppts.slice(0, 3).map(a => (
                        <div key={a.id} className={`text-xs px-1 py-0.5 rounded truncate ${isPastDay || isHistory ? 'opacity-60' : ''} ${CONSULTANT_LIGHT[colorFor(a.consultantId)]}`} title={`${a.time} – ${a.name}`}>
                          {a.time} {a.name.split(' ')[0]}
                        </div>
                      ))}
                      {dayAppts.length > 3 && <div className="text-xs text-gray-300 pl-1">+{dayAppts.length - 3}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected day detail */}
          {selectedDay && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h3 className="font-semibold text-gray-900">
                {new Date(selectedDay + 'T12:00:00').toLocaleDateString(isFr ? 'fr-FR' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                <span className="ml-2 text-sm font-normal text-gray-400">({selectedDayAppts.length})</span>
              </h3>
              <div className="space-y-2">
                {selectedDayAppts.map(a => {
                  const isOwn = a.consultantId === myConsultantId;
                  const ci = colorFor(a.consultantId);
                  return (
                    <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200">
                      <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${CONSULTANT_COLORS[ci]}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{a.time}</span>
                          <span className="text-sm text-gray-700">{a.name}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_STYLES[a.status] ?? ''}`}>{a.status}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {a.serviceType}{a.consultant ? ` · ${a.consultant.displayName}` : ''}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!isHistory && isOwn && <ConfirmBtn appointmentId={a.id} paymentStatus={a.payment?.status ?? null} />}
                        <Link href={`/${locale}/admin/appointments/${a.id}`} className="text-xs px-2.5 py-1 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50">
                          {isFr ? 'Détails' : 'Details'}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
