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
  organization_id: string
}

export interface ProjectUpdateRequest {
  name?: string
  description?: string
}

export interface ProjectMember {
  id: string
  user_id: string
  project_id: string
  role: 'admin' | 'editor' | 'viewer'
  user_name?: string
  user_email?: string
  created_at: string
  updated_at: string
}

export interface ProjectMemberInviteRequest {
  email: string
  role: 'admin' | 'editor' | 'viewer'
}

export interface ProjectMemberUpdateRequest {
  role: 'admin' | 'editor' | 'viewer'
}

export const projectApi = {
  getByOrganization(organizationId: string): Promise<PaginatedProjects> {
    return apiClient.get<PaginatedProjects>(`/projects?organization_id=${organizationId}`)
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
  },

  // Project members
  getMembers(projectId: string): Promise<ProjectMember[]> {
    return apiClient.get<ProjectMember[]>(`/projects/${projectId}/members`)
  },

  inviteMember(projectId: string, data: ProjectMemberInviteRequest): Promise<ProjectMember> {
    return apiClient.post<ProjectMember>(`/projects/${projectId}/members`, data)
  },

  updateMember(
    projectId: string,
    userId: string,
    data: ProjectMemberUpdateRequest
  ): Promise<ProjectMember> {
    return apiClient.put<ProjectMember>(`/projects/${projectId}/members/${userId}`, data)
  },

  removeMember(projectId: string, userId: string): Promise<void> {
    return apiClient.delete<void>(`/projects/${projectId}/members/${userId}`)
  },
}
