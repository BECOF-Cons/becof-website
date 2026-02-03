'use client';

import { useState, useRef } from 'react';
import { UploadButton } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';
import { ImageIcon, X, Upload, Link2 } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  locale?: string;
}

const SUPPORTED_FORMATS = ['JPG', 'JPEG', 'PNG', 'WebP', 'GIF'];
const MAX_FILE_SIZE_MB = 4;
const IMAGE_GUIDELINES = {
  en: {
    title: 'Image Guidelines',
    formats: 'Supported formats',
    size: 'Maximum size',
    dimensions: 'Recommended dimensions',
    uploadMethod: 'Upload Method',
    local: 'Upload from Computer',
    url: 'Use Image URL',
    urlPlaceholder: 'https://example.com/image.jpg',
    urlLabel: 'Image URL',
    dragDrop: 'Drag and drop your image here or click to browse',
    uploading: 'Uploading...',
    selectFile: 'Select a file',
    uploadingFile: 'Uploading file...',
    uploadError: 'Upload error',
    invalidFile: 'Please select a valid image file',
    dimensionsValue: '1200x630px or larger (16:9 aspect ratio recommended)',
  },
  fr: {
    title: 'Directives pour les images',
    formats: 'Formats acceptés',
    size: 'Taille maximale',
    dimensions: 'Dimensions recommandées',
    uploadMethod: 'Méthode de téléchargement',
    local: 'Télécharger depuis l\'ordinateur',
    url: 'Utiliser l\'URL de l\'image',
    urlPlaceholder: 'https://exemple.com/image.jpg',
    urlLabel: 'URL de l\'image',
    dragDrop: 'Faites glisser votre image ici ou cliquez pour parcourir',
    uploading: 'Téléchargement...',
    selectFile: 'Sélectionner un fichier',
    uploadingFile: 'Téléchargement du fichier...',
    uploadError: 'Erreur de téléchargement',
    invalidFile: 'Veuillez sélectionner un fichier image valide',
    dimensionsValue: '1200x630px ou plus grand (ratio 16:9 recommandé)',
  },
};

export default function ImageUpload({ value, onChange, onRemove, locale = 'en' }: ImageUploadProps) {
  const [uploadMethod, setUploadMethod] = useState<'local' | 'url'>('local');
  const [urlValue, setUrlValue] = useState('');
  const [urlError, setUrlError] = useState('');
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = IMAGE_GUIDELINES[locale as keyof typeof IMAGE_GUIDELINES] || IMAGE_GUIDELINES.en;

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isValidImageFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    return validTypes.includes(file.type);
  };

  const handleFileSelect = async (file: File) => {
    if (!isValidImageFile(file)) {
      alert(`${t.invalidFile}`);
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(`${t.uploadError}: ${locale === 'fr' ? 'Fichier trop volumineux' : 'File is too large'}`);
      return;
    }

    setUploading(true);
    try {
      // Convert file to base64 data URL for local preview/storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onChange(result);
        setUploading(false);
      };
      reader.onerror = () => {
        alert(`${t.uploadError}: ${locale === 'fr' ? 'Impossible de lire le fichier' : 'Unable to read file'}`);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert(`${t.uploadError}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target?.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlValue.trim()) {
      setUrlError(locale === 'fr' ? 'Veuillez entrer une URL' : 'Please enter a URL');
      return;
    }

    if (!validateUrl(urlValue)) {
      setUrlError(locale === 'fr' ? 'URL invalide' : 'Invalid URL');
      return;
    }

    setIsValidatingUrl(true);
    try {
      // Validate that the URL points to an image
      const response = await fetch(urlValue, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.startsWith('image/')) {
        setUrlError(locale === 'fr' ? 'L\'URL ne pointe pas vers une image valide' : 'URL does not point to a valid image');
        setIsValidatingUrl(false);
        return;
      }

      onChange(urlValue);
      setUrlValue('');
      setUrlError('');
      setUploadMethod('local');
    } catch (error) {
      setUrlError(locale === 'fr' ? 'Impossible de valider l\'URL' : 'Unable to validate URL');
    } finally {
      setIsValidatingUrl(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Guidelines Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-3">{t.title}</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li><strong>{t.formats}:</strong> {SUPPORTED_FORMATS.join(', ')}</li>
          <li><strong>{t.size}:</strong> {MAX_FILE_SIZE_MB}MB</li>
          <li><strong>{t.dimensions}:</strong> {t.dimensionsValue}</li>
        </ul>
      </div>

      {/* Image Preview */}
      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Uploaded image"
            className="max-w-xs rounded-lg border border-gray-300 shadow-sm"
          />
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Upload Method Tabs */}
          <div className="flex gap-2 border-b border-gray-300">
            <button
              type="button"
              onClick={() => {
                setUploadMethod('local');
                setUrlError('');
                setUrlValue('');
              }}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
                uploadMethod === 'local'
                  ? 'text-[#F9AA04] border-b-2 border-[#F9AA04]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Upload size={18} />
              {t.local}
            </button>
            <button
              type="button"
              onClick={() => {
                setUploadMethod('url');
                setUrlError('');
              }}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
                uploadMethod === 'url'
                  ? 'text-[#F9AA04] border-b-2 border-[#F9AA04]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Link2 size={18} />
              {t.url}
            </button>
          </div>

          {/* Local File Upload */}
          {uploadMethod === 'local' && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  dragActive
                    ? 'border-[#F9AA04] bg-amber-50'
                    : 'border-gray-300 hover:border-[#F9AA04]'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {uploading ? t.uploadingFile : t.dragDrop}
                </p>
                <p className="text-xs text-gray-500">
                  {locale === 'fr' ? 'ou' : 'or'} <span className="text-[#F9AA04] font-medium">{t.selectFile}</span>
                </p>
              </div>
            </>
          )}

          {/* URL Input */}
          {uploadMethod === 'url' && (
            <div className="space-y-3 border border-gray-300 rounded-lg p-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.urlLabel}
                </label>
                <input
                  type="url"
                  value={urlValue}
                  onChange={(e) => {
                    setUrlValue(e.target.value);
                    setUrlError('');
                  }}
                  placeholder={t.urlPlaceholder}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9AA04] focus:border-transparent"
                />
                {urlError && (
                  <p className="mt-2 text-sm text-red-600">{urlError}</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleUrlSubmit}
                disabled={isValidatingUrl || !urlValue.trim()}
                className="w-full px-4 py-2 bg-[#F9AA04] text-gray-900 font-medium rounded-lg hover:bg-[#f5a81f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isValidatingUrl ? (locale === 'fr' ? 'Validation...' : 'Validating...') : (locale === 'fr' ? 'Utiliser cette image' : 'Use this Image')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
