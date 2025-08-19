import { request } from './apiClient'
import type { Project } from '@/types'

interface PaginatedProjects {
  items: Project[]
  total: number
  page: number
  size: number
}

export const projectApi = {
  getByWorkspace(organizationId: string): Promise<PaginatedProjects> {
    return request<PaginatedProjects>(`/projects?organization_id=${organizationId}`)
  },
}
