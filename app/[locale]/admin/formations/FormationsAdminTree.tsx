'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  Upload,
  GraduationCap,
  Building2,
  BookOpen,
  X,
  Check,
  Loader2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Filiere {
  id: string;
  nameFr: string;
  nameAr: string | null;
  active: boolean;
}

interface Establishment {
  id: string;
  nameFr: string;
  nameAr: string | null;
  active: boolean;
  _count?: { filieres: number };
  filieres?: Filiere[];
}

interface University {
  id: string;
  nameFr: string;
  nameAr: string | null;
  active: boolean;
  _count?: { establishments: number };
  establishments?: Establishment[];
}

type ModalMode = 'add-university' | 'edit-university' | 'add-establishment' | 'edit-establishment' | 'add-filiere' | 'edit-filiere' | null;

interface ModalState {
  mode: ModalMode;
  university?: University;
  establishment?: Establishment;
  filiere?: Filiere;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FormationsAdminTree({ locale }: { locale: string }) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUnis, setExpandedUnis] = useState<Set<string>>(new Set());
  const [expandedEtabs, setExpandedEtabs] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<ModalState>({ mode: null });
  const [formFr, setFormFr] = useState('');
  const [formAr, setFormAr] = useState('');
  const [formUniversityId, setFormUniversityId] = useState('');
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFr = locale === 'fr';
  const t = {
    title: isFr ? 'Offres de Formations' : 'Training Offers',
    subtitle: isFr ? 'Gérez les universités, établissements et filières' : 'Manage universities, establishments and programs',
    importExcel: isFr ? 'Importer Excel' : 'Import Excel',
    addUniversity: isFr ? 'Ajouter une université' : 'Add university',
    addEstablishment: isFr ? 'Ajouter un établissement' : 'Add establishment',
    addFiliere: isFr ? 'Ajouter une filière' : 'Add program',
    editUniversity: isFr ? 'Modifier l\'université' : 'Edit university',
    editEstablishment: isFr ? 'Modifier l\'établissement' : 'Edit establishment',
    editFiliere: isFr ? 'Modifier la filière' : 'Edit program',
    nameFr: isFr ? 'Nom (Français)' : 'Name (French)',
    nameAr: isFr ? 'Nom (Arabe)' : 'Name (Arabic)',
    university: isFr ? 'Université' : 'University',
    save: isFr ? 'Enregistrer' : 'Save',
    cancel: isFr ? 'Annuler' : 'Cancel',
    deleteConfirm: isFr ? 'Supprimer cet élément ?' : 'Delete this item?',
    establishments: isFr ? 'établissements' : 'establishments',
    filieres: isFr ? 'filières' : 'programs',
  };

  // ─── Data fetching ───────────────────────────────────────────────────────────

  async function fetchUniversities() {
    setLoading(true);
    const res = await fetch('/api/admin/formations/universities');
    const data = await res.json();
    setUniversities(data);
    setLoading(false);
  }

  async function fetchEstablishments(universityId: string): Promise<Establishment[]> {
    const res = await fetch(`/api/admin/formations/establishments?universityId=${universityId}`);
    return res.json();
  }

  async function fetchFilieres(establishmentId: string): Promise<Filiere[]> {
    const res = await fetch(`/api/admin/formations/filieres?establishmentId=${establishmentId}`);
    return res.json();
  }

  useEffect(() => { fetchUniversities(); }, []);

  // ─── Tree expand/collapse ────────────────────────────────────────────────────

  async function toggleUniversity(uni: University) {
    const next = new Set(expandedUnis);
    if (next.has(uni.id)) {
      next.delete(uni.id);
      setExpandedUnis(next);
    } else {
      next.add(uni.id);
      setExpandedUnis(next);
      if (!uni.establishments) {
        const etabs = await fetchEstablishments(uni.id);
        setUniversities(prev => prev.map(u => u.id === uni.id ? { ...u, establishments: etabs } : u));
      }
    }
  }

  async function toggleEstablishment(uniId: string, etab: Establishment) {
    const next = new Set(expandedEtabs);
    if (next.has(etab.id)) {
      next.delete(etab.id);
      setExpandedEtabs(next);
    } else {
      next.add(etab.id);
      setExpandedEtabs(next);
      if (!etab.filieres) {
        const filieres = await fetchFilieres(etab.id);
        setUniversities(prev => prev.map(u =>
          u.id === uniId
            ? { ...u, establishments: u.establishments?.map(e => e.id === etab.id ? { ...e, filieres } : e) }
            : u
        ));
      }
    }
  }

  // ─── Modal helpers ───────────────────────────────────────────────────────────

  function openModal(state: ModalState) {
    setFormFr(state.university?.nameFr ?? state.establishment?.nameFr ?? state.filiere?.nameFr ?? '');
    setFormAr(state.university?.nameAr ?? state.establishment?.nameAr ?? state.filiere?.nameAr ?? '');
    setFormUniversityId(state.establishment?.id ?? state.university?.id ?? '');
    setModal(state);
  }

  function closeModal() {
    setModal({ mode: null });
    setFormFr('');
    setFormAr('');
    setFormUniversityId('');
  }

  // ─── CRUD operations ─────────────────────────────────────────────────────────

  async function handleSave() {
    setSaving(true);
    const body = { nameFr: formFr, nameAr: formAr || null };

    try {
      if (modal.mode === 'add-university') {
        await fetch('/api/admin/formations/universities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        await fetchUniversities();
      } else if (modal.mode === 'edit-university' && modal.university) {
        await fetch(`/api/admin/formations/universities/${modal.university.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        await fetchUniversities();
      } else if (modal.mode === 'add-establishment' && modal.university) {
        await fetch('/api/admin/formations/establishments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, universityId: modal.university.id }) });
        const etabs = await fetchEstablishments(modal.university.id);
        setUniversities(prev => prev.map(u => u.id === modal.university!.id ? { ...u, establishments: etabs } : u));
      } else if (modal.mode === 'edit-establishment' && modal.establishment) {
        await fetch(`/api/admin/formations/establishments/${modal.establishment.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (modal.university) {
          const etabs = await fetchEstablishments(modal.university.id);
          setUniversities(prev => prev.map(u => u.id === modal.university!.id ? { ...u, establishments: etabs } : u));
        }
      } else if (modal.mode === 'add-filiere' && modal.establishment && modal.university) {
        await fetch('/api/admin/formations/filieres', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, establishmentId: modal.establishment.id }) });
        const filieres = await fetchFilieres(modal.establishment.id);
        setUniversities(prev => prev.map(u => u.id === modal.university!.id ? { ...u, establishments: u.establishments?.map(e => e.id === modal.establishment!.id ? { ...e, filieres } : e) } : u));
      } else if (modal.mode === 'edit-filiere' && modal.filiere && modal.establishment && modal.university) {
        await fetch(`/api/admin/formations/filieres/${modal.filiere.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const filieres = await fetchFilieres(modal.establishment.id);
        setUniversities(prev => prev.map(u => u.id === modal.university!.id ? { ...u, establishments: u.establishments?.map(e => e.id === modal.establishment!.id ? { ...e, filieres } : e) } : u));
      }
    } finally {
      setSaving(false);
      closeModal();
    }
  }

  async function handleDelete(type: 'university' | 'establishment' | 'filiere', id: string, context?: { universityId?: string; establishmentId?: string }) {
    if (!confirm(t.deleteConfirm)) return;
    if (type === 'university') {
      await fetch(`/api/admin/formations/universities/${id}`, { method: 'DELETE' });
      await fetchUniversities();
    } else if (type === 'establishment' && context?.universityId) {
      await fetch(`/api/admin/formations/establishments/${id}`, { method: 'DELETE' });
      const etabs = await fetchEstablishments(context.universityId);
      setUniversities(prev => prev.map(u => u.id === context.universityId ? { ...u, establishments: etabs } : u));
    } else if (type === 'filiere' && context?.universityId && context?.establishmentId) {
      await fetch(`/api/admin/formations/filieres/${id}`, { method: 'DELETE' });
      const filieres = await fetchFilieres(context.establishmentId);
      setUniversities(prev => prev.map(u => u.id === context.universityId ? { ...u, establishments: u.establishments?.map(e => e.id === context.establishmentId ? { ...e, filieres } : e) } : u));
    }
  }

  async function toggleActive(type: 'university' | 'establishment' | 'filiere', id: string, active: boolean, context?: { universityId?: string; establishmentId?: string }) {
    const url = `/api/admin/formations/${type === 'university' ? 'universities' : type === 'establishment' ? 'establishments' : 'filieres'}/${id}`;
    await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !active }) });
    if (type === 'university') await fetchUniversities();
    else if (type === 'establishment' && context?.universityId) {
      const etabs = await fetchEstablishments(context.universityId);
      setUniversities(prev => prev.map(u => u.id === context.universityId ? { ...u, establishments: etabs } : u));
    } else if (type === 'filiere' && context?.universityId && context?.establishmentId) {
      const filieres = await fetchFilieres(context.establishmentId);
      setUniversities(prev => prev.map(u => u.id === context.universityId ? { ...u, establishments: u.establishments?.map(e => e.id === context.establishmentId ? { ...e, filieres } : e) } : u));
    }
  }

  // ─── Excel import ────────────────────────────────────────────────────────────

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportMsg('');
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/formations/import', { method: 'POST', body: fd });
    const data = await res.json();
    if (res.ok) {
      setImportMsg(isFr
        ? `Importé : ${data.universities} universités, ${data.establishments} établissements, ${data.filieres} filières`
        : `Imported: ${data.universities} universities, ${data.establishments} establishments, ${data.filieres} programs`
      );
      await fetchUniversities();
      setExpandedUnis(new Set());
      setExpandedEtabs(new Set());
    } else {
      setImportMsg(data.error ?? (isFr ? 'Erreur d\'importation' : 'Import error'));
    }
    setImporting(false);
    e.target.value = '';
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  const modalTitles: Record<string, string> = {
    'add-university': t.addUniversity,
    'edit-university': t.editUniversity,
    'add-establishment': t.addEstablishment,
    'edit-establishment': t.editEstablishment,
    'add-filiere': t.addFiliere,
    'edit-filiere': t.editFiliere,
  };
  const modalTitle = modal.mode ? (modalTitles[modal.mode] ?? '') : '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-500 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleImport}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {importing ? (isFr ? 'Importation...' : 'Importing...') : t.importExcel}
          </button>
          <button
            onClick={() => openModal({ mode: 'add-university' })}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
            style={{ backgroundColor: '#233691' }}
          >
            <Plus className="h-4 w-4" />
            {t.addUniversity}
          </button>
        </div>
      </div>

      {importMsg && (
        <div className={`px-4 py-3 rounded-lg text-sm ${importMsg.includes('rreu') || importMsg.includes('error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {importMsg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: isFr ? 'Universités' : 'Universities', value: universities.length, icon: GraduationCap },
          { label: isFr ? 'Établissements' : 'Establishments', value: universities.reduce((s, u) => s + (u._count?.establishments ?? 0), 0), icon: Building2 },
          { label: isFr ? 'Filières' : 'Programs', value: '702+', icon: BookOpen },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(35,54,145,0.1)' }}>
              <Icon className="h-5 w-5" style={{ color: '#233691' }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tree */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : universities.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>{isFr ? 'Aucune université. Importez un fichier Excel ou ajoutez une université.' : 'No universities yet. Import Excel or add one.'}</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {universities.map(uni => (
              <li key={uni.id}>
                {/* University row */}
                <div className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 group">
                  <button onClick={() => toggleUniversity(uni)} className="p-1 rounded hover:bg-gray-200 transition-colors">
                    {expandedUnis.has(uni.id)
                      ? <ChevronDown className="h-4 w-4 text-gray-500" />
                      : <ChevronRight className="h-4 w-4 text-gray-500" />}
                  </button>
                  <GraduationCap className="h-5 w-5 flex-shrink-0" style={{ color: '#233691' }} />
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-gray-900">{uni.nameFr}</span>
                    {uni.nameAr && <span className="ml-2 text-sm text-gray-400 font-normal" dir="rtl">{uni.nameAr}</span>}
                    <span className="ml-2 text-xs text-gray-400">({uni._count?.establishments ?? 0} {t.establishments})</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleActive('university', uni.id, uni.active)}
                      className={`px-2 py-0.5 rounded text-xs font-medium ${uni.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {uni.active ? (isFr ? 'Actif' : 'Active') : (isFr ? 'Inactif' : 'Inactive')}
                    </button>
                    <button onClick={() => openModal({ mode: 'add-establishment', university: uni })} title={t.addEstablishment} className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition-colors">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => openModal({ mode: 'edit-university', university: uni })} className="p-1.5 rounded hover:bg-amber-50 text-amber-600 transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete('university', uni.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Establishments */}
                {expandedUnis.has(uni.id) && (
                  <ul className="bg-gray-50/50">
                    {(uni.establishments ?? []).map(etab => (
                      <li key={etab.id}>
                        <div className="flex items-center gap-2 pl-10 pr-4 py-2.5 hover:bg-gray-100/70 group border-t border-gray-100">
                          <button onClick={() => toggleEstablishment(uni.id, etab)} className="p-1 rounded hover:bg-gray-200 transition-colors">
                            {expandedEtabs.has(etab.id)
                              ? <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                              : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
                          </button>
                          <Building2 className="h-4 w-4 flex-shrink-0 text-amber-500" />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-gray-800">{etab.nameFr}</span>
                            {etab.nameAr && <span className="ml-2 text-xs text-gray-400" dir="rtl">{etab.nameAr}</span>}
                            <span className="ml-2 text-xs text-gray-400">({etab._count?.filieres ?? etab.filieres?.length ?? 0} {t.filieres})</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => toggleActive('establishment', etab.id, etab.active, { universityId: uni.id })}
                              className={`px-2 py-0.5 rounded text-xs font-medium ${etab.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                            >
                              {etab.active ? (isFr ? 'Actif' : 'Active') : (isFr ? 'Inactif' : 'Inactive')}
                            </button>
                            <button onClick={() => openModal({ mode: 'add-filiere', university: uni, establishment: etab })} title={t.addFiliere} className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition-colors">
                              <Plus className="h-3 w-3" />
                            </button>
                            <button onClick={() => openModal({ mode: 'edit-establishment', university: uni, establishment: etab })} className="p-1.5 rounded hover:bg-amber-50 text-amber-600 transition-colors">
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button onClick={() => handleDelete('establishment', etab.id, { universityId: uni.id })} className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* Filières */}
                        {expandedEtabs.has(etab.id) && (
                          <ul className="pl-20 pr-4 py-2 border-t border-gray-100 bg-white/70 space-y-1">
                            {(etab.filieres ?? []).map(fil => (
                              <li key={fil.id} className="flex items-center gap-2 py-1 group/fil">
                                <BookOpen className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                                <span className="text-sm text-gray-700 flex-1">{fil.nameFr}</span>
                                <div className="flex items-center gap-1 opacity-0 group-hover/fil:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => toggleActive('filiere', fil.id, fil.active, { universityId: uni.id, establishmentId: etab.id })}
                                    className={`px-1.5 py-0.5 rounded text-xs font-medium ${fil.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                                  >
                                    {fil.active ? (isFr ? 'Actif' : 'Active') : (isFr ? 'Inactif' : 'Inactive')}
                                  </button>
                                  <button onClick={() => openModal({ mode: 'edit-filiere', university: uni, establishment: etab, filiere: fil })} className="p-1 rounded hover:bg-amber-50 text-amber-500 transition-colors">
                                    <Pencil className="h-3 w-3" />
                                  </button>
                                  <button onClick={() => handleDelete('filiere', fil.id, { universityId: uni.id, establishmentId: etab.id })} className="p-1 rounded hover:bg-red-50 text-red-400 transition-colors">
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </li>
                            ))}
                            <li>
                              <button
                                onClick={() => openModal({ mode: 'add-filiere', university: uni, establishment: etab })}
                                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 py-1"
                              >
                                <Plus className="h-3 w-3" />
                                {t.addFiliere}
                              </button>
                            </li>
                          </ul>
                        )}
                      </li>
                    ))}
                    <li className="pl-10 pr-4 py-2 border-t border-gray-100">
                      <button
                        onClick={() => openModal({ mode: 'add-establishment', university: uni })}
                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800"
                      >
                        <Plus className="h-3 w-3" />
                        {t.addEstablishment}
                      </button>
                    </li>
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal */}
      {modal.mode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{modalTitle}</h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.nameFr} *</label>
                <input
                  type="text"
                  value={formFr}
                  onChange={e => setFormFr(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#233691' } as React.CSSProperties}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.nameAr}</label>
                <input
                  type="text"
                  value={formAr}
                  onChange={e => setFormAr(e.target.value)}
                  dir="rtl"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  placeholder="اختياري"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 pt-0">
              <button onClick={closeModal} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                {t.cancel}
              </button>
              <button
                onClick={handleSave}
                disabled={!formFr.trim() || saving}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#233691' }}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
