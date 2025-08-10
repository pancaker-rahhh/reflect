import { apiClient } from '../client'
import type { Project } from '@/types'

export interface PaginatedProjects {
  items: Project[]
  total: number
  page: number
  size: number
}

export interface ProjectCreateRequest {
  name: string
  description?: string
  workspace_id: string
}

export interface ProjectUpdateRequest {
  name?: string
  description?: string
}

export const projectApi = {
  getByWorkspace(workspaceId: string): Promise<PaginatedProjects> {
    return apiClient.get<PaginatedProjects>(`/projects?workspace_id=${workspaceId}`)
  },

  getProject(id: string): Promise<Project> {
    return apiClient.get<Project>(`/projects/${id}`)
  },

  createProject(data: ProjectCreateRequest): Promise<Project> {
    return apiClient.post<Project>('/projects', data)
  },

  updateProject(id: string, data: ProjectUpdateRequest): Promise<Project> {
    return apiClient.put<Project>(`/projects/${id}`, data)
  },

  deleteProject(id: string): Promise<void> {
    return apiClient.delete<void>(`/projects/${id}`)
  }
}