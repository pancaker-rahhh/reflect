import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { organizationApi } from '@/lib/api/organization'
import { projectApi } from '@/lib/api/project'
import { useAuth } from '@/contexts/AuthContext'
import type { Organization, Project } from '@/types'

interface AppContextType {
  currentOrganization: Organization | null
  organization: Organization | null // Backward compatibility
  projects: Project[]
  currentProject: Project | null
  setCurrentProject: (project: Project | null) => void
  refreshProjects: () => void
  isLoading: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const { user, loading: authLoading } = useAuth()
  const queryClient = useQueryClient()

  const handleSetCurrentProject = useCallback((project: Project | null) => {
    setCurrentProject(project)
  }, [])

  const { data: currentOrganization, isLoading: isLoadingOrganization } = useQuery({
    queryKey: ['organization'],
    queryFn: organizationApi.getMyOrganization,
    enabled: !!user && !authLoading,
    retry: false,
    staleTime: 1000 * 60 * 5,
  })

  const organization = currentOrganization

  const refreshProjects = useCallback(() => {
    if (currentOrganization?.id) {
      queryClient.invalidateQueries({ queryKey: ['projects', currentOrganization.id] })
    }
  }, [currentOrganization?.id, queryClient])

  // Fetch projects for the organization
  const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects', currentOrganization?.id],
    queryFn: () => projectApi.getByOrganization(currentOrganization!.id),
    enabled: !!currentOrganization && !!user,
    retry: false,
    staleTime: 1000 * 60 * 5,
  })

  const projects = useMemo(() => projectsData?.items || [], [projectsData?.items])
  const hasProjects = projects.length > 0

  useEffect(() => {
    if (hasProjects && !currentProject) {
      const onboardingProjectId = localStorage.getItem('onboarding_project_id')
      if (onboardingProjectId) {
        const onboardingProject = projects.find((p) => p.id === onboardingProjectId)
        if (onboardingProject) {
          setCurrentProject(onboardingProject)
          localStorage.removeItem('onboarding_project_id')
          return
        }
      }
      setCurrentProject(projects[0])
    }
  }, [hasProjects, projects, currentProject])

  useEffect(() => {
    setCurrentProject(null)
  }, [currentOrganization?.id])

  const value = useMemo(
    () => ({
      currentOrganization: currentOrganization || null,
      organization: organization || null,
      projects,
      currentProject,
      setCurrentProject: handleSetCurrentProject,
      refreshProjects,
      isLoading: isLoadingOrganization || isLoadingProjects,
    }),
    [
      currentOrganization,
      organization,
      projects,
      currentProject,
      handleSetCurrentProject,
      isLoadingOrganization,
      isLoadingProjects,
    ]
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
