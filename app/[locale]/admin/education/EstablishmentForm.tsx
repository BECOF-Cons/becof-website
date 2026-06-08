'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface EstablishmentFormProps {
  locale: string;
  establishmentSeed?: {
    id?: string;
    nameFr: string;
    nameAr: string;
    universityId: string;
    displayOrder: number;
    active: boolean;
  };
  isEdit?: boolean;
}

interface University {
  id: string;
  nameFr: string;
  nameAr: string;
}

export default function EstablishmentForm({ locale, establishmentSeed, isEdit = false }: EstablishmentFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [nameFr, setNameFr] = useState(establishmentSeed?.nameFr || '');
  const [nameAr, setNameAr] = useState(establishmentSeed?.nameAr || '');
  const [universityId, setUniversityId] = useState(establishmentSeed?.universityId || searchParams.get('universityId') || '');
  const [displayOrder, setDisplayOrder] = useState(establishmentSeed?.displayOrder || 0);
  const [active, setActive] = useState(establishmentSeed?.active ?? true);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const res = await fetch('/api/admin/education/universities?active=true');
        if (res.ok) {
          const data = await res.json();
          setUniversities(data);
        }
      } catch (err) {
        console.error('Error fetching universities:', err);
      }
    };

    fetchUniversities();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const method = isEdit && establishmentSeed?.id ? 'PUT' : 'POST';
      const url = isEdit && establishmentSeed?.id
        ? `/api/admin/education/establishments/${establishmentSeed.id}`
        : '/api/admin/education/establishments';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameFr,
          nameAr,
          universityId,
          displayOrder,
          active,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to save establishment');
        return;
      }

      router.push(`/${locale}/admin/education`);
    } catch (err) {
      setError('An error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          University *
        </label>
        <select
          required
          value={universityId}
          onChange={(e) => setUniversityId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select a university</option>
          {universities.map((uni) => (
            <option key={uni.id} value={uni.id}>
              {uni.nameFr} ({uni.nameAr})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          French Name *
        </label>
        <input
          type="text"
          required
          value={nameFr}
          onChange={(e) => setNameFr(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Institut Supérieur..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Arabic Name *
        </label>
        <input
          type="text"
          required
          value={nameAr}
          onChange={(e) => setNameAr(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          dir="rtl"
          placeholder="e.g., المعهد العالي..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Display Order
        </label>
        <input
          type="number"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(parseInt(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0"
        />
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm font-medium text-gray-700">Active</span>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Establishment' : 'Create Establishment'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
