import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/client';
import { X, Envelope, UserPlus } from 'phosphor-react';
import { AnimatedInput } from '../onboarding/shared/AnimatedInput';

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
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member' | 'viewer'>('member');

  const inviteMutation = useMutation({
    mutationFn: (data: InvitationRequest) =>
      apiClient.post(`/organizations/${organizationId}/members`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', organizationId, 'members'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && isValidEmail(email)) {
      inviteMutation.mutate({ email: email.trim(), role });
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const canSubmit = email.trim() && isValidEmail(email);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-tertiary rounded-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Invite Member</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <AnimatedInput
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@company.com"
            icon={<Envelope className="w-4 h-4" />}
            required
          />
          {email && !isValidEmail(email) && (
            <p className="text-xs text-red-600 mt-1">Please enter a valid email</p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['viewer', 'member', 'admin'] as const).map((roleOption) => (
                <button
                  key={roleOption}
                  type="button"
                  onClick={() => setRole(roleOption)}
                  className={`px-4 py-2 rounded-lg border-2 font-medium capitalize transition-all ${
                    role === roleOption
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {roleOption}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-secondary rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Role Permissions</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Viewer:</strong> Can view projects and feedback but cannot make changes</p>
              <p><strong>Member:</strong> Can create and edit widgets, and feedback</p>
              <p><strong>Admin:</strong> Full access including organization settings and member management</p>
            </div>
          </div>

          {inviteMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">
                Failed to send invitation. Please try again.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4">
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
              <Envelope className="w-4 h-4" />
              {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};