'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

interface TogglePublishButtonProps {
  postId: string;
  currentStatus: boolean;
  locale: string;
}

export default function TogglePublishButton({ postId, currentStatus, locale }: TogglePublishButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (loading) return;
    
    const confirmMessage = currentStatus
      ? locale === 'fr' 
        ? 'Voulez-vous masquer cet article ?' 
        : 'Do you want to hide this post?'
      : locale === 'fr'
        ? 'Voulez-vous publier cet article ?'
        : 'Do you want to publish this post?';

    if (!confirm(confirmMessage)) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/blog/${postId}/toggle-publish`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle publish status');
      }

      router.refresh();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert(locale === 'fr' ? 'Erreur lors de la modification' : 'Error updating status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`p-2 rounded transition-colors ${
        currentStatus
          ? 'text-green-600 hover:bg-green-50'
          : 'text-gray-400 hover:bg-gray-50'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={currentStatus 
        ? (locale === 'fr' ? 'Masquer l\'article' : 'Hide post')
        : (locale === 'fr' ? 'Publier l\'article' : 'Publish post')
      }
    >
      {currentStatus ? <Eye size={18} /> : <EyeOff size={18} />}
    </button>
  );
}
