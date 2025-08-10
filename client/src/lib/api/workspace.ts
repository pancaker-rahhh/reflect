import { apiClient } from '../client'
import type { Workspace, User } from '@/types'

export interface WorkspaceCreateRequest {
  name: string
  description?: string
}

export interface WorkspaceUpdateRequest {
  name?: string
  description?: string
  settings?: Record<string, any>
}

export const workspaceApi = {
  getWorkspaces(): Promise<Workspace[]> {
    return apiClient.get<Workspace[]>('/workspaces')
  },

  getWorkspace(id: string): Promise<Workspace> {
    return apiClient.get<Workspace>(`/workspaces/${id}`)
  },

  getMyWorkspace(): Promise<Workspace> {
    return apiClient.get<Workspace>('/workspaces/me')
  },

  createWorkspace(data: WorkspaceCreateRequest): Promise<Workspace> {
    return apiClient.post<Workspace>('/workspaces', data)
  },

  updateWorkspace(id: string, data: WorkspaceUpdateRequest): Promise<Workspace> {
    return apiClient.put<Workspace>(`/workspaces/${id}`, data)
  },

  deleteWorkspace(id: string): Promise<void> {
    return apiClient.delete<void>(`/workspaces/${id}`)
  },

  switchWorkspace(workspaceId: string): Promise<User> {
    return apiClient.put<User>('/users/current-workspace', { workspace_id: workspaceId })
  }
}