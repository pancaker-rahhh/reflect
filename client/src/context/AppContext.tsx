import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { workspaceApi } from '@/lib/api'
import { projectApi } from '@/services(mock)/projectApi'
import { useAuth } from '@/contexts/AuthContext'
import type { Workspace, Project } from '@/types'

interface AppContextType {
  workspace: Workspace | null
  projects: Project[]
  currentProject: Project | null
  setCurrentProject: (project: Project | null) => void
  isLoading: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const { user, loading: authLoading } = useAuth()

  const handleSetCurrentProject = useCallback((project: Project | null) => {
    setCurrentProject(project)
  }, [])

  // Only run queries when user is authenticated
  const { data: workspace, isLoading: isLoadingWorkspace } = useQuery({
    queryKey: ['workspace'],
    queryFn: workspaceApi.getMyWorkspace,
    enabled: !!user && !authLoading, // Only run when authenticated
    retry: false, // Don't retry on 401 errors
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects', workspace?.id],
    queryFn: () => projectApi.getByWorkspace(workspace!.id),
    enabled: !!workspace && !!user, // Only run when authenticated AND have workspace
    retry: false, // Don't retry on 401 errors
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const projects = useMemo(() => projectsData?.items || [], [projectsData?.items])
  const hasProjects = projects.length > 0

  // Set initial project only once when projects load
  useEffect(() => {
    if (hasProjects && currentProject === null) {
      setCurrentProject(projects[0])
    }
  }, [hasProjects]) // Only run when hasProjects changes from false to true

  const value = useMemo(
    () => ({
      workspace: workspace || null,
      projects,
      currentProject,
      setCurrentProject: handleSetCurrentProject,
      isLoading: isLoadingWorkspace || isLoadingProjects,
    }),
    [workspace, projects, currentProject, handleSetCurrentProject, isLoadingWorkspace, isLoadingProjects]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}
