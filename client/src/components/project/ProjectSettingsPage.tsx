import React, { useState, useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
// import { useNavigate } from 'react-router-dom'; // Currently unused

import {
  FolderOpen,
  Users,
  Shield,
  Puzzle,
  Save,
  Trash2,
  AlertCircle,
  Copy,
  RefreshCw,
  Lock,
  AlertTriangle,
  Plus,
  Key,
  Webhook,
  Loader2,
} from 'lucide-react'
import { projectApi, type ProjectMember } from '../../lib/api/project'
import { organizationApi, type OrganizationMember } from '../../lib/api/organization'
import { useAppContext } from '../../context/AppContext'
import { useToastNotifications } from '../../hooks/useToastNotifications'
import { AnimatedInput, AnimatedTextarea } from '../onboarding/shared/AnimatedInput'
import { Button } from '../ui/button'
import { ProjectMemberModal } from './ProjectMemberModal'
import { ApiKeyModal } from './ApiKeyModal'
import { DeleteProjectModal } from './DeleteProjectModal'
import { DeleteMemberModal } from './DeleteMemberModal'
import { CreateProjectModal } from './CreateProjectModal'
import { ProjectTeamSection } from './ProjectTeamSection'
import { ConfirmationModal } from '../common/ConfirmationModal'
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
  const queryClient = useQueryClient()
  const toast = useToastNotifications()
  // const navigate = useNavigate() // Currently unused
  const [activeTab, setActiveTab] = useState<Tab>('general')
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteMemberModal, setShowDeleteMemberModal] = useState(false)
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<{
    id: string
    name: string
    email: string
    isPending: boolean
  } | null>(null)
  const [allTeamMembers, setAllTeamMembers] = useState<ProjectMember[]>([])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [isEdited, setIsEdited] = useState(false)

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

  // Use React Query for organization members
  const { data: organizationMembers = [] } = useQuery({
    queryKey: ['organization', currentOrganization?.id, 'members'],
    queryFn: () => organizationApi.getMembers(currentOrganization!.id),
    enabled: !!currentOrganization?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Use React Query for project members
  const { data: projectMembers = [] } = useQuery({
    queryKey: ['project', currentProject?.id || projectId, 'members'],
    queryFn: () => projectApi.getMembers(currentProject!.id || projectId!),
    enabled: !!(currentProject?.id || projectId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const loadProjectData = useCallback(async () => {
    try {
      setLoading(true)
      const id = projectId || currentProject?.id
      if (!id) return

      const projectData = await projectApi.getProject(id)
      setProject(projectData)
      setFormData({
        name: projectData.name || '',
        description: projectData.description || '',
      })
    } catch (error) {
      console.error('Failed to load project:', error)
      toast.showError('Failed to load project data')
      setCurrentProject(null)
    } finally {
      setLoading(false)
    }
  }, [currentProject?.id, projectId, setCurrentProject])

  const mergeTeamMembers = useCallback(
    (projectMems: ProjectMember[], orgMembers: OrganizationMember[]) => {
      const projectMemberUserIds = new Set(projectMems.map((pm) => pm.user_id))
      const orgOwners = orgMembers.filter(
        (om) => om.role === 'owner' && om.user_id && !projectMemberUserIds.has(om.user_id)
      )

      const ownersAsProjectMembers: ProjectMember[] = orgOwners.map((owner) => ({
        id: `org-owner-${owner.id}`,
        user_id: owner.user_id!,
        project_id: currentProject?.id || projectId || '',
        role: 'admin' as const,
        created_at: owner.created_at,
        updated_at: owner.updated_at || owner.created_at,
        user_name: owner.user_name,
        user_email: owner.user_email,
        is_organization_owner: true,
      }))

      const allMembers = [...projectMems, ...ownersAsProjectMembers]
      setAllTeamMembers(allMembers)
    },
    [currentProject?.id, projectId]
  )

  useEffect(() => {
    if (currentProject || projectId) {
      loadProjectData()
    } else {
      setLoading(false)
    }
  }, [currentProject, projectId, loadProjectData])

  // Merge team members when both organization and project members are loaded
  useEffect(() => {
    if (projectMembers.length > 0 && organizationMembers.length > 0) {
      mergeTeamMembers(projectMembers, organizationMembers)
    }
  }, [projectMembers, organizationMembers, mergeTeamMembers])

  const isOrganizationOwner = (member: unknown): member is { is_organization_owner: boolean } => {
    return (
      typeof member === 'object' &&
      member !== null &&
      'is_organization_owner' in (member as Record<string, unknown>) &&
      Boolean((member as Record<string, unknown>).is_organization_owner)
    )
  }

  const handleSaveGeneral = async () => {
    try {
      setSaving(true)
      const id = projectId || currentProject?.id
      if (!id) return

      if (formData.name.trim().length < 3) {
        toast.showError('Project name must be at least 3 characters long')
        setSaving(false)
        return
      }

      const updatedProject = await projectApi.updateProject(id, {
        name: formData.name,
        description: formData.description,
      })

      setProject(updatedProject)
      setCurrentProject(updatedProject)
      setFormData({
        name: updatedProject.name || '',
        description: updatedProject.description || '',
      })
      setIsEdited(false)

      toast.showSuccess('Project settings saved successfully!')
      refreshProjects()
    } catch (error) {
      console.error('Failed to save project:', error)
      toast.showError('Failed to save project settings')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProject = async () => {
    try {
      const id = projectId || currentProject?.id
      if (!id) return

      await projectApi.deleteProject(id)

      await refreshProjects()

      toast.showSuccess('Project deleted successfully')

      const remainingProjects = projects.filter((p) => p.id !== id)
      if (remainingProjects.length > 0) {
        setCurrentProject(remainingProjects[0])
      } else {
        setCurrentProject(null)
      }
    } catch (error) {
      console.error('Failed to delete project:', error)
      toast.showError('Failed to delete project')
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

      toast.showSuccess('Project created successfully')
      refreshProjects()
      setCurrentProject(newProject)
    } catch (error) {
      console.error('Failed to create project:', error)
      toast.showError('Failed to create project')
      throw error
    }
  }

  // const handleResendInvite = async (_memberId: string) => {
  //   try {
  //     // TODO: Implement resend invite API call
  //     setMessage({ type: 'success', text: 'Invitation resent successfully' })
  //     setTimeout(() => setMessage(null), 3000)
  //   } catch (error) {
  //     console.error('Failed to resend invitation:', error)
  //     setMessage({ type: 'error', text: 'Failed to resend invitation' })
  //     setTimeout(() => setMessage(null), 3000)
  //   }
  // }

  const handleRemoveMember = (member: ProjectMember) => {
    // Prevent removal of organization owners
    if (isOrganizationOwner(member)) {
      toast.showError('Cannot remove organization owner from project')
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
        toast.showError('Member not found')
        return
      }

      // Remove active member from project
      await projectApi.removeMember(projectIdToUse, member.user_id)
      toast.showSuccess('Member removed from project successfully')

      // Refresh the member list
      queryClient.invalidateQueries({
        queryKey: ['project', currentProject?.id || projectId, 'members'],
      })
    } catch (error) {
      console.error('Failed to remove member:', error)
      toast.showError('Failed to remove member')
      throw error
    }
  }

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast.showSuccess('API key copied to clipboard')
  }

  const handleRegenerateApiKey = (_keyId: string) => {
    setShowRegenerateConfirm(true)
  }

  const handleConfirmRegenerate = () => {
    toast.showSuccess('API key regenerated successfully')
    setShowRegenerateConfirm(false)
  }

  const tabs = [
    { id: 'general', label: 'General', icon: FolderOpen },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'integrations', label: 'Integrations', icon: Puzzle },
    { id: 'danger', label: 'Danger Zone', icon: Shield },
  ]

  const renderGeneralSettings = () => (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Project Information</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <AnimatedInput
              label="Project Name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value })
                setIsEdited(true)
              }}
              placeholder="Enter project name (minimum 3 characters)"
              icon={<FolderOpen className="w-4 h-4" />}
            />
            {formData.name.trim().length > 0 && formData.name.trim().length < 3 && (
              <p className="text-sm text-destructive">
                Project name must be at least 3 characters long
              </p>
            )}
          </div>

          <AnimatedTextarea
            label="Description"
            value={formData.description}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value })
              setIsEdited(true)
            }}
            placeholder="Describe your project"
            rows={3}
            className="placeholder:text-muted-foreground/70"
          />
        </div>
      </div>
    </div>
  )

  const renderTeamSettings = () => {
    if (!isFeatureEnabled('ENABLE_TEAM_FEATURES')) {
      return (
        <ComingSoon
          title="Team Management"
          description="Team collaboration features are coming soon. You'll be able to invite team members and manage their roles."
          icon={<Users className="w-8 h-8 text-muted-foreground" />}
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
            if (isOrganizationOwner(member)) {
              toast.showError('Cannot change role of organization owner')
              return
            }

            const projectIdToUse = currentProject?.id || projectId
            if (!projectIdToUse) return

            await projectApi.updateMember(projectIdToUse, member.user_id, { role: newRole })
            toast.showSuccess('Member role updated successfully')

            // Refresh project members
            queryClient.invalidateQueries({
              queryKey: ['project', currentProject?.id || projectId, 'members'],
            })
          } catch (error) {
            console.error('Failed to update member role:', error)
            toast.showError('Failed to update member role')
          }
        }}
      />
    )
  }

  const renderApiKeysSettings = () => (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-lg font-semibold text-foreground">API Keys</h3>
          <span className="inline-flex items-center px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
            <div className="w-1.5 h-1.5 rounded-full mr-1 animate-pulse bg-[hsl(var(--primary))]"></div>
            WIP
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage API keys for accessing your project programmatically
        </p>
        <div className="mt-3 p-3 bg-muted/30 border border-border rounded-lg">
          <p className="text-muted-foreground text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 text-[hsl(var(--primary))]" />
            API Keys functionality is currently under development. The interface below is for
            preview purposes only.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {apiKeys.map((apiKey) => (
          <div key={apiKey.id} className="border border-border rounded-lg p-4 bg-card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-foreground">{apiKey.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Created: {apiKey.created} • Last used: {apiKey.lastUsed}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRegenerateApiKey(apiKey.id)}
                  className="p-2 text-muted-foreground hover:text-[hsl(var(--primary))]"
                  title="Regenerate key"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button className="p-2 text-muted-foreground hover:text-[hsl(var(--destructive))]">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg font-mono text-sm">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <span className="flex-1 text-muted-foreground">{apiKey.key}</span>
              <button
                onClick={() => handleCopyApiKey(apiKey.key)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowApiKeyModal(true)}
        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
      >
        <Key className="w-4 h-4" />
        Generate New API Key
      </button>
    </div>
  )

  const renderPlaceholderSection = (title: string, description: string, icon: React.ReactNode) => (
    <div className="p-6">
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
        <div className="mb-3">
          <span className="inline-flex items-center px-3 py-1 bg-muted text-muted-foreground text-sm font-medium rounded-full">
            <div className="w-2 h-2 rounded-full mr-2 animate-pulse bg-[hsl(var(--primary))]"></div>
            Work in Progress
          </span>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">{description}</p>
        <div className="bg-muted/30 border border-border rounded-lg p-4 text-muted-foreground text-sm max-w-md mx-auto">
          <AlertCircle className="w-4 h-4 inline mr-2 text-[hsl(var(--primary))]" />
          This feature is currently under development and will be available soon.
        </div>
      </div>
    </div>
  )

  const renderDangerZone = () => (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Danger Zone</h3>
        <p className="text-sm text-muted-foreground">Irreversible and destructive actions</p>
      </div>

      <div className="space-y-4">
        <div className="border rounded-lg p-4 bg-[hsl(var(--destructive))/0.08] border-[hsl(var(--destructive))/0.25]">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[hsl(var(--destructive))]" />
                Delete Project
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently delete this project and all of its data. This action cannot be undone.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 text-destructive hover:text-destructive/80 border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 rounded-lg transition-colors"
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Show no projects state if no projects exist
  if (!loading && projects.length === 0) {
    return (
      <>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Projects Found</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You don&apos;t have any projects yet. Create your first project to get started with
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center space-y-6 mb-12">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">Project Settings</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage your project configuration and preferences
          </p>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-soft overflow-hidden border border-border">
        <div className="border-b border-border">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex-1 lg:flex-initial flex items-center justify-center lg:justify-start gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors relative ${
                    activeTab === tab.id
                      ? 'border-primary text-foreground bg-secondary/30'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/30'
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

      {activeTab === 'general' && isEdited && (
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSaveGeneral}
            disabled={saving || formData.name.trim().length < 3}
            className="px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}

      {showMemberModal && (
        <ProjectMemberModal
          projectId={projectId || currentProject?.id || ''}
          isOpen={showMemberModal}
          onClose={() => setShowMemberModal(false)}
          onAdd={async (memberId, role) => {
            try {
              const projectIdToUse = currentProject?.id || projectId
              if (!projectIdToUse) {
                toast.showError('No project selected')
                return
              }

              if (memberId.startsWith('new:')) {
                // Handle new member invitation by email
                const email = memberId.replace('new:', '')

                await projectApi.inviteMember(projectIdToUse, {
                  email,
                  role: role as 'admin' | 'editor' | 'viewer',
                })

                toast.showSuccess(`User ${email} added to project successfully`)
              } else {
                // Handle existing organization member by user ID
                const orgMember = organizationMembers.find((m) => m.id === memberId)
                if (orgMember && orgMember.user_id) {
                  await projectApi.inviteMember(projectIdToUse, {
                    email: orgMember.user_email || '',
                    role: role as 'admin' | 'editor' | 'viewer',
                  })
                  toast.showSuccess('Member added to project successfully')
                }
              }

              // Refresh project members
              queryClient.invalidateQueries({
                queryKey: ['project', currentProject?.id || projectId, 'members'],
              })
            } catch (error) {
              console.error('Failed to add member:', error)
              toast.showError('Failed to add member')
            }
          }}
          organizationMembers={organizationMembers.map((member) => ({
            id: member.id,
            name: member.user_name || 'Unknown User', // Provide fallback
            email: member.user_email || '',
          }))}
          existingMembers={allTeamMembers.map((m) => m.user_email)} // Existing project members by user_id
        />
      )}

      {showApiKeyModal && (
        <ApiKeyModal
          isOpen={showApiKeyModal}
          onClose={() => setShowApiKeyModal(false)}
          onGenerate={(name, _permissions) => {
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
            toast.showSuccess('API key generated successfully')
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

      <ConfirmationModal
        isOpen={showRegenerateConfirm}
        onClose={() => setShowRegenerateConfirm(false)}
        onConfirm={handleConfirmRegenerate}
        title="Regenerate API Key"
        description="Are you sure you want to regenerate this API key? The old key will stop working immediately."
        confirmText="Regenerate"
        cancelText="Cancel"
        variant="default"
        icon={<RefreshCw className="h-5 w-5" />}
      />

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
