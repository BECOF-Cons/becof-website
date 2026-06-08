'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UniversityFormProps {
  locale: string;
  universitySeed?: {
    id?: string;
    nameFr: string;
    nameAr: string;
    displayOrder: number;
    active: boolean;
  };
  isEdit?: boolean;
}

export default function UniversityForm({ locale, universitySeed, isEdit = false }: UniversityFormProps) {
  const router = useRouter();
  const [nameFr, setNameFr] = useState(universitySeed?.nameFr || '');
  const [nameAr, setNameAr] = useState(universitySeed?.nameAr || '');
  const [displayOrder, setDisplayOrder] = useState(universitySeed?.displayOrder || 0);
  const [active, setActive] = useState(universitySeed?.active ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const method = isEdit && universitySeed?.id ? 'PUT' : 'POST';
      const url = isEdit && universitySeed?.id
        ? `/api/admin/education/universities/${universitySeed.id}`
        : '/api/admin/education/universities';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameFr,
          nameAr,
          displayOrder,
          active,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to save university');
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
          French Name *
        </label>
        <input
          type="text"
          required
          value={nameFr}
          onChange={(e) => setNameFr(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., UNIVERSITE DE TUNIS"
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
          placeholder="e.g., جامعة تونس"
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
          {loading ? 'Saving...' : isEdit ? 'Update University' : 'Create University'}
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
