'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  nameFr: string;
  nameEn: string;
}

export default function BlogPostEditor() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    titleFr: '',
    titleEn: '',
    slugEn: '',
    slugFr: '',
    excerptFr: '',
    excerptEn: '',
    contentFr: '',
    contentEn: '',
    categoryId: '',
    published: false,
    coverImage: '',
    metaKeywords: '',
  });

  useEffect(() => {
    // Fetch categories
    fetch('/api/admin/blog/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (field: 'titleFr' | 'titleEn', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      [field === 'titleFr' ? 'slugFr' : 'slugEn']: generateSlug(value),
    }));
  };

  const handleSubmit = async (published: boolean) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          published,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create post');
      }

      const post = await response.json();
      router.push('/admin/blog');
      router.refresh();
    } catch (error) {
      console.error('Error creating post:', error);
      alert(error instanceof Error ? error.message : 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/blog"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">New Blog Post</h1>
            <p className="text-gray-600 mt-1">Create a new blog article</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            <Eye size={18} />
            {loading ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title (French) *
            </label>
            <input
              type="text"
              value={formData.titleFr}
              onChange={(e) => handleTitleChange('titleFr', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Titre en français"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title (English) *
            </label>
            <input
              type="text"
              value={formData.titleEn}
              onChange={(e) => handleTitleChange('titleEn', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Title in English"
              required
            />
          </div>
        </div>

        {/* Slugs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Slug (French) *
            </label>
            <input
              type="text"
              value={formData.slugFr}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, slugFr: e.target.value }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono text-sm"
              placeholder="url-slug-fr"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              URL: /fr/blog/{formData.slugFr || 'url-slug-fr'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Slug (English) *
            </label>
            <input
              type="text"
              value={formData.slugEn}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, slugEn: e.target.value }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono text-sm"
              placeholder="url-slug-en"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              URL: /en/blog/{formData.slugEn || 'url-slug-en'}
            </p>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={formData.categoryId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, categoryId: e.target.value }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nameFr} / {cat.nameEn}
              </option>
            ))}
          </select>
        </div>

        {/* Excerpts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt (French) *
            </label>
            <textarea
              value={formData.excerptFr}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, excerptFr: e.target.value }))
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Court résumé en français"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt (English) *
            </label>
            <textarea
              value={formData.excerptEn}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, excerptEn: e.target.value }))
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Short summary in English"
              required
            />
          </div>
        </div>

        {/* Content - French */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content (French) *
          </label>
          <RichTextEditor
            content={formData.contentFr}
            onChange={(content) =>
              setFormData((prev) => ({ ...prev, contentFr: content }))
            }
            placeholder="Écrivez votre contenu en français..."
          />
        </div>

        {/* Content - English */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content (English) *
          </label>
          <RichTextEditor
            content={formData.contentEn}
            onChange={(content) =>
              setFormData((prev) => ({ ...prev, contentEn: content }))
            }
            placeholder="Write your content in English..."
          />
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cover Image
          </label>
          <div className="space-y-2">
            <input
              type="url"
              value={formData.coverImage}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, coverImage: e.target.value }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
            {formData.coverImage && (
              <img
                src={formData.coverImage}
                alt="Preview"
                className="mt-2 max-w-xs rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>
        </div>

        {/* Tags & Keywords */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, tags: e.target.value }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="orientation, études, career"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Keywords (comma separated)
            </label>
            <input
              type="text"
              value={formData.metaKeywords}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, metaKeywords: e.target.value }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="SEO keywords"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
