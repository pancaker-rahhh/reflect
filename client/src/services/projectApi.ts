import { request } from './apiClient'
import type { Project } from '@/types'

interface PaginatedProjects {
  items: Project[]
  total: number
  page: number
  size: number
}

export const projectApi = {
  getByWorkspace(workspaceId: string): Promise<PaginatedProjects> {
    return request<PaginatedProjects>(`/projects?workspace_id=${workspaceId}`)
  },
}
