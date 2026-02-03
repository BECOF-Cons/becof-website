'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Plus } from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';

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
  locale: string;
}

export default function BlogPostForm({ categories, initialData, locale }: BlogPostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryEn, setNewCategoryEn] = useState('');
  const [newCategoryFr, setNewCategoryFr] = useState('');
  const [showOtherLangContent, setShowOtherLangContent] = useState(false);
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
    if (!text || text.trim() === '') return '';
    
    // Simple transliteration map for common Arabic characters
    const arabicMap: Record<string, string> = {
      'ا': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j',
      'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh', 'ر': 'r',
      'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd',
      'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f',
      'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
      'ه': 'h', 'و': 'w', 'ي': 'y'
    };
    
    let slug = text.toLowerCase();
    
    // Replace Arabic characters with Latin equivalents
    for (const [arabic, latin] of Object.entries(arabicMap)) {
      slug = slug.replace(new RegExp(arabic, 'g'), latin);
    }
    
    // Normalize and clean up
    slug = slug
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, '') // Keep only alphanumeric, spaces, and hyphens
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Remove consecutive hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    
    return slug || 'untitled';
  };

  const handleTitleChange = (lang: 'en' | 'fr', value: string) => {
    const slugKey = lang === 'en' ? 'slugEn' : 'slugFr';
    const generatedSlug = generateSlug(value);
    
    setFormData({
      ...formData,
      [`title${lang === 'en' ? 'En' : 'Fr'}`]: value,
      [slugKey]: generatedSlug,
    });
  };

  const handleAddCategory = async () => {
    if (!newCategoryEn.trim() || !newCategoryFr.trim()) {
      alert('Please enter both English and French category names');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/blog/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nameEn: newCategoryEn,
          nameFr: newCategoryFr,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create category');
      }

      const newCategory = await response.json();
      
      // Add the new category to the form data
      setFormData({ ...formData, categoryId: newCategory.id });
      setNewCategoryEn('');
      setNewCategoryFr('');
      setShowAddCategory(false);
      
      // Refresh to get updated categories list
      router.refresh();
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, asDraft = false) => {
    e.preventDefault();
    
    // Validate required fields with proper error messages
    const errors: string[] = [];
    // Only require the primary locale's title and content. Excerpts are optional.
    const primaryLang = locale === 'fr' ? 'Fr' : 'En';
    const secondaryLang = primaryLang === 'Fr' ? 'En' : 'Fr';

    const primaryTitle = (formData as any)[`title${primaryLang}`];
    const primaryContent = (formData as any)[`content${primaryLang}`];

    if (!primaryTitle || primaryTitle.trim() === '') {
      errors.push(`${primaryLang === 'Fr' ? 'French' : 'English'} title is required`);
    }
    const isContentEmpty = (html: string) => {
      if (!html || html.trim() === '') return true;
      // Remove HTML tags and check if there's actual text content
      const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
      return text.length === 0;
    };
    
    if (isContentEmpty(primaryContent)) {
      errors.push(`${primaryLang === 'Fr' ? 'French' : 'English'} content is required`);
    }
    
    if (errors.length > 0) {
      alert('⚠️ Validation Errors / Erreurs de validation:\n\n' + errors.join('\n'));
      return;
    }
    
    // Ensure slugs are generated. If a language title is missing, fall back to the primary title.
    const updatedFormData = { ...formData } as any;
    const primarySlug = generateSlug(primaryTitle) || `untitled-${Date.now()}`;
    // Primary slug
    if (!updatedFormData[`slug${primaryLang}`] || updatedFormData[`slug${primaryLang}`].trim() === '') {
      updatedFormData[`slug${primaryLang}`] = primarySlug;
    }
    // Secondary slug: if user provided its title, generate from it; otherwise reuse primary slug
    const secondaryTitle = updatedFormData[`title${secondaryLang}`];
    if (!updatedFormData[`slug${secondaryLang}`] || updatedFormData[`slug${secondaryLang}`].trim() === '') {
      updatedFormData[`slug${secondaryLang}`] = secondaryTitle && secondaryTitle.trim() !== ''
        ? generateSlug(secondaryTitle)
        : primarySlug;
    }
    
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
          ...updatedFormData,
          published: asDraft ? false : updatedFormData.published,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Server validation error:', error);
        if (error.details) {
          const issues = error.details.map((d: any) => `${d.path.join('.')}: ${d.message}`).join('\n');
          throw new Error(`Validation error:\n${issues}`);
        }
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
      {/* Primary language fields (only required for primary locale) */}
      {(() => {
        const primary = locale === 'fr' ? 'Fr' : 'En';
        const isFrench = locale === 'fr';
        const primaryTitleLabel = isFrench ? 'Titre *' : 'English Title *';
        const primaryExcerptLabel = isFrench ? 'Résumé' : 'English Excerpt';
        const primaryContentLabel = isFrench ? 'Contenu *' : 'English Content *';
        const arabicLabel = isFrench ? 'Arabe supporté' : 'Arabic supported';
        const primaryPlaceholder = primary === 'Fr' ? 'Entrez le titre en français ou en arabe' : 'Enter title in English or Arabic';
        const primaryExcerptPlaceholder = primary === 'Fr' ? 'Bref résumé en français ou en arabe' : 'Brief summary in English or Arabic';
        const primaryContentPlaceholder = primary === 'Fr' ? 'Écrivez votre contenu en français...' : 'Write your content in English...';
        const autoGenText = isFrench ? 'généré automatiquement à partir du titre' : 'auto-generated from title';

        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {primaryTitleLabel} <span className="text-xs font-normal text-gray-500">({arabicLabel} / عربي مدعوم)</span>
              </label>
              <input
                type="text"
                required
                value={(formData as any)[`title${primary}`]}
                onChange={(e) => handleTitleChange(primary === 'En' ? 'en' : 'fr', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder={primaryPlaceholder}
                dir="auto"
              />
              <p className="text-xs text-gray-500 mt-1">URL Slug: {(formData as any)[`slug${primary}`] || autoGenText}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {primaryExcerptLabel} <span className="text-xs font-normal text-gray-500">({isFrench ? 'optionnel' : 'optional'})</span>
              </label>
              <textarea
                value={(formData as any)[`excerpt${primary}`]}
                onChange={(e) => setFormData({ ...formData, [("excerpt" + primary) as any]: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder={primaryExcerptPlaceholder}
                dir="auto"
              />
            </div>

            <div>
              <RichTextEditor
                label={primaryContentLabel}
                content={(formData as any)[`content${primary}`]}
                onChange={(content) => setFormData({ ...formData, [("content" + primary) as any]: content })}
                placeholder={primaryContentPlaceholder}
                supportArabic={true}
              />
            </div>
          </>
        );
      })()}

      {/* Toggle to add the other language (e.g., 'Add English content' when primary is French) */}
      <div className="flex items-center gap-2">
        <input
          id="toggleOtherLang"
          type="checkbox"
          checked={showOtherLangContent}
          onChange={(e) => setShowOtherLangContent(e.target.checked)}
          className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
        />
        <label htmlFor="toggleOtherLang" className="text-sm font-medium text-gray-700">
          {locale === 'fr' ? 'Ajouter également le contenu en anglais' : 'Also add French content'}
        </label>
      </div>

      {/* Secondary language fields (shown only when toggled) */}
      {showOtherLangContent && (
        <div className="space-y-4">
          {(() => {
            const secondary = locale === 'fr' ? 'En' : 'Fr';
            const isFrench = locale === 'fr';
            const secondaryTitleLabel = isFrench ? 'Titre en Anglais' : 'Titre en Français';
            const secondaryExcerptLabel = isFrench ? 'Résumé en Anglais' : 'Résumé en Français';
            const secondaryContentLabel = isFrench ? 'Contenu en Anglais' : 'Contenu en Français';
            const secondaryPlaceholder = secondary === 'Fr' ? 'Entrez le titre en français ou en arabe' : 'Enter title in English or Arabic';
            const secondaryExcerptPlaceholder = secondary === 'Fr' ? 'Bref résumé en français ou en arabe' : 'Brief summary in English or Arabic';
            const secondaryContentPlaceholder = secondary === 'Fr' ? 'Écrivez votre contenu en français...' : 'Write your content in English...';
            const autoGenText = isFrench ? 'généré automatiquement à partir du titre ou de la langue principale' : 'auto-generated from title or primary language';

            return (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {secondaryTitleLabel} <span className="text-xs font-normal text-gray-500">({isFrench ? 'optionnel' : 'optional'})</span>
                  </label>
                  <input
                    type="text"
                    value={(formData as any)[`title${secondary}`]}
                    onChange={(e) => handleTitleChange(secondary === 'En' ? 'en' : 'fr', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder={secondaryPlaceholder}
                    dir="auto"
                  />
                  <p className="text-xs text-gray-500 mt-1">URL Slug: {(formData as any)[`slug${secondary}`] || autoGenText}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {secondaryExcerptLabel} <span className="text-xs font-normal text-gray-500">({isFrench ? 'optionnel' : 'optional'})</span>
                  </label>
                  <textarea
                    value={(formData as any)[`excerpt${secondary}`]}
                    onChange={(e) => setFormData({ ...formData, [("excerpt" + secondary) as any]: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder={secondaryExcerptPlaceholder}
                    dir="auto"
                  />
                </div>

                <div>
                  <RichTextEditor
                    label={secondaryContentLabel}
                    content={(formData as any)[`content${secondary}`]}
                    onChange={(content) => setFormData({ ...formData, [("content" + secondary) as any]: content })}
                    placeholder={secondaryContentPlaceholder}
                    supportArabic={true}
                  />
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {locale === 'fr' ? 'Catégorie' : 'Category'}
        </label>
        <div className="flex gap-2">
          <select
            value={formData.categoryId}
            onChange={(e) => {
              if (e.target.value === '__ADD_NEW__') {
                setShowAddCategory(true);
              } else {
                setFormData({ ...formData, categoryId: e.target.value });
              }
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233691] focus:border-transparent"
          >
            <option value="">{locale === 'fr' ? 'Sélectionner une catégorie' : 'Select a category'}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nameEn} / {category.nameFr}
              </option>
            ))}
            <option value="__ADD_NEW__" className="font-semibold" style={{color: '#F9AA04'}}>
              {locale === 'fr' ? '+ Ajouter une nouvelle catégorie' : '+ Add New Category'}
            </option>
          </select>
        </div>
        
        {/* Add Category Form */}
        {showAddCategory && (
          <div className="mt-4 p-4 border-2 rounded-lg" style={{borderColor: '#F9AA04', backgroundColor: 'rgba(249, 170, 4, 0.05)'}}>
            <div className="flex items-center gap-2 mb-3">
              <Plus className="h-5 w-5" style={{color: '#F9AA04'}} />
              <h4 className="font-semibold text-gray-900">{locale === 'fr' ? 'Ajouter une nouvelle catégorie' : 'Add New Category'}</h4>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Category Name (English)
                </label>
                <input
                  type="text"
                  value={newCategoryEn}
                  onChange={(e) => setNewCategoryEn(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9AA04] focus:border-transparent"
                  placeholder="e.g., Career Advice"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Category Name (French)
                </label>
                <input
                  type="text"
                  value={newCategoryFr}
                  onChange={(e) => setNewCategoryFr(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9AA04] focus:border-transparent"
                  placeholder="e.g., Conseils de Carrière"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCategory(false);
                    setNewCategoryEn('');
                    setNewCategoryFr('');
                  }}
                  className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  disabled={loading}
                  className="px-3 py-1.5 text-sm text-white rounded-lg transition-colors disabled:opacity-50"
                  style={{background: '#F9AA04'}}
                >
                  {loading ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {locale === 'fr' ? 'Image de couverture' : 'Cover Image URL'}
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
          {locale === 'fr' ? 'Publier immédiatement' : 'Publish immediately'}
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
          {locale === 'fr' ? 'Annuler' : 'Cancel'}
        </button>
        
        {!initialData && (
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <Save size={20} />
            {locale === 'fr' ? 'Enregistrer comme brouillon' : 'Save as Draft'}
          </button>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
        >
          <Save size={20} />
          {loading ? (locale === 'fr' ? 'Enregistrement...' : 'Saving...') : (initialData ? (locale === 'fr' ? 'Mettre à jour' : 'Update Post') : (locale === 'fr' ? 'Créer l\'article' : 'Create Post'))}
        </button>
      </div>
    </form>
  );
}
