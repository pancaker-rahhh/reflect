import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronDown, Building2, FolderOpen, Plus, Search, Clock, Info } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import { projectApi } from '@/lib/api'
import { Alert, AlertDescription } from '../ui/alert'
import { useToastNotifications } from '@/hooks/useToastNotifications'
import type { Project, Organization } from '@/types'

interface OrgProjectDropdownProps {
  onOrgChange?: (org: Organization) => void
  onProjectChange?: (project: Project) => void
}

export const OrgProjectDropdown: React.FC<OrgProjectDropdownProps> = ({
  onOrgChange,
  onProjectChange,
}) => {
  const {
    organization: currentOrganization,
    currentProject,
    projects,
    setCurrentProject,
    refreshProjects,
    isLoading: loading,
  } = useAppContext()
  const toast = useToastNotifications()

  // For now, we'll work with single organization from AppContext
  const organizations = currentOrganization ? [currentOrganization] : []
  const setCurrentOrganization = () => {} // No-op since AppContext manages single org

  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [recentProjects, setRecentProjects] = useState<string[]>([])
  const [showOrgLimitMessage, setShowOrgLimitMessage] = useState(false)
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadRecentProjects = () => {
    const stored = localStorage.getItem('recentProjects')
    if (stored) {
      setRecentProjects(JSON.parse(stored))
    }
  }

  const addToRecentProjects = useCallback(
    (projectId: string) => {
      const updated = [projectId, ...recentProjects.filter((id) => id !== projectId)].slice(0, 5)
      setRecentProjects(updated)
      localStorage.setItem('recentProjects', JSON.stringify(updated))
    },
    [recentProjects]
  )

  useEffect(() => {
    loadRecentProjects()
  }, [])

  useEffect(() => {
    if (currentProject) {
      addToRecentProjects(currentProject.id)
    }
  }, [currentProject, addToRecentProjects])

  const handleOrgSelect = (org: Organization) => {
    setCurrentOrganization()
    onOrgChange?.(org)
  }

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project)
    addToRecentProjects(project.id)
    onProjectChange?.(project)
    setIsOpen(false)
  }

  const handleCreateOrganization = () => {
    setShowOrgLimitMessage(true)
    setTimeout(() => setShowOrgLimitMessage(false), 4000) // Hide after 4 seconds
  }

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !currentOrganization) return

    try {
      const newProject = await projectApi.createProject({
        name: newProjectName.trim(),
        organization_id: currentOrganization.id,
      })

      setCurrentProject(newProject)
      addToRecentProjects(newProject.id)
      setNewProjectName('')
      setIsCreatingProject(false)
      setIsOpen(false)

      // Refresh projects list to show the new project
      refreshProjects()

      if (onProjectChange) {
        onProjectChange(newProject)
      }
    } catch (error: any) {
      console.error('Failed to create project:', error)

      // Check if it's a subscription limit error
      if (
        error?.response?.status === 403 &&
        error?.response?.data?.error === 'Project limit exceeded'
      ) {
        const errorData = error.response.data
        toast.showError(
          `Project limit exceeded! You have ${errorData.current_usage} projects (limit: ${errorData.limit}). ${errorData.message}`
        )
      } else {
        // Generic error message
        const message =
          error?.response?.data?.detail || error?.message || 'Failed to create project'
        toast.showError(`Error: ${message}`)
      }
    }
  }

  const handleStartCreatingProject = () => {
    setIsCreatingProject(true)
    setSearchQuery('')
  }

  const handleCancelCreateProject = () => {
    setIsCreatingProject(false)
    setNewProjectName('')
  }

  const filteredOrgs = organizations.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const recentProjectObjects = recentProjects
    .map((id) => projects.find((p) => p.id === id))
    .filter(Boolean) as Project[]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-tertiary border border-border rounded-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <div className="flex items-center gap-2">
          {currentOrganization && (
            <>
              <Building2 className="w-4 h-4 text-gray-500" />
              <span>{currentOrganization.name}</span>
            </>
          )}
          {currentProject && (
            <>
              <span className="text-gray-400">/</span>
              <FolderOpen className="w-4 h-4 text-gray-500" />
              <span>{currentProject.name}</span>
            </>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-80 mt-2 bg-tertiary border border-border rounded-lg shadow-lg">
          {showOrgLimitMessage && (
            <div className="p-3 border-b border-border">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  We have limited users to only one organization as we are in beta. Thank you for
                  your understanding!
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div className="p-3 border-b border-gray-200">
            {isCreatingProject ? (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Enter project name..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateProject()
                    } else if (e.key === 'Escape') {
                      handleCancelCreateProject()
                    }
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateProject}
                    disabled={!newProjectName.trim()}
                    className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create
                  </button>
                  <button
                    onClick={handleCancelCreateProject}
                    className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search organizations and projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : (
              <>
                {recentProjectObjects.length > 0 && searchQuery === '' && (
                  <div className="p-2">
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                      Recent Projects
                    </div>
                    {recentProjectObjects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => handleProjectSelect(project)}
                        className="w-full flex items-center gap-2 px-2 py-2 text-sm text-left hover:bg-gray-100 rounded"
                      >
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{project.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="p-2 border-t border-gray-200">
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                    Organizations
                  </div>
                  {filteredOrgs.map((org) => (
                    <div key={org.id}>
                      <button
                        onClick={() => handleOrgSelect(org)}
                        className={`w-full flex items-center justify-between px-2 py-2 text-sm text-left hover:bg-gray-100 rounded ${
                          currentOrganization?.id === org.id ? 'bg-indigo-50 text-indigo-600' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <span>{org.name}</span>
                        </div>
                        {currentOrganization?.id === org.id && <ChevronDown className="w-4 h-4" />}
                      </button>

                      {currentOrganization?.id === org.id && (
                        <div className="ml-4 mt-1">
                          {filteredProjects.map((project) => (
                            <button
                              key={project.id}
                              onClick={() => handleProjectSelect(project)}
                              className={`w-full flex items-center gap-2 px-2 py-2 text-sm text-left hover:bg-gray-100 rounded ${
                                currentProject?.id === project.id
                                  ? 'bg-indigo-50 text-indigo-600'
                                  : ''
                              }`}
                            >
                              <FolderOpen className="w-4 h-4" />
                              <span>{project.name}</span>
                            </button>
                          ))}

                          {!isCreatingProject && (
                            <button
                              onClick={handleStartCreatingProject}
                              className="w-full flex items-center gap-2 px-2 py-2 mt-1 text-sm text-left text-indigo-600 hover:bg-indigo-50 rounded"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Create New Project</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={handleCreateOrganization}
                    className="w-full flex items-center gap-2 px-2 py-2 mt-2 text-sm text-left text-indigo-600 hover:bg-indigo-50 rounded"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Organization</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
