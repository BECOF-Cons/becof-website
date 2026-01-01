'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Info } from 'lucide-react';

interface TeamMemberFormProps {
  initialData?: {
    id: string;
    nameFr: string;
    nameEn: string;
    titleFr: string;
    titleEn: string;
    bioFr: string | null;
    bioEn: string | null;
    image: string;
    displayOrder: number;
    active: boolean;
  };
  locale: string;
}

export default function TeamMemberForm({ initialData, locale }: TeamMemberFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nameFr: initialData?.nameFr || '',
    nameEn: initialData?.nameEn || '',
    titleFr: initialData?.titleFr || '',
    titleEn: initialData?.titleEn || '',
    bioFr: initialData?.bioFr || '',
    bioEn: initialData?.bioEn || '',
    image: initialData?.image || '',
    displayOrder: initialData?.displayOrder || 0,
    active: initialData?.active ?? true,
  });

  // Convert Google Drive share links to direct image URLs
  const convertGoogleDriveUrl = (url: string): string => {
    if (!url) return url;
    
    // Handle different Google Drive URL formats
    const patterns = [
      /drive\.google\.com\/file\/d\/([^/]+)/,
      /drive\.google\.com\/open\?id=([^&]+)/,
      /drive\.google\.com\/uc\?id=([^&]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        // Use thumbnail format for better compatibility
        return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
      }
    }
    
    return url; // Return original if not a Google Drive URL
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const errors: string[] = [];
    
    if (!formData.nameFr || formData.nameFr.trim() === '') {
      errors.push(locale === 'fr' ? 'Le nom en français est requis' : 'French name is required');
    }
    if (!formData.nameEn || formData.nameEn.trim() === '') {
      errors.push(locale === 'fr' ? 'Le nom en anglais est requis' : 'English name is required');
    }
    if (!formData.titleFr || formData.titleFr.trim() === '') {
      errors.push(locale === 'fr' ? 'Le titre en français est requis' : 'French title is required');
    }
    if (!formData.titleEn || formData.titleEn.trim() === '') {
      errors.push(locale === 'fr' ? 'Le titre en anglais est requis' : 'English title is required');
    }
    if (!formData.image || formData.image.trim() === '') {
      errors.push(locale === 'fr' ? 'L\'URL de l\'image est requise' : 'Image URL is required');
    }
    
    if (errors.length > 0) {
      alert('⚠️ ' + (locale === 'fr' ? 'Erreurs de validation' : 'Validation Errors') + ':\n\n' + errors.join('\n'));
      return;
    }

    // Convert Google Drive URL if needed
    const processedImage = convertGoogleDriveUrl(formData.image);

    setLoading(true);

    try {
      const endpoint = initialData
        ? `/api/admin/team/${initialData.id}`
        : '/api/admin/team';
      
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save team member');
      }

      router.push(`/${locale}/admin/team`);
      router.refresh();
    } catch (error) {
      console.error('Error saving team member:', error);
      alert(error instanceof Error ? error.message : 'Failed to save team member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
      {/* Image Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-2">
              {locale === 'fr' ? '📸 Bonnes pratiques pour les images' : '📸 Image Best Practices'}
            </p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>
                <strong>{locale === 'fr' ? 'Format' : 'Format'}:</strong> {locale === 'fr' ? 'Carré (1:1) - 400x400px minimum' : 'Square (1:1) - 400x400px minimum'}
              </li>
              <li>
                <strong>{locale === 'fr' ? 'Taille' : 'Size'}:</strong> {locale === 'fr' ? 'Moins de 500KB pour de meilleures performances' : 'Under 500KB for better performance'}
              </li>
              <li>
                <strong>{locale === 'fr' ? 'Type' : 'Type'}:</strong> JPG, PNG, WebP ({locale === 'fr' ? 'WebP recommandé pour la compression' : 'WebP recommended for compression'})
              </li>
              <li>
                <strong>{locale === 'fr' ? 'Résolution' : 'Resolution'}:</strong> 400-800px {locale === 'fr' ? '(optimale pour web)' : '(optimal for web)'}
              </li>
              <li>
                <strong>{locale === 'fr' ? 'Qualité' : 'Quality'}:</strong> {locale === 'fr' ? 'Photo professionnelle avec fond neutre' : 'Professional photo with neutral background'}
              </li>
            </ul>
            <p className="mt-2 text-xs text-blue-700">
              💡 {locale === 'fr' 
                ? 'Utilisez des outils comme TinyPNG ou Squoosh pour compresser vos images'
                : 'Use tools like TinyPNG or Squoosh to compress your images'}
            </p>
          </div>
        </div>
      </div>

      {/* Image URL Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {locale === 'fr' ? 'URL de la Photo *' : 'Photo URL *'}
        </label>
        <input
          type="url"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://example.com/image.jpg"
        />
        <div className="mt-2 text-xs text-gray-600 space-y-1">
          <p>✅ {locale === 'fr' ? 'Formats supportés:' : 'Supported formats:'}</p>
          <ul className="list-disc list-inside ml-2 space-y-0.5">
            <li>{locale === 'fr' ? 'URLs directes (Imgur, Cloudinary, etc.)' : 'Direct URLs (Imgur, Cloudinary, etc.)'}</li>
            <li>{locale === 'fr' ? 'Liens Google Drive partagés (public)' : 'Google Drive share links (public)'}</li>
            <li>{locale === 'fr' ? 'Tout hébergeur d\'images public' : 'Any public image host'}</li>
          </ul>
          <p className="mt-2 italic text-orange-600">
            ⚠️ {locale === 'fr' 
              ? 'Google Drive: L\'image DOIT être partagée publiquement ("Tous ceux qui disposent du lien" peuvent voir)'
              : 'Google Drive: Image MUST be shared publicly ("Anyone with the link" can view)'}
          </p>
          <p className="mt-1 text-xs italic">
            💡 {locale === 'fr' 
              ? 'Recommandé: Imgur.com (gratuit, sans compte requis) pour de meilleures performances'
              : 'Recommended: Imgur.com (free, no account needed) for best performance'}
          </p>
        </div>
        {formData.image && (
          <div className="mt-4 flex justify-center">
            <img
              src={convertGoogleDriveUrl(formData.image)}
              alt="Preview"
              className="w-32 h-32 rounded-full object-cover border-4 shadow-lg"
              style={{ borderColor: '#233691' }}
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      {/* French Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {locale === 'fr' ? 'Nom (Français) *' : 'Name (French) *'}
        </label>
        <input
          type="text"
          value={formData.nameFr}
          onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={locale === 'fr' ? 'Ex: Dr. Ahmed Ben Salem' : 'E.g.: Dr. Ahmed Ben Salem'}
        />
      </div>

      {/* English Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {locale === 'fr' ? 'Nom (Anglais) *' : 'Name (English) *'}
        </label>
        <input
          type="text"
          value={formData.nameEn}
          onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={locale === 'fr' ? 'Ex: Dr. Ahmed Ben Salem' : 'E.g.: Dr. Ahmed Ben Salem'}
        />
      </div>

      {/* French Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {locale === 'fr' ? 'Titre / Poste (Français) *' : 'Title / Position (French) *'}
        </label>
        <input
          type="text"
          value={formData.titleFr}
          onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={locale === 'fr' ? 'Ex: Directeur & Coach Professionnel' : 'E.g.: Director & Professional Coach'}
        />
      </div>

      {/* English Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {locale === 'fr' ? 'Titre / Poste (Anglais) *' : 'Title / Position (English) *'}
        </label>
        <input
          type="text"
          value={formData.titleEn}
          onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={locale === 'fr' ? 'Ex: Director & Professional Coach' : 'E.g.: Director & Professional Coach'}
        />
      </div>

      {/* French Bio (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {locale === 'fr' ? 'Biographie (Français) - Optionnel' : 'Biography (French) - Optional'}
        </label>
        <textarea
          value={formData.bioFr || ''}
          onChange={(e) => setFormData({ ...formData, bioFr: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={locale === 'fr' ? 'Courte biographie...' : 'Short biography...'}
        />
      </div>

      {/* English Bio (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {locale === 'fr' ? 'Biographie (Anglais) - Optionnel' : 'Biography (English) - Optional'}
        </label>
        <textarea
          value={formData.bioEn || ''}
          onChange={(e) => setFormData({ ...formData, bioEn: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={locale === 'fr' ? 'Short biography...' : 'Short biography...'}
        />
      </div>

      {/* Display Order */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {locale === 'fr' ? 'Ordre d\'affichage' : 'Display Order'}
        </label>
        <input
          type="number"
          value={formData.displayOrder}
          onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0"
        />
        <p className="text-xs text-gray-500 mt-1">
          {locale === 'fr'
            ? 'Numéro plus petit = affiché en premier (0 pour le premier membre)'
            : 'Lower number = displayed first (0 for first member)'}
        </p>
      </div>

      {/* Active Status */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="active"
          checked={formData.active}
          onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="active" className="text-sm font-medium text-gray-700">
          {locale === 'fr' ? 'Afficher sur le site web' : 'Display on website'}
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50"
          style={{background: 'linear-gradient(135deg, #233691 0%, #1a2870 100%)'}}
        >
          {loading
            ? (locale === 'fr' ? 'Enregistrement...' : 'Saving...')
            : initialData
            ? (locale === 'fr' ? 'Mettre à jour' : 'Update')
            : (locale === 'fr' ? 'Créer' : 'Create')}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/admin/team`)}
          className="px-6 py-3 border-2 rounded-lg font-semibold transition-all"
          style={{borderColor: '#233691', color: '#233691'}}
        >
          {locale === 'fr' ? 'Annuler' : 'Cancel'}
        </button>
      </div>
    </form>
  );
}
