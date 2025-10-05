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
    queryKey: ['organization', user?.id],
    queryFn: organizationApi.getMyOrganization,
    enabled: !!user && !authLoading,
    retry: (failureCount, error) => {
      // Don't retry for expected 404/403 errors (new users without organizations)
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = String(error.message).toLowerCase()
        if (
          errorMessage.includes('404') ||
          errorMessage.includes('403') ||
          errorMessage.includes('not found')
        ) {
          return false
        }
      }
      return failureCount < 2
    },
    staleTime: 1000 * 60 * 15, // 15 minutes instead of 5
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on component mount if data exists
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
