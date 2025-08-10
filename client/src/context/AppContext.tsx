import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { workspaceApi } from '@/services/workspaceApi'
import { projectApi } from '@/services/projectApi'
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

  const handleSetCurrentProject = useCallback((project: Project | null) => {
    setCurrentProject(project)
  }, [])

  const { data: workspace, isLoading: isLoadingWorkspace } = useQuery({
    queryKey: ['workspace'],
    queryFn: workspaceApi.getMyWorkspace,
  })

  const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects', workspace?.id],
    queryFn: () => projectApi.getByWorkspace(workspace!.id),
    enabled: !!workspace,
  })

  const projects = projectsData?.items || []

  useEffect(() => {
    if (!currentProject && projects.length > 0) {
      setCurrentProject(projects[0])
    }
  }, [projects, currentProject])

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
