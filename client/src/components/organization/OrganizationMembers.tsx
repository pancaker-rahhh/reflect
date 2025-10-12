import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/client'
import { UserPlus, Envelope, DotsThree, Shield, User, Eye, Crown } from 'phosphor-react'
import { InviteMemberModal } from './InviteMemberModal'
import type { OrganizationMember } from '../../lib/api/organization'

interface OrganizationMembersProps {
  organizationId: string
}

export const OrganizationMembers: React.FC<OrganizationMembersProps> = ({ organizationId }) => {
  const queryClient = useQueryClient()
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [memberMenuOpen, setMemberMenuOpen] = useState<string | null>(null)

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['organization', organizationId, 'members'],
    queryFn: () =>
      apiClient.get<OrganizationMember[]>(
        `/organizations/${organizationId}/members?skip=0&limit=50`
      ),
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
      apiClient.put(`/organizations/${organizationId}/members/${memberId}`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', organizationId, 'members'] })
      setMemberMenuOpen(null)
    },
  })

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) =>
      apiClient.delete(`/organizations/${organizationId}/members/${memberId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', organizationId, 'members'] })
      setMemberMenuOpen(null)
    },
  })

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4" style={{ color: 'hsl(var(--tint-warning))' }} />
      case 'admin':
        return <Shield className="w-4 h-4" style={{ color: 'hsl(var(--tint-danger))' }} />
      case 'member':
        return <User className="w-4 h-4" style={{ color: 'hsl(var(--tint-info))' }} />
      case 'viewer':
        return <Eye className="w-4 h-4 text-muted-foreground" />
      default:
        return <User className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'tint-warning'
      case 'admin':
        return 'tint-danger'
      case 'member':
        return 'tint-info'
      case 'viewer':
        return 'tint-neutral'
      default:
        return 'tint-neutral'
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Team Members ({members.length})</h3>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg">
        <div className="px-6 py-3 border-b border-border bg-secondary">
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
                    <span className="text-sm font-medium text-gray-600">
                      {member.user_name?.charAt(0) || member.user_email?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {member.user_name || member.user_email || 'Unknown Member'}
                    </p>
                    <p className="text-sm text-gray-500">{member.user_email || 'No email'}</p>
                  </div>
                </div>

                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(member.role)}
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                        member.role
                      )}`}
                    >
                      {member.role}
                    </span>
                  </div>
                </div>

                <div className="col-span-3 text-sm text-gray-500">
                  {new Date(member.created_at).toLocaleDateString()}
                </div>

                <div className="col-span-1">
                  {member.role !== 'owner' && (
                    <div className="relative">
                      <button
                        onClick={() =>
                          setMemberMenuOpen(memberMenuOpen === member.id ? null : member.id)
                        }
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <DotsThree className="w-4 h-4" />
                      </button>

                      {memberMenuOpen === member.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-tertiary border border-border rounded-md shadow-lg z-10">
                          <div className="py-1">
                            <button
                              onClick={() =>
                                updateRoleMutation.mutate({ memberId: member.id, role: 'admin' })
                              }
                              disabled={member.role === 'admin'}
                              className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Make Admin
                            </button>
                            <button
                              onClick={() =>
                                updateRoleMutation.mutate({ memberId: member.id, role: 'member' })
                              }
                              disabled={member.role === 'member'}
                              className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Make Member
                            </button>
                            <button
                              onClick={() =>
                                updateRoleMutation.mutate({ memberId: member.id, role: 'viewer' })
                              }
                              disabled={member.role === 'viewer'}
                              className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Make Viewer
                            </button>
                            <hr className="my-1" />
                            <button
                              onClick={() => removeMemberMutation.mutate(member.id)}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
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
            <Envelope className="w-12 h-12 text-gray-300 mx-auto mb-4" />
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
  )
}
