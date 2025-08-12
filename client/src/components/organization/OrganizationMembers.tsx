import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/client';
import { UserPlus, Mail, MoreHorizontal, Shield, User, Eye, Crown } from 'lucide-react';
import { InviteMemberModal } from './InviteMemberModal';

interface OrganizationMember {
  id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joined_at: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

interface OrganizationMembersProps {
  organizationId: string;
}

export const OrganizationMembers: React.FC<OrganizationMembersProps> = ({ organizationId }) => {
  const queryClient = useQueryClient();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [memberMenuOpen, setMemberMenuOpen] = useState<string | null>(null);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['organization', organizationId, 'members'],
    queryFn: () => apiClient.get<OrganizationMember[]>(`/organizations/${organizationId}/members`),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
      apiClient.put(`/organizations/${organizationId}/members/${memberId}`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', organizationId, 'members'] });
      setMemberMenuOpen(null);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) =>
      apiClient.delete(`/organizations/${organizationId}/members/${memberId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', organizationId, 'members'] });
      setMemberMenuOpen(null);
    },
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-red-600" />;
      case 'member':
        return <User className="w-4 h-4 text-blue-600" />;
      case 'viewer':
        return <Eye className="w-4 h-4 text-gray-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'member':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Team Members ({members.length})
        </h3>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
            <div className="col-span-5">Member</div>
            <div className="col-span-3">Role</div>
            <div className="col-span-3">Joined</div>
            <div className="col-span-1">Actions</div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {members.map((member) => (
            <div key={member.id} className="px-6 py-4">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    {member.user.avatar_url ? (
                      <img
                        src={member.user.avatar_url}
                        alt={member.user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-600">
                        {member.user.name?.charAt(0) || member.user.email.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {member.user.name || member.user.email}
                    </p>
                    <p className="text-sm text-gray-500">{member.user.email}</p>
                  </div>
                </div>

                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(member.role)}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(member.role)}`}>
                      {member.role}
                    </span>
                  </div>
                </div>

                <div className="col-span-3 text-sm text-gray-500">
                  {new Date(member.joined_at).toLocaleDateString()}
                </div>

                <div className="col-span-1">
                  {member.role !== 'owner' && (
                    <div className="relative">
                      <button
                        onClick={() => setMemberMenuOpen(memberMenuOpen === member.id ? null : member.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {memberMenuOpen === member.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                          <div className="py-1">
                            <button
                              onClick={() => updateRoleMutation.mutate({ memberId: member.id, role: 'admin' })}
                              disabled={member.role === 'admin'}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Make Admin
                            </button>
                            <button
                              onClick={() => updateRoleMutation.mutate({ memberId: member.id, role: 'member' })}
                              disabled={member.role === 'member'}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Make Member
                            </button>
                            <button
                              onClick={() => updateRoleMutation.mutate({ memberId: member.id, role: 'viewer' })}
                              disabled={member.role === 'viewer'}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Make Viewer
                            </button>
                            <hr className="my-1" />
                            <button
                              onClick={() => removeMemberMutation.mutate(member.id)}
                              className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                            >
                              Remove Member
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {members.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No members yet</h3>
            <p className="text-gray-500 mb-4">Invite team members to start collaborating</p>
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Invite First Member
            </button>
          </div>
        )}
      </div>

      {showInviteModal && (
        <InviteMemberModal
          organizationId={organizationId}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
};