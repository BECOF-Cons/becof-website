'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Trash2, Shield, ShieldCheck, Clock, Mail, Loader2 } from 'lucide-react';

interface Admin {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
  expiresAt: Date;
}

interface AdminManagementClientProps {
  initialAdmins: Admin[];
  initialInvitations: Invitation[];
  currentUserId: string;
}

export default function AdminManagementClient({ 
  initialAdmins, 
  initialInvitations,
  currentUserId 
}: AdminManagementClientProps) {
  const router = useRouter();
  const [admins, setAdmins] = useState(initialAdmins);
  const [invitations, setInvitations] = useState(initialInvitations);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'SUPER_ADMIN'>('ADMIN');
  const [loading, setLoading] = useState(false);

  const handleInviteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to invite admin');
      }

      alert('Invitation sent successfully!');
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('ADMIN');
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to invite admin');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove ${userName || 'this admin'}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove admin');
      }

      alert('Admin removed successfully');
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to remove admin');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Team</h3>
            <p className="text-sm text-gray-600">
              Manage admin users and send invitations to new team members
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-700 to-amber-500 text-white rounded-lg hover:from-blue-800 hover:to-amber-600 transition-all shadow-md"
          >
            <UserPlus className="h-5 w-5" />
            Invite Admin
          </button>
        </div>
      </div>

      {/* Active Admins */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-blue-700" />
          Active Admins ({admins.length})
        </h4>
        <div className="space-y-3">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${admin.role === 'SUPER_ADMIN' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                  {admin.role === 'SUPER_ADMIN' ? (
                    <ShieldCheck className="h-6 w-6 text-amber-600" />
                  ) : (
                    <Shield className="h-6 w-6 text-blue-700" />
                  )}
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">
                    {admin.name || 'No name'}
                    {admin.id === currentUserId && (
                      <span className="ml-2 text-xs text-blue-700">(You)</span>
                    )}
                  </h5>
                  <p className="text-sm text-gray-600">{admin.email}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        admin.role === 'SUPER_ADMIN'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {admin.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Joined {formatDate(admin.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              {admin.id !== currentUserId && (
                <button
                  onClick={() => handleRemoveAdmin(admin.id, admin.name || admin.email)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove admin"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            Pending Invitations ({invitations.length})
          </h4>
          <div className="space-y-3">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-4 border border-amber-200 bg-amber-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-amber-100">
                    <Mail className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">{invitation.email}</h5>
                    <div className="flex items-center gap-3 mt-1">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          invitation.role === 'SUPER_ADMIN'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {invitation.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                      </span>
                      <span className="text-xs text-gray-600">
                        Invited {formatDate(invitation.createdAt)}
                      </span>
                      <span className="text-xs text-amber-700">
                        Expires {formatDate(invitation.expiresAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Invite New Admin</h3>
            <form onSubmit={handleInviteAdmin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'ADMIN' | 'SUPER_ADMIN')}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {inviteRole === 'SUPER_ADMIN'
                    ? 'Super Admins can manage other admins and have full access'
                    : 'Admins can manage content, appointments, and payments'}
                </p>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-700 to-amber-500 text-white rounded-lg hover:from-blue-800 hover:to-amber-600 transition-all disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
