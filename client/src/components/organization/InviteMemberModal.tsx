import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/client';
import { X, Mail, UserPlus } from 'lucide-react';

interface InviteMemberModalProps {
  organizationId: string;
  onClose: () => void;
}

interface InvitationRequest {
  email: string;
  role: 'admin' | 'member' | 'viewer';
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ organizationId, onClose }) => {
  const queryClient = useQueryClient();
  const [invitations, setInvitations] = useState<InvitationRequest[]>([
    { email: '', role: 'member' }
  ]);

  const inviteMutation = useMutation({
    mutationFn: (data: { invitations: InvitationRequest[] }) =>
      apiClient.post(`/organizations/${organizationId}/invitations`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', organizationId, 'members'] });
      onClose();
    },
  });

  const addInvitation = () => {
    setInvitations([...invitations, { email: '', role: 'member' }]);
  };

  const removeInvitation = (index: number) => {
    if (invitations.length > 1) {
      setInvitations(invitations.filter((_, i) => i !== index));
    }
  };

  const updateInvitation = (index: number, field: keyof InvitationRequest, value: string) => {
    setInvitations(invitations.map((inv, i) => 
      i === index ? { ...inv, [field]: value } : inv
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validInvitations = invitations.filter(inv => inv.email.trim());
    if (validInvitations.length > 0) {
      inviteMutation.mutate({ invitations: validInvitations });
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const canSubmit = invitations.some(inv => inv.email.trim() && isValidEmail(inv.email));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Invite Team Members</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4 mb-6">
            {invitations.map((invitation, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={invitation.email}
                    onChange={(e) => updateInvitation(index, 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="colleague@company.com"
                    required
                  />
                  {invitation.email && !isValidEmail(invitation.email) && (
                    <p className="text-xs text-red-600 mt-1">Please enter a valid email</p>
                  )}
                </div>

                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={invitation.role}
                    onChange={(e) => updateInvitation(index, 'role', e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => removeInvitation(index)}
                  disabled={invitations.length === 1}
                  className="mt-8 p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addInvitation}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors text-sm font-medium mb-6"
          >
            <UserPlus className="w-4 h-4" />
            Add Another Invitation
          </button>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Role Permissions</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Viewer:</strong> Can view projects and feedback but cannot make changes</p>
              <p><strong>Member:</strong> Can create and edit projects, widgets, and feedback</p>
              <p><strong>Admin:</strong> Full access including organization settings and member management</p>
            </div>
          </div>

          {inviteMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-700">
                Failed to send invitations. Please try again.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || inviteMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail className="w-4 h-4" />
              {inviteMutation.isPending ? 'Sending...' : 'Send Invitations'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};