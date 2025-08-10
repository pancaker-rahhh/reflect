// Export API modules
export { userApi, type UserProfileUpdateRequest, type UserDeleteResponse } from './user'
export { workspaceApi, type WorkspaceCreateRequest, type WorkspaceUpdateRequest } from './workspace'
export { projectApi, type PaginatedProjects, type ProjectCreateRequest, type ProjectUpdateRequest } from './project'
export { widgetApi, type WidgetCreateRequest, type WidgetUpdateRequest } from './widget'

// Re-export client and error handling for advanced usage
export { apiClient } from '../client'
export { ApiException, errorSanitizer, type ApiError } from '../errors'

// Import APIs for convenience exports
import { userApi } from './user'
import { workspaceApi } from './workspace'
import { projectApi } from './project'
import { widgetApi } from './widget'
import type { UserProfileUpdateRequest } from './user'
import type { WorkspaceCreateRequest } from './workspace'
import type { ProjectCreateRequest } from './project'
import type { WidgetCreateRequest } from './widget'

// Convenience API object for backward compatibility
export const api = {
  // User APIs
  getCurrentUser: () => userApi.getCurrentUser(),
  syncUser: () => userApi.syncUser(),
  updateUserProfile: (data: UserProfileUpdateRequest) => userApi.updateProfile(data),
  deleteAccount: () => userApi.deleteAccount(),
  
  // Workspace APIs  
  getWorkspaces: () => workspaceApi.getWorkspaces(),
  getWorkspace: (id: string) => workspaceApi.getWorkspace(id),
  getMyWorkspace: () => workspaceApi.getMyWorkspace(),
  createWorkspace: (data: WorkspaceCreateRequest) => workspaceApi.createWorkspace(data),
  updateWorkspace: (id: string, data: any) => workspaceApi.updateWorkspace(id, data),
  deleteWorkspace: (id: string) => workspaceApi.deleteWorkspace(id),

  // Project APIs
  getProjectsByWorkspace: (workspaceId: string) => projectApi.getByWorkspace(workspaceId),
  getProject: (id: string) => projectApi.getProject(id),
  createProject: (data: ProjectCreateRequest) => projectApi.createProject(data),
  updateProject: (id: string, data: any) => projectApi.updateProject(id, data),
  deleteProject: (id: string) => projectApi.deleteProject(id),

  // Widget APIs
  getWidgetsByProject: (projectId: string) => widgetApi.getByProject(projectId),
  getWidget: (id: string) => widgetApi.getWidget(id),
  createWidget: (data: WidgetCreateRequest) => widgetApi.createWidget(data),
  updateWidget: (id: string, data: any) => widgetApi.updateWidget(id, data),
  deleteWidget: (id: string) => widgetApi.deleteWidget(id),
  activateWidget: (id: string) => widgetApi.activate(id),
  deactivateWidget: (id: string) => widgetApi.deactivate(id),
}