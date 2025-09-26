import React, { useState, useEffect } from 'react'
import { Building2, Users, Shield, Save, Trash2, AlertCircle, Check, Plus, X } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { organizationApi, type OrganizationMember } from '../../lib/api/organization'
import { useAppContext } from '../../context/AppContext'
import { useToastNotifications } from '../../hooks/useToastNotifications'
import { AnimatedInput, AnimatedTextarea } from '../onboarding/shared/AnimatedInput'
import { InviteMemberModal } from './InviteMemberModal'

interface OrganizationSettingsPageProps {
  organizationId?: string
}

type Tab = 'general' | 'members'

export const OrganizationSettingsPage: React.FC<OrganizationSettingsPageProps> = ({
  organizationId,
}) => {
  const { organization: currentOrganization } = useAppContext()
  const toast = useToastNotifications()
  const queryClient = useQueryClient()
  const orgId = organizationId || currentOrganization?.id
  const [activeTab, setActiveTab] = useState<Tab>('general')
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  useEffect(() => {
    if (orgId) {
      loadOrganizationData()
    }
  }, [orgId])

  const loadOrganizationData = async () => {
    try {
      setLoading(true)
      if (!orgId) return

      const [orgData, membersData] = await Promise.all([
        organizationApi.getById(orgId),
        organizationApi.getMembers(orgId),
      ])

      // Organization is managed by context
      setMembers(membersData)
      setFormData({
        name: orgData.name || '',
        description: (orgData as any).description || '',
      })
    } catch (error) {
      console.error('Failed to load organization data:', error)
      toast.showError('Failed to load organization data')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveGeneral = async () => {
    try {
      setSaving(true)
      if (!orgId) return

      const updatedOrganization = await organizationApi.update(orgId, {
        name: formData.name,
        description: formData.description,
      })

      setFormData({
        name: updatedOrganization.name || '',
        description: updatedOrganization.description || '',
      })

      queryClient.invalidateQueries({ queryKey: ['organization'] })

      toast.showSuccess('Organization settings saved successfully')
    } catch (error) {
      console.error('Failed to save organization:', error)
      toast.showError('Failed to save organization settings')
    } finally {
      setSaving(false)
    }
  }

  const handleResendInvite = async (_memberId: string) => {
    try {
      // TODO: Implement resend invite API call
      toast.showSuccess('Invitation resent successfully')
    } catch (error) {
      console.error('Failed to resend invitation:', error)
      toast.showError('Failed to resend invitation')
    }
  }

  const handleCancelInvite = async (_memberId: string) => {
    try {
      // TODO: Implement cancel invite API call
      // Reload members to reflect changes
      if (orgId) {
        const membersData = await organizationApi.getMembers(orgId)
        setMembers(membersData)
      }
      toast.showSuccess('Invitation cancelled')
    } catch (error) {
      console.error('Failed to cancel invitation:', error)
      toast.showError('Failed to cancel invitation')
    }
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Building2 },
    { id: 'members', label: 'Members', icon: Users },
  ]

  const renderGeneralSettings = () => (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Information</h3>

        <div className="space-y-4">
          <AnimatedInput
            label="Organization Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter organization name"
            icon={<Building2 className="w-4 h-4" />}
          />

          <AnimatedTextarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of your organization"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={handleSaveGeneral}
          disabled={saving}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  )

  const renderMembersSettings = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Role Permissions Info */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Role Permissions
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <p className="font-semibold text-yellow-700 mb-1">Owner</p>
            <p className="text-gray-600 text-xs">
              Full control including billing, member management, and organization deletion
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <p className="font-semibold text-purple-700 mb-1">Admin</p>
            <p className="text-gray-600 text-xs">
              Manage projects, invite members, and access all organization settings
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <p className="font-semibold text-blue-700 mb-1">Member</p>
            <p className="text-gray-600 text-xs">
              Manage project content, and collaborate with team
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <p className="font-semibold text-gray-700 mb-1">Viewer</p>
            <p className="text-gray-600 text-xs">
              Read-only access to view projects, dashboards, and reports
            </p>
          </div>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h4 className="text-gray-900 font-medium mb-2">No team members yet</h4>
          <p className="text-gray-500 text-sm mb-4">
            Invite team members to collaborate on your organization
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-4">Member</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-4">Actions</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {members.map((member) => (
              <div key={member.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Member Info */}
                  <div className="col-span-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          member.is_pending ? 'bg-yellow-100' : 'bg-indigo-100'
                        }`}
                      >
                        <span
                          className={`font-semibold ${
                            member.is_pending ? 'text-yellow-600' : 'text-indigo-600'
                          }`}
                        >
                          {(member as any).name?.[0] || (member as any).email?.[0] || 'U'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-gray-900">
                          {(member as any).name || (member as any).email}
                        </p>
                        <p className="text-sm text-gray-500">{(member as any).email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    {member.is_pending ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-1.5"></div>
                        Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></div>
                        Active
                      </span>
                    )}
                  </div>

                  {/* Role */}
                  <div className="col-span-2">
                    {member.is_pending || member.role === 'owner' ? (
                      <span className="text-sm text-gray-500 capitalize">{member.role}</span>
                    ) : (
                      <select
                        value={member.role}
                        className="block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        onChange={() => {}}
                      >
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-4">
                    <div className="flex items-center gap-2 justify-end">
                      {member.is_pending ? (
                        <>
                          <button
                            className="px-3 py-1 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                            onClick={() => handleResendInvite(member.id)}
                          >
                            Resend
                          </button>
                          <button
                            className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            onClick={() => handleCancelInvite(member.id)}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : member.role !== 'owner' ? (
                        <button className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  /*
  const _renderBillingSettings = () => (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing & Subscription</h3>
      
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white mb-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm opacity-90">Current Plan</p>
            <h4 className="text-2xl font-bold mt-1">Professional</h4>
            <p className="text-sm opacity-90 mt-2">$49/month • 10 team members</p>
          </div>
          <button className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
            Upgrade Plan
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-900">Payment Method</p>
              <p className="text-sm text-gray-500">Visa ending in 4242</p>
            </div>
            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              Update
            </button>
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-900">Next Billing Date</p>
              <p className="text-sm text-gray-500">January 15, 2025</p>
            </div>
            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              View Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const _renderPlaceholderSection = (title: string, description: string) => (
    <div className="p-6">
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Settings className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 mb-4">{description}</p>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
          Coming Soon
        </button>
      </div>
    </div>
  );
  */

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings()
      case 'members':
        return renderMembersSettings()
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Organization Settings</h1>
        <p className="text-gray-600">Manage your organization settings and preferences</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex-1 lg:flex-initial flex items-center justify-center lg:justify-start gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden lg:inline">{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="min-h-[400px]">{renderTabContent()}</div>
      </div>

      {showInviteModal && orgId && (
        <InviteMemberModal organizationId={orgId} onClose={() => setShowInviteModal(false)} />
      )}
    </div>
  )
}
