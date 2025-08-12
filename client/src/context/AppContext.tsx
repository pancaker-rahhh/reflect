import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/client'
import { projectApi } from '@/services(mock)/projectApi'
import { useAuth } from '@/contexts/AuthContext'
import type { Project } from '@/types'

interface Organization {
  id: string
  name: string
  slug: string
  description?: string
  created_at: string
  settings: Record<string, any>
}

interface AppContextType {
  organization: Organization | null
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

  // Fetch user's organization
  const { data: organizations, isLoading: isLoadingOrganization } = useQuery({
    queryKey: ['organizations', 'my'],
    queryFn: () => apiClient.get<Organization[]>('/organizations/my'),
    enabled: !!user && !authLoading,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const organization = useMemo(() => organizations?.[0] || null, [organizations])

  // Fetch projects for the organization
  const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects', organization?.id],
    queryFn: () => projectApi.getByWorkspace(organization!.id), // TODO: Update to use organization
    enabled: !!organization && !!user,
    retry: false,
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
      organization: organization || null,
      projects,
      currentProject,
      setCurrentProject: handleSetCurrentProject,
      isLoading: isLoadingOrganization || isLoadingProjects,
    }),
    [organization, projects, currentProject, handleSetCurrentProject, isLoadingOrganization, isLoadingProjects]
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
