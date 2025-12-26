'use client';

import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

interface DeleteBlogButtonProps {
  postId: string;
  postTitle: string;
  locale: string;
}

export default function DeleteBlogButton({ postId, postTitle, locale }: DeleteBlogButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${postTitle}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/blog/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      router.refresh();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Delete post"
    >
      <Trash2 size={18} />
    </button>
  );
}
