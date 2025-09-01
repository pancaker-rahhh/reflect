import React, { useState, useEffect } from 'react';

import {
  FolderOpen,
  Users,
  Settings,
  Key,
  Webhook,
  Shield,
  Puzzle,
  Save,
  Trash2,
  AlertCircle,
  Check,
  Copy,
  RefreshCw,
  Link,
  Globe,
  Lock,
  AlertTriangle,
  Plus,
} from 'lucide-react'
import { projectApi, type ProjectMember } from '../../lib/api/project'
import { organizationApi, type OrganizationMember } from '../../lib/api/organization'
import { useAppContext } from '../../context/AppContext'
import { AnimatedInput, AnimatedTextarea } from '../onboarding/shared/AnimatedInput'
import { ProjectMemberModal } from './ProjectMemberModal'
import { ApiKeyModal } from './ApiKeyModal'
import { DeleteProjectModal } from './DeleteProjectModal'
import { DeleteMemberModal } from './DeleteMemberModal'
import { CreateProjectModal } from './CreateProjectModal'
import { ProjectTeamSection } from './ProjectTeamSection'
import { ComingSoon } from '../shared/ComingSoon'
import { isFeatureEnabled } from '../../lib/featureFlags'
import { IntegrationsPage } from '@/pages/settings/IntegrationsPage'
import type { Project } from '@/types'

interface ProjectSettingsPageProps {
  projectId?: string
}

type Tab = 'general' | 'team' | 'api' | 'webhooks' | 'integrations' | 'danger'

export const ProjectSettingsPage: React.FC<ProjectSettingsPageProps> = ({ projectId }) => {
  const {
    currentProject,
    refreshProjects,
    organization: currentOrganization,
    projects,
    setCurrentProject,
  } = useAppContext()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('general')
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteMemberModal, setShowDeleteMemberModal] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<{
    id: string
    name: string
    email: string
    isPending: boolean
  } | null>(null)
  const [organizationMembers, setOrganizationMembers] = useState<OrganizationMember[]>([])
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([])
  const [allTeamMembers, setAllTeamMembers] = useState<ProjectMember[]>([])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'private',
    domain: '',
    timezone: 'UTC',
    language: 'en',
  })

  const [apiKeys, setApiKeys] = useState([
    {
      id: '1',
      name: 'Production API Key',
      key: 'pk_live_xxxxxxxxxxx', // gitleaks:allow
      created: '2024-01-15',
      lastUsed: '2024-01-20',
    },
    {
      id: '2',
      name: 'Development API Key',
      key: 'pk_test_xxxxxxxxxxx', // gitleaks:allow
      created: '2024-01-10',
      lastUsed: 'Never',
    },
  ])

  useEffect(() => {
    if (currentProject || projectId) {
      loadProjectData()
    } else {
      // No project to load, stop loading
      setLoading(false)
    }
  }, [currentProject, projectId])

  useEffect(() => {
    if (currentOrganization) {
      loadOrganizationMembers()
    }
  }, [currentOrganization])

  useEffect(() => {
    const id = currentProject?.id || projectId
    if (id) {
      loadProjectMembers()
    }
  }, [currentProject, projectId])

  const loadProjectData = async () => {
    try {
      setLoading(true)
      const id = projectId || currentProject?.id
      if (!id) return

      const projectData = await projectApi.getProject(id)
      setProject(projectData)
      setFormData({
        name: projectData.name || '',
        description: projectData.description || '',
        visibility: 'private',
        domain: '',
        timezone: 'UTC',
        language: 'en',
      })
    } catch (error) {
      console.error('Failed to load project:', error)
      setMessage({ type: 'error', text: 'Failed to load project data' })
    } finally {
      setLoading(false)
    }
  }

  const loadOrganizationMembers = async () => {
    try {
      if (!currentOrganization?.id) return

      const members = await organizationApi.getMembers(currentOrganization.id)
      setOrganizationMembers(members)

      // Merge with existing project members if they're loaded
      if (projectMembers.length > 0) {
        mergeTeamMembers(projectMembers, members)
      }
    } catch (error) {
      console.error('Failed to load organization members:', error)
      setMessage({ type: 'error', text: 'Failed to load organization members' })
    }
  }

  const loadProjectMembers = async () => {
    try {
      const id = currentProject?.id || projectId
      if (!id) return

      const members = await projectApi.getMembers(id)
      setProjectMembers(members)

      // Merge with organization owners
      mergeTeamMembers(members, organizationMembers)
    } catch (error) {
      console.error('Failed to load project members:', error)
      setMessage({ type: 'error', text: 'Failed to load project members' })
    }
  }

  const mergeTeamMembers = (projectMems: ProjectMember[], orgMembers: OrganizationMember[]) => {
    // Find organization owners who are not already project members
    const projectMemberUserIds = new Set(projectMems.map((pm) => pm.user_id))
    const orgOwners = orgMembers.filter(
      (om) => om.role === 'owner' && om.user_id && !projectMemberUserIds.has(om.user_id)
    )

    // Convert organization owners to project member format
    const ownersAsProjectMembers: ProjectMember[] = orgOwners.map((owner) => ({
      id: `org-owner-${owner.id}`, // Use a special ID to distinguish from actual project members
      user_id: owner.user_id!,
      project_id: currentProject?.id || projectId || '',
      role: 'admin' as const, // Organization owners are shown as admins in projects
      created_at: owner.created_at,
      updated_at: owner.updated_at || owner.created_at,
      user_name: owner.user_name,
      user_email: owner.user_email,
      is_organization_owner: true, // Add a flag to identify them
    }))

    // Merge project members with organization owners
    const allMembers = [...projectMems, ...ownersAsProjectMembers]
    setAllTeamMembers(allMembers)
  }

  const handleSaveGeneral = async () => {
    try {
      setSaving(true)
      const id = projectId || currentProject?.id
      if (!id) return

      await projectApi.updateProject(id, {
        name: formData.name,
        description: formData.description,
      })

      setMessage({ type: 'success', text: 'Project settings saved successfully' })
      refreshProjects()
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Failed to save project:', error)
      setMessage({ type: 'error', text: 'Failed to save project settings' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProject = async () => {
    try {
      const id = projectId || currentProject?.id
      if (!id) return

      await projectApi.deleteProject(id)
      setMessage({ type: 'success', text: 'Project deleted successfully' })
      refreshProjects()

      // Set current project to null and stay on the same page
      // The component will show "no projects" state if no projects remain
      const remainingProjects = projects.filter((p) => p.id !== id)
      if (remainingProjects.length > 0) {
        setCurrentProject(remainingProjects[0])
      } else {
        setCurrentProject(null)
      }
    } catch (error) {
      console.error('Failed to delete project:', error)
      setMessage({ type: 'error', text: 'Failed to delete project' })
      throw error // Re-throw to let modal handle the error state
    }
  }

  const handleCreateProject = async (projectData: { name: string; description: string }) => {
    try {
      if (!currentOrganization?.id) {
        throw new Error('No organization found')
      }

      const newProject = await projectApi.createProject({
        name: projectData.name,
        description: projectData.description,
        organization_id: currentOrganization.id,
      })

      setMessage({ type: 'success', text: 'Project created successfully' })
      refreshProjects()
      setCurrentProject(newProject)
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Failed to create project:', error)
      setMessage({ type: 'error', text: 'Failed to create project' })
      setTimeout(() => setMessage(null), 3000)
      throw error
    }
  }

  const handleResendInvite = async (memberId: string) => {
    try {
      // TODO: Implement resend invite API call
      setMessage({ type: 'success', text: 'Invitation resent successfully' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Failed to resend invitation:', error)
      setMessage({ type: 'error', text: 'Failed to resend invitation' })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleRemoveMember = (member: ProjectMember) => {
    // Prevent removal of organization owners
    if ((member as any).is_organization_owner) {
      setMessage({ type: 'error', text: 'Cannot remove organization owner from project' })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    setMemberToDelete({
      id: member.id,
      name: member.user_name || member.user_email || 'Unknown Member',
      email: member.user_email || '',
      isPending: false, // Project members are never pending
    })
    setShowDeleteMemberModal(true)
  }

  const executeRemoveMember = async () => {
    if (!memberToDelete) {
      return
    }

    const projectIdToUse = currentProject?.id || projectId
    if (!projectIdToUse) {
      return
    }

    try {
      // Find the project member to get user_id
      const member = projectMembers.find((m) => m.id === memberToDelete.id)
      if (!member) {
        setMessage({ type: 'error', text: 'Member not found' })
        return
      }

      // Remove active member from project
      await projectApi.removeMember(projectIdToUse, member.user_id)
      setMessage({ type: 'success', text: 'Member removed from project successfully' })

      // Refresh the member list
      await loadProjectMembers()
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Failed to remove member:', error)
      setMessage({ type: 'error', text: 'Failed to remove member' })
      setTimeout(() => setMessage(null), 3000)
      throw error
    }
  }

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setMessage({ type: 'success', text: 'API key copied to clipboard' })
    setTimeout(() => setMessage(null), 2000)
  }

  const handleRegenerateApiKey = (keyId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to regenerate this API key? The old key will stop working immediately.'
    )
    if (confirmed) {
      setMessage({ type: 'success', text: 'API key regenerated successfully' })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const tabs = [
    { id: 'general', label: 'General', icon: FolderOpen },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'api', label: 'API Keys', icon: Key, wip: true },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook, wip: true },
    { id: 'integrations', label: 'Integrations', icon: Puzzle },
    { id: 'danger', label: 'Danger Zone', icon: Shield },
  ]

  const renderGeneralSettings = () => (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>

        <div className="space-y-4">
          <AnimatedInput
            label="Project Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter project name"
            icon={<FolderOpen className="w-4 h-4" />}
          />

          <AnimatedTextarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your project"
            rows={3}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
              <select
                value={formData.visibility}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
                <option value="team">Team Only</option>
              </select>
            </div>

            <AnimatedInput
              label="Custom Domain"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              placeholder="app.yourdomain.com"
              icon={<Globe className="w-4 h-4" />}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Asia/Tokyo">Tokyo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ja">Japanese</option>
              </select>
            </div>
          </div>
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

  const renderTeamSettings = () => {
    if (!isFeatureEnabled('ENABLE_TEAM_FEATURES')) {
      return (
        <ComingSoon
          title="Team Management"
          description="Team collaboration features are coming soon. You'll be able to invite team members and manage their roles."
          icon={<Users className="w-8 h-8 text-gray-400" />}
        />
      )
    }

    return (
      <ProjectTeamSection
        members={allTeamMembers}
        currentUserId={undefined}
        onAddMember={() => setShowMemberModal(true)}
        onRemoveMember={handleRemoveMember}
        onRoleChange={async (member, newRole) => {
          try {
            // Prevent role changes for organization owners
            if ((member as any).is_organization_owner) {
              setMessage({ type: 'error', text: 'Cannot change role of organization owner' })
              setTimeout(() => setMessage(null), 3000)
              return
            }

            const projectIdToUse = currentProject?.id || projectId
            if (!projectIdToUse) return

            await projectApi.updateMember(projectIdToUse, member.user_id, { role: newRole })
            setMessage({ type: 'success', text: 'Member role updated successfully' })

            // Refresh project members
            await loadProjectMembers()
            setTimeout(() => setMessage(null), 3000)
          } catch (error) {
            console.error('Failed to update member role:', error)
            setMessage({ type: 'error', text: 'Failed to update member role' })
            setTimeout(() => setMessage(null), 3000)
          }
        }}
      />
    )
  }

  const renderApiKeysSettings = () => (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-lg font-semibold text-gray-900">API Keys</h3>
          <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-1 animate-pulse"></div>
            WIP
          </span>
        </div>
        <p className="text-sm text-gray-600">
          Manage API keys for accessing your project programmatically
        </p>
        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-orange-800 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            API Keys functionality is currently under development. The interface below is for
            preview purposes only.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {apiKeys.map((apiKey) => (
          <div key={apiKey.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{apiKey.name}</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Created: {apiKey.created} • Last used: {apiKey.lastUsed}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRegenerateApiKey(apiKey.id)}
                  className="p-2 text-gray-400 hover:text-indigo-600"
                  title="Regenerate key"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg font-mono text-sm">
              <Lock className="w-4 h-4 text-gray-400" />
              <span className="flex-1 text-gray-600">{apiKey.key}</span>
              <button
                onClick={() => handleCopyApiKey(apiKey.key)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowApiKeyModal(true)}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
      >
        <Key className="w-4 h-4" />
        Generate New API Key
      </button>
    </div>
  )

  const renderPlaceholderSection = (title: string, description: string, icon: React.ReactNode) => (
    <div className="p-6">
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
        <div className="mb-3">
          <span className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
            Work in Progress
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 mb-4 max-w-md mx-auto">{description}</p>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-orange-800 text-sm max-w-md mx-auto">
          <AlertCircle className="w-4 h-4 inline mr-2" />
          This feature is currently under development and will be available soon.
        </div>
      </div>
    </div>
  )

  const renderDangerZone = () => (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Danger Zone</h3>
        <p className="text-sm text-gray-600">Irreversible and destructive actions</p>
      </div>

      <div className="space-y-4">
        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Delete Project
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Permanently delete this project and all of its data. This action cannot be undone.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete Project
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings()
      case 'team':
        return renderTeamSettings()
      case 'api':
        return renderApiKeysSettings()
      case 'webhooks':
        return renderPlaceholderSection(
          'Webhooks',
          'Configure webhooks to receive real-time notifications about events in your project.',
          <Webhook className="w-8 h-8 text-gray-400" />
        )
      case 'integrations':
        return <IntegrationsPage />
      case 'danger':
        return renderDangerZone()
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

  // Show no projects state if no projects exist
  if (!loading && projects.length === 0) {
    return (
      <>
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Projects Found</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You don't have any projects yet. Create your first project to get started with
              collecting feedback and managing your roadmap.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
            >
              <Plus className="w-5 h-5" />
              Create Your First Project
            </button>
          </div>
        </div>

        {/* Modal for no projects state */}
        {showCreateModal && (
          <CreateProjectModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateProject}
          />
        )}
      </>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Settings</h1>
        <p className="text-gray-600">Manage your project configuration and preferences</p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex-1 lg:flex-initial flex items-center justify-center lg:justify-start gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors relative ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden lg:inline">{tab.label}</span>
                  {tab.wip && (
                    <span className="hidden lg:inline-block ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                      WIP
                    </span>
                  )}
                  {tab.wip && (
                    <div className="lg:hidden absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="min-h-[400px]">{renderTabContent()}</div>
      </div>

      {showMemberModal && (
        <ProjectMemberModal
          projectId={projectId || currentProject?.id || ''}
          isOpen={showMemberModal}
          onClose={() => setShowMemberModal(false)}
          onAdd={async (memberId, role) => {
            try {
              const projectIdToUse = currentProject?.id || projectId
              if (!projectIdToUse) {
                setMessage({ type: 'error', text: 'No project selected' })
                return
              }

              if (memberId.startsWith('new:')) {
                // Handle new member invitation by email
                const email = memberId.replace('new:', '')

                await projectApi.inviteMember(projectIdToUse, {
                  email,
                  role: role as 'admin' | 'editor' | 'viewer',
                })

                setMessage({ type: 'success', text: `User ${email} added to project successfully` })
              } else {
                // Handle existing organization member by user ID
                const orgMember = organizationMembers.find((m) => m.id === memberId)
                if (orgMember && orgMember.user_id) {
                  await projectApi.inviteMember(projectIdToUse, {
                    email: orgMember.user_email || '',
                    role: role as 'admin' | 'editor' | 'viewer',
                  })
                  setMessage({ type: 'success', text: 'Member added to project successfully' })
                }
              }

              // Refresh project members
              await loadProjectMembers()
              setTimeout(() => setMessage(null), 3000)
            } catch (error) {
              console.error('Failed to add member:', error)
              setMessage({ type: 'error', text: 'Failed to add member' })
              setTimeout(() => setMessage(null), 3000)
            }
          }}
          organizationMembers={organizationMembers.map((member) => ({
            id: member.id,
            name: member.user_name || 'Unknown User', // Provide fallback
            email: member.user_email || '',
          }))}
          existingMembers={allTeamMembers.map((m) => m.user_id)} // Existing project members by user_id
        />
      )}

      {showApiKeyModal && (
        <ApiKeyModal
          isOpen={showApiKeyModal}
          onClose={() => setShowApiKeyModal(false)}
          onGenerate={(name, permissions) => {
            setApiKeys((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                name,
                key: `pk_${Math.random().toString(36).substring(2, 15)}`,
                created: new Date().toISOString().split('T')[0],
                lastUsed: 'Never',
              },
            ])
            setMessage({ type: 'success', text: 'API key generated successfully' })
            setTimeout(() => setMessage(null), 3000)
          }}
        />
      )}

      {showDeleteModal && (
        <DeleteProjectModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleDeleteProject}
          projectName={project?.name || 'Unknown Project'}
        />
      )}

      {showCreateModal && (
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateProject}
        />
      )}

      {showDeleteMemberModal && memberToDelete && (
        <DeleteMemberModal
          isOpen={showDeleteMemberModal}
          onClose={() => {
            setShowDeleteMemberModal(false)
            setMemberToDelete(null)
          }}
          onDelete={executeRemoveMember}
          memberName={memberToDelete.name}
          memberEmail={memberToDelete.email}
          isPending={memberToDelete.isPending}
        />
      )}
    </div>
  )
}
