import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronDown, FolderOpen, Plus, Search, Clock } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import { projectApi } from '@/lib/api'
import { useToastNotifications } from '@/hooks/useToastNotifications'
import type { Project } from '@/types'

interface ProjectDropdownProps {
  onProjectChange?: (project: Project) => void
}

export const ProjectDropdown: React.FC<ProjectDropdownProps> = ({ onProjectChange }) => {
  const {
    organization: currentOrganization,
    currentProject,
    projects,
    setCurrentProject,
    refreshProjects,
    isLoading: loading,
  } = useAppContext()
  const toast = useToastNotifications()

  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [recentProjects, setRecentProjects] = useState<string[]>([])
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsCreatingProject(false)
        setNewProjectName('')
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

  const addToRecentProjects = useCallback((projectId: string) => {
    setRecentProjects((prev) => {
      const updated = [projectId, ...prev.filter((id) => id !== projectId)].slice(0, 5)
      localStorage.setItem('recentProjects', JSON.stringify(updated))
      return updated
    })
  }, [])

  useEffect(() => {
    loadRecentProjects()
  }, [])

  useEffect(() => {
    if (currentProject) {
      addToRecentProjects(currentProject.id)
    }
  }, [currentProject, addToRecentProjects])

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project)
    addToRecentProjects(project.id)
    onProjectChange?.(project)
    setIsOpen(false)
  }

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !currentOrganization) return

    if (newProjectName.trim().length < 3) {
      toast.showError('Project name must be at least 3 characters long')
      return
    }

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
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-muted-foreground" />
          <span>{currentProject?.name || 'Select Project'}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-80 mt-2 bg-popover border border-border rounded-lg shadow-lg">
          <div className="p-3 border-b border-border">
            {isCreatingProject ? (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Enter project name (min. 3 characters)"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-foreground bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateProject()
                    } else if (e.key === 'Escape') {
                      handleCancelCreateProject()
                    }
                  }}
                />
                {newProjectName.trim().length > 0 && newProjectName.trim().length < 3 && (
                  <p className="text-xs text-destructive">
                    Project name must be at least 3 characters long
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateProject}
                    disabled={!newProjectName.trim() || newProjectName.trim().length < 3}
                    className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create
                  </button>
                  <button
                    onClick={handleCancelCreateProject}
                    className="px-3 py-1 text-xs bg-muted text-muted-foreground rounded-md hover:bg-muted/80"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm text-foreground bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">Loading...</div>
            ) : (
              <>
                {recentProjectObjects.length > 0 && searchQuery === '' && !isCreatingProject && (
                  <div className="p-2">
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                      Recent Projects
                    </div>
                    {recentProjectObjects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => handleProjectSelect(project)}
                        className="w-full flex items-center gap-2 px-2 py-2 text-sm text-left hover:bg-muted rounded"
                      >
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{project.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="p-2 border-t border-border">
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                    All Projects
                  </div>
                  {filteredProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleProjectSelect(project)}
                      className={`w-full flex items-center gap-2 px-2 py-2 text-sm text-left hover:bg-muted rounded ${
                        currentProject?.id === project.id ? 'bg-primary/10 text-primary' : ''
                      }`}
                    >
                      <FolderOpen className="w-4 h-4" />
                      <span>{project.name}</span>
                    </button>
                  ))}

                  {!isCreatingProject && currentOrganization && (
                    <button
                      onClick={handleStartCreatingProject}
                      className="w-full flex items-center gap-2 px-2 py-2 mt-2 text-sm text-left text-primary hover:bg-primary/10 rounded"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create New Project</span>
                    </button>
                  )}

                  {!currentOrganization && (
                    <div className="px-2 py-2 text-sm text-muted-foreground">
                      No organization selected
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
