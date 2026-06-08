'use client';

import { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronRight, Trash2, Edit2, Upload } from 'lucide-react';
import Link from 'next/link';

interface University {
  id: string;
  nameFr: string;
  nameAr: string;
  displayOrder: number;
  active: boolean;
  establishmentCount: number;
}

interface Establishment {
  id: string;
  nameFr: string;
  nameAr: string;
  displayOrder: number;
  active: boolean;
  programCount: number;
  university: {
    id: string;
    nameFr: string;
    nameAr: string;
  };
}

interface Program {
  id: string;
  nameFr: string;
  codeId?: string;
  displayOrder: number;
  active: boolean;
  establishment: {
    id: string;
    nameFr: string;
    nameAr: string;
  };
}

export default function EducationHierarchy({ locale }: { locale: string }) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [expandedUniversities, setExpandedUniversities] = useState<Set<string>>(new Set());
  const [establishments, setEstablishments] = useState<Map<string, Establishment[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const res = await fetch('/api/admin/education/universities');
      if (res.ok) {
        const data = await res.json();
        setUniversities(data);
      }
    } catch (error) {
      console.error('Error fetching universities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEstablishments = async (universityId: string) => {
    try {
      const res = await fetch(`/api/admin/education/establishments?universityId=${universityId}`);
      if (res.ok) {
        const data = await res.json();
        setEstablishments((prev) => new Map(prev).set(universityId, data));
      }
    } catch (error) {
      console.error('Error fetching establishments:', error);
    }
  };

  const toggleUniversity = (universityId: string) => {
    const newExpanded = new Set(expandedUniversities);
    if (newExpanded.has(universityId)) {
      newExpanded.delete(universityId);
    } else {
      newExpanded.add(universityId);
      if (!establishments.has(universityId)) {
        fetchEstablishments(universityId);
      }
    }
    setExpandedUniversities(newExpanded);
  };

  const handleImport = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/education/import', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Import successful!\nUniversities: ${data.stats.universities.created} created, ${data.stats.universities.updated} updated\nEstablishments: ${data.stats.establishments.created} created, ${data.stats.establishments.updated} updated\nPrograms: ${data.stats.programs.created} created, ${data.stats.programs.updated} updated`);
        fetchUniversities();
        setShowImportModal(false);
      } else {
        const error = await res.json();
        alert(`Import failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Import failed');
    }
  };

  const deleteUniversity = async (id: string) => {
    if (confirm('Are you sure you want to delete this university?')) {
      try {
        const res = await fetch(`/api/admin/education/universities/${id}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          fetchUniversities();
        } else {
          const error = await res.json();
          alert(`Delete failed: ${error.error}`);
        }
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const deleteEstablishment = async (id: string) => {
    if (confirm('Are you sure you want to delete this establishment?')) {
      try {
        const res = await fetch(`/api/admin/education/establishments/${id}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          fetchUniversities();
          setEstablishments(new Map());
        } else {
          const error = await res.json();
          alert(`Delete failed: ${error.error}`);
        }
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Education Hierarchy</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Upload className="w-4 h-4" />
            Import Excel
          </button>
          <Link
            href={`/${locale}/admin/education/new`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            New University
          </Link>
        </div>
      </div>

      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Import Formations</h2>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleImport(e.target.files[0]);
                }
              }}
              className="block w-full mb-4 p-2 border rounded"
            />
            <button
              onClick={() => setShowImportModal(false)}
              className="w-full px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {universities.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No universities found. Click "New University" to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {universities.map((university) => (
            <div key={university.id} className="border rounded-lg">
              <div className="p-4 bg-gray-50 hover:bg-gray-100 flex items-center gap-3 cursor-pointer"
                onClick={() => toggleUniversity(university.id)}>
                {expandedUniversities.has(university.id) ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
                <div className="flex-1">
                  <p className="font-semibold">{university.nameFr}</p>
                  <p className="text-sm text-gray-600">{university.nameAr}</p>
                </div>
                <span className="text-sm text-gray-500">{university.establishmentCount} establishments</span>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Link
                    href={`/${locale}/admin/education/universities/${university.id}`}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => deleteUniversity(university.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {expandedUniversities.has(university.id) && establishments.has(university.id) && (
                <div className="pl-8 py-2 space-y-2 bg-white border-t">
                  {establishments.get(university.id)?.map((establishment) => (
                    <div
                      key={establishment.id}
                      className="p-3 bg-gray-50 rounded flex items-center gap-3"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{establishment.nameFr}</p>
                        <p className="text-sm text-gray-600">{establishment.nameAr}</p>
                      </div>
                      <span className="text-sm text-gray-500">{establishment.programCount} programs</span>
                      <div className="flex gap-2">
                        <Link
                          href={`/${locale}/admin/education/establishments/${establishment.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deleteEstablishment(establishment.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <Link
                    href={`/${locale}/admin/education/establishments/new?universityId=${university.id}`}
                    className="inline-flex items-center gap-2 px-3 py-2 ml-3 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Plus className="w-4 h-4" />
                    Add Establishment
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
