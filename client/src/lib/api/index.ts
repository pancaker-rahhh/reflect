// Export API modules
export { userApi, type UserProfileUpdateRequest, type UserDeleteResponse } from './user'
export { projectApi, type PaginatedProjects, type ProjectCreateRequest, type ProjectUpdateRequest } from './project'
export { widgetApi, type WidgetCreateRequest, type WidgetUpdateRequest } from './widget'
export { onboardingApi, type OnboardingCompleteRequest, type OnboardingUpdateRequest, type FirstTimeCheckResponse } from './onboarding'
export { organizationApi, invitationApi, type Organization, type OrganizationCreateRequest, type InvitationRequest, type BulkInvitationRequest } from './organization'

// Re-export client and error handling for advanced usage
export { apiClient } from '../client'
export { ApiException, errorSanitizer, type ApiError } from '../errors'

// Import APIs for convenience exports
import { userApi } from './user'
import { projectApi } from './project'
import { widgetApi } from './widget'
import type { UserProfileUpdateRequest } from './user'
import type { ProjectCreateRequest } from './project'
import type { WidgetCreateRequest } from './widget'

// Convenience API object for backward compatibility
export const api = {
  // User APIs
  getCurrentUser: () => userApi.getCurrentUser(),
  syncUser: () => userApi.syncUser(),
  updateUserProfile: (data: UserProfileUpdateRequest) => userApi.updateProfile(data),
  deleteAccount: () => userApi.deleteAccount(),
  
  // Project APIs
  getProjectsByOrganization: (organizationId: string) => projectApi.getByOrganization(organizationId),
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