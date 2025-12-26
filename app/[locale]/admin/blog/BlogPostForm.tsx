'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X } from 'lucide-react';

interface BlogPostFormProps {
  categories: Array<{
    id: string;
    nameEn: string;
    nameFr: string;
  }>;
  initialData?: {
    id: string;
    titleEn: string;
    titleFr: string;
    contentEn: string;
    contentFr: string;
    excerptEn: string;
    excerptFr: string;
    slugEn: string;
    slugFr: string;
    coverImage: string | null;
    categoryId: string | null;
    published: boolean;
  };
}

export default function BlogPostForm({ categories, initialData }: BlogPostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titleEn: initialData?.titleEn || '',
    titleFr: initialData?.titleFr || '',
    contentEn: initialData?.contentEn || '',
    contentFr: initialData?.contentFr || '',
    excerptEn: initialData?.excerptEn || '',
    excerptFr: initialData?.excerptFr || '',
    slugEn: initialData?.slugEn || '',
    slugFr: initialData?.slugFr || '',
    coverImage: initialData?.coverImage || '',
    categoryId: initialData?.categoryId || '',
    published: initialData?.published || false,
  });

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (lang: 'en' | 'fr', value: string) => {
    const slugKey = lang === 'en' ? 'slugEn' : 'slugFr';
    setFormData({
      ...formData,
      [`title${lang === 'en' ? 'En' : 'Fr'}`]: value,
      [slugKey]: generateSlug(value),
    });
  };

  const handleSubmit = async (e: React.FormEvent, asDraft = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = initialData
        ? `/api/admin/blog/${initialData.id}`
        : '/api/admin/blog';
      
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          published: asDraft ? false : formData.published,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save blog post');
      }

      router.push('/admin/blog');
      router.refresh();
    } catch (error) {
      console.error('Error saving blog post:', error);
      alert(error instanceof Error ? error.message : 'Failed to save blog post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="bg-white rounded-lg shadow-md p-6 space-y-6">
      {/* English Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          English Title *
        </label>
        <input
          type="text"
          required
          value={formData.titleEn}
          onChange={(e) => handleTitleChange('en', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder="Enter English title"
        />
        <p className="text-xs text-gray-500 mt-1">Slug: {formData.slugEn || 'auto-generated'}</p>
      </div>

      {/* French Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          French Title * (Titre en français)
        </label>
        <input
          type="text"
          required
          value={formData.titleFr}
          onChange={(e) => handleTitleChange('fr', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder="Entrez le titre en français"
        />
        <p className="text-xs text-gray-500 mt-1">Slug: {formData.slugFr || 'auto-généré'}</p>
      </div>

      {/* English Excerpt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          English Excerpt *
        </label>
        <textarea
          required
          value={formData.excerptEn}
          onChange={(e) => setFormData({ ...formData, excerptEn: e.target.value })}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder="Brief summary in English"
        />
      </div>

      {/* French Excerpt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          French Excerpt * (Extrait en français)
        </label>
        <textarea
          required
          value={formData.excerptFr}
          onChange={(e) => setFormData({ ...formData, excerptFr: e.target.value })}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder="Bref résumé en français"
        />
      </div>

      {/* English Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          English Content *
        </label>
        <textarea
          required
          value={formData.contentEn}
          onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
          rows={12}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono text-sm"
          placeholder="Write your content in English (Markdown supported)"
        />
      </div>

      {/* French Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          French Content * (Contenu en français)
        </label>
        <textarea
          required
          value={formData.contentFr}
          onChange={(e) => setFormData({ ...formData, contentFr: e.target.value })}
          rows={12}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono text-sm"
          placeholder="Écrivez votre contenu en français (Markdown supporté)"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category (Catégorie)
        </label>
        <select
          value={formData.categoryId}
          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="">Select a category / Sélectionner une catégorie</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.nameEn} / {category.nameFr}
            </option>
          ))}
        </select>
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cover Image URL (Image de couverture)
        </label>
        <input
          type="url"
          value={formData.coverImage}
          onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder="https://example.com/image.jpg"
        />
        {formData.coverImage && (
          <img
            src={formData.coverImage}
            alt="Preview"
            className="mt-2 w-full h-48 object-cover rounded-lg"
          />
        )}
      </div>

      {/* Published Status */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="published"
          checked={formData.published}
          onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
          className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
        />
        <label htmlFor="published" className="text-sm font-medium text-gray-700">
          Publish immediately (Publier immédiatement)
        </label>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.push('/admin/blog')}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} />
          Cancel / Annuler
        </button>
        
        {!initialData && (
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <Save size={20} />
            Save as Draft / Enregistrer comme brouillon
          </button>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
        >
          <Save size={20} />
          {loading ? 'Saving...' : (initialData ? 'Update Post / Mettre à jour' : 'Create Post / Créer l\'article')}
        </button>
      </div>
    </form>
  );
}
