'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface DeleteTeamMemberButtonProps {
  memberId: string;
  memberName: string;
  locale: string;
}

export default function DeleteTeamMemberButton({ memberId, memberName, locale }: DeleteTeamMemberButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      locale === 'fr'
        ? `Êtes-vous sûr de vouloir supprimer ${memberName} ?`
        : `Are you sure you want to delete ${memberName}?`
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/team/${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete team member');
      }

      router.refresh();
    } catch (error) {
      console.error('Error deleting team member:', error);
      alert(
        locale === 'fr'
          ? 'Erreur lors de la suppression du membre'
          : 'Error deleting team member'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
      title="Delete member"
    >
      <Trash2 size={18} />
    </button>
  );
}
