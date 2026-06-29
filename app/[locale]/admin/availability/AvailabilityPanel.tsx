'use client';

import { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Loader2, Check, Calendar } from 'lucide-react';

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface DayConfig {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isEnabled: boolean;
}

interface Override {
  id: string;
  date: string;
  isBlocked: boolean;
  startTime: string | null;
  endTime: string | null;
}

const defaultWeekly: DayConfig[] = [0, 1, 2, 3, 4, 5, 6].map((d) => ({
  dayOfWeek: d,
  startTime: '09:00',
  endTime: '17:00',
  isEnabled: d >= 1 && d <= 5,
}));

export default function AvailabilityPanel({ locale }: { locale: string }) {
  const isFr = locale === 'fr';
  const days = isFr ? DAYS_FR : DAYS_EN;

  const [weekly, setWeekly] = useState<DayConfig[]>(defaultWeekly);
  const [overrides, setOverrides] = useState<Override[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [noProfile, setNoProfile] = useState(false);

  // New override form
  const [newOverrideDate, setNewOverrideDate] = useState('');
  const [newOverrideBlocked, setNewOverrideBlocked] = useState(true);
  const [newOverrideStart, setNewOverrideStart] = useState('09:00');
  const [newOverrideEnd, setNewOverrideEnd] = useState('17:00');
  const [addingOverride, setAddingOverride] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/availability');
    const data = await res.json();
    if (!data.consultantId) {
      setNoProfile(true);
      setLoading(false);
      return;
    }
    if (data.weekly?.length > 0) {
      const merged = defaultWeekly.map((def) => {
        const found = data.weekly.find((w: DayConfig) => w.dayOfWeek === def.dayOfWeek);
        return found ?? def;
      });
      setWeekly(merged);
    }
    setOverrides(data.overrides ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function updateDay(idx: number, field: keyof DayConfig, value: any) {
    setWeekly((prev) => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  }

  async function saveWeekly() {
    setSaving(true);
    await fetch('/api/admin/availability', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weekly }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function addOverride() {
    if (!newOverrideDate) return;
    setAddingOverride(true);
    await fetch('/api/admin/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: newOverrideDate,
        isBlocked: newOverrideBlocked,
        startTime: newOverrideBlocked ? null : newOverrideStart,
        endTime: newOverrideBlocked ? null : newOverrideEnd,
      }),
    });
    setNewOverrideDate('');
    setAddingOverride(false);
    load();
  }

  async function removeOverride(id: string) {
    await fetch(`/api/admin/availability?overrideId=${id}`, { method: 'DELETE' });
    load();
  }

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;
  }

  if (noProfile) {
    return (
      <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-100">
        <Clock className="h-12 w-12 mx-auto mb-3 opacity-40" />
        <p className="font-medium">{isFr ? 'Aucun profil consultant trouvé' : 'No consultant profile found'}</p>
        <p className="text-sm mt-1">{isFr ? 'Demandez au Super Admin de vous créer un profil consultant.' : 'Ask the Super Admin to create a consultant profile for you.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{isFr ? 'Mes disponibilités' : 'My Availability'}</h1>
        <p className="text-gray-500 mt-1">{isFr ? 'Définissez vos horaires hebdomadaires et vos exceptions' : 'Set your weekly schedule and date exceptions'}</p>
      </div>

      {/* Weekly schedule */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <h2 className="font-semibold text-gray-900">{isFr ? 'Horaires hebdomadaires' : 'Weekly schedule'}</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {weekly.map((day, idx) => (
            <div key={day.dayOfWeek} className="flex items-center gap-4 px-6 py-3">
              <div className="w-28 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={day.isEnabled}
                  onChange={(e) => updateDay(idx, 'isEnabled', e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                <span className={`text-sm font-medium ${day.isEnabled ? 'text-gray-900' : 'text-gray-400'}`}>
                  {days[day.dayOfWeek]}
                </span>
              </div>
              {day.isEnabled ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={day.startTime}
                    onChange={(e) => updateDay(idx, 'startTime', e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1"
                  />
                  <span className="text-gray-400 text-sm">→</span>
                  <input
                    type="time"
                    value={day.endTime}
                    onChange={(e) => updateDay(idx, 'endTime', e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1"
                  />
                </div>
              ) : (
                <span className="text-sm text-gray-400 italic">{isFr ? 'Indisponible' : 'Unavailable'}</span>
              )}
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-gray-100">
          <button
            onClick={saveWeekly}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
            style={{ backgroundColor: '#233691' }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
            {saved ? (isFr ? 'Enregistré !' : 'Saved!') : (isFr ? 'Enregistrer les horaires' : 'Save schedule')}
          </button>
        </div>
      </div>

      {/* Date overrides */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <h2 className="font-semibold text-gray-900">{isFr ? 'Exceptions par date' : 'Date exceptions'}</h2>
        </div>

        {/* Add override form */}
        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
          <p className="text-xs text-gray-500 mb-3">{isFr ? 'Bloquer une journée ou définir des heures spéciales' : 'Block a day or set special hours'}</p>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-600 mb-1">{isFr ? 'Date' : 'Date'}</label>
              <input
                type="date"
                value={newOverrideDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setNewOverrideDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">{isFr ? 'Type' : 'Type'}</label>
              <select
                value={newOverrideBlocked ? 'blocked' : 'custom'}
                onChange={(e) => setNewOverrideBlocked(e.target.value === 'blocked')}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1"
              >
                <option value="blocked">{isFr ? 'Jour de congé' : 'Day off'}</option>
                <option value="custom">{isFr ? 'Horaires spéciaux' : 'Custom hours'}</option>
              </select>
            </div>
            {!newOverrideBlocked && (
              <>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{isFr ? 'Début' : 'Start'}</label>
                  <input type="time" value={newOverrideStart} onChange={(e) => setNewOverrideStart(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{isFr ? 'Fin' : 'End'}</label>
                  <input type="time" value={newOverrideEnd} onChange={(e) => setNewOverrideEnd(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
                </div>
              </>
            )}
            <button
              onClick={addOverride}
              disabled={!newOverrideDate || addingOverride}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#233691' }}
            >
              {addingOverride ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              {isFr ? 'Ajouter' : 'Add'}
            </button>
          </div>
        </div>

        {overrides.length === 0 ? (
          <p className="px-6 py-4 text-sm text-gray-400 italic">{isFr ? 'Aucune exception configurée' : 'No exceptions configured'}</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {overrides.map((o) => (
              <li key={o.id} className="flex items-center gap-3 px-6 py-3">
                <span className="text-sm font-medium text-gray-700 w-28">{new Date(o.date).toLocaleDateString(isFr ? 'fr-FR' : 'en-GB')}</span>
                {o.isBlocked ? (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{isFr ? 'Congé' : 'Day off'}</span>
                ) : (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{o.startTime} → {o.endTime}</span>
                )}
                <div className="flex-1" />
                <button onClick={() => removeOverride(o.id)} className="p-1 rounded hover:bg-red-50 text-red-400"><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
