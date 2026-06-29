'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, User, Loader2, X, Check, Eye, EyeOff } from 'lucide-react';

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
}

interface Consultant {
  id: string;
  userId: string;
  displayName: string;
  titleFr: string | null;
  titleEn: string | null;
  bioFr: string | null;
  bioEn: string | null;
  photoUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  user: AdminUser;
  _count: { appointments: number };
}

const emptyForm = {
  userId: '',
  displayName: '',
  titleFr: '',
  titleEn: '',
  bioFr: '',
  bioEn: '',
  photoUrl: '',
  displayOrder: 0,
};

export default function ConsultantsAdminPanel({ locale }: { locale: string }) {
  const isFr = locale === 'fr';
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const [c, u] = await Promise.all([
      fetch('/api/admin/consultants').then((r) => r.json()),
      fetch('/api/admin/users').then((r) => r.json()),
    ]);
    setConsultants(Array.isArray(c) ? c : []);
    setAdminUsers(Array.isArray(u?.admins) ? u.admins.filter((a: any) => ['ADMIN', 'SUPER_ADMIN'].includes(a.role)) : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(true);
  }

  function openEdit(c: Consultant) {
    setForm({
      userId: c.userId,
      displayName: c.displayName,
      titleFr: c.titleFr ?? '',
      titleEn: c.titleEn ?? '',
      bioFr: c.bioFr ?? '',
      bioEn: c.bioEn ?? '',
      photoUrl: c.photoUrl ?? '',
      displayOrder: c.displayOrder,
    });
    setEditId(c.id);
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    const payload = {
      ...form,
      titleFr: form.titleFr || null,
      titleEn: form.titleEn || null,
      bioFr: form.bioFr || null,
      bioEn: form.bioEn || null,
      photoUrl: form.photoUrl || null,
    };
    if (editId) {
      await fetch(`/api/admin/consultants/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/admin/consultants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    setSaving(false);
    setShowForm(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm(isFr ? 'Supprimer ce consultant ?' : 'Delete this consultant?')) return;
    await fetch(`/api/admin/consultants/${id}`, { method: 'DELETE' });
    load();
  }

  async function toggleActive(c: Consultant) {
    await fetch(`/api/admin/consultants/${c.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...c, isActive: !c.isActive }),
    });
    load();
  }

  const alreadyAssigned = new Set(consultants.map((c) => c.userId));
  const availableUsers = adminUsers.filter((u) => !alreadyAssigned.has(u.id) || (editId && consultants.find((c) => c.id === editId)?.userId === u.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{isFr ? 'Consultants' : 'Consultants'}</h1>
          <p className="text-gray-500 mt-1">{isFr ? 'Gérez les profils des consultants visibles par les clients' : 'Manage consultant profiles visible to clients'}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
          style={{ backgroundColor: '#233691' }}
        >
          <Plus className="h-4 w-4" />
          {isFr ? 'Ajouter' : 'Add consultant'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
      ) : consultants.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-100">
          <User className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>{isFr ? 'Aucun consultant. Ajoutez un profil pour commencer.' : 'No consultants yet. Add a profile to get started.'}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {consultants.map((c) => (
            <div key={c.id} className={`bg-white rounded-xl border shadow-sm p-5 ${!c.isActive ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-3">
                {c.photoUrl ? (
                  <img src={c.photoUrl} alt={c.displayName} className="h-12 w-12 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(35,54,145,0.1)' }}>
                    <User className="h-6 w-6" style={{ color: '#233691' }} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{c.displayName}</h3>
                  {c.titleFr && <p className="text-xs text-gray-500 truncate">{isFr ? c.titleFr : (c.titleEn ?? c.titleFr)}</p>}
                  <p className="text-xs text-gray-400 mt-1">{c.user.email}</p>
                  <p className="text-xs text-gray-400">{c._count.appointments} {isFr ? 'rendez-vous' : 'appointments'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                <button onClick={() => toggleActive(c)} className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {c.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  {c.isActive ? (isFr ? 'Actif' : 'Active') : (isFr ? 'Inactif' : 'Inactive')}
                </button>
                <div className="flex-1" />
                <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-amber-50 text-amber-600"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{editId ? (isFr ? 'Modifier le consultant' : 'Edit consultant') : (isFr ? 'Nouveau consultant' : 'New consultant')}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {!editId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{isFr ? 'Utilisateur admin *' : 'Admin user *'}</label>
                  <select
                    value={form.userId}
                    onChange={(e) => setForm({ ...form, userId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  >
                    <option value="">{isFr ? 'Sélectionner...' : 'Select...'}</option>
                    {availableUsers.map((u) => (
                      <option key={u.id} value={u.id}>{u.name ?? u.email} ({u.email})</option>
                    ))}
                  </select>
                </div>
              )}
              {[
                { key: 'displayName', label: isFr ? 'Nom affiché *' : 'Display name *' },
                { key: 'titleFr', label: isFr ? 'Titre (FR)' : 'Title (FR)' },
                { key: 'titleEn', label: isFr ? 'Titre (EN)' : 'Title (EN)' },
                { key: 'photoUrl', label: 'Photo URL' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type="text"
                    value={(form as any)[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  />
                </div>
              ))}
              {[
                { key: 'bioFr', label: isFr ? 'Bio (FR)' : 'Bio (FR)' },
                { key: 'bioEn', label: isFr ? 'Bio (EN)' : 'Bio (EN)' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <textarea
                    rows={3}
                    value={(form as any)[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{isFr ? 'Ordre d\'affichage' : 'Display order'}</label>
                <input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 pt-0">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                {isFr ? 'Annuler' : 'Cancel'}
              </button>
              <button
                onClick={handleSave}
                disabled={!form.displayName || (!editId && !form.userId) || saving}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#233691' }}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {isFr ? 'Enregistrer' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
