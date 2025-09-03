// Export API modules
export { userApi, type UserProfileUpdateRequest, type UserDeleteResponse } from './user'
export {
  projectApi,
  type PaginatedProjects,
  type ProjectCreateRequest,
  type ProjectUpdateRequest,
} from './project'
export { widgetApi, type WidgetCreateRequest, type WidgetUpdateRequest } from './widget'
export {
  onboardingApi,
  type OnboardingCompleteRequest,
  type OnboardingUpdateRequest,
  type FirstTimeCheckResponse,
} from './onboarding'
export {
  organizationApi,
  invitationApi,
  type OrganizationCreateRequest,
  type InvitationRequest,
  type BulkInvitationRequest,
} from './organization'
export {
  roadmapApi,
  type RoadmapCreateRequest,
  type RoadmapUpdateRequest,
  type RoadmapColumnCreateRequest,
  type RoadmapColumnUpdateRequest,
  type RoadmapActionItemCreateRequest,
  type RoadmapActionItemUpdateRequest,
  type RoadmapTagCreateRequest,
  type RoadmapTagUpdateRequest,
  type FeatureOrderUpdateRequest,
} from './roadmap'
export {
  feedbackApi,
  type FeedbackPayload,
  type ConversionData,
  type ConversionPreview,
} from './feedback'
export { dashboardApi } from './dashboard'
export {
  integrationsApi,
  type JiraConnectionTestRequest,
  type JiraConnectionTestResponse,
  type JiraConfig,
  type JiraConfigUpdate,
  type JiraProject,
  type JiraProjectsResponse,
  type JiraIssueType,
  type JiraIssueTypesResponse,
  type JiraPriority,
  type JiraPrioritiesResponse,
  type JiraComponent,
  type JiraComponentsResponse,
  type JiraIntegrationCreateRequest,
  type JiraIntegrationResponse,
  type BulkJiraCreateRequest,
  type BulkJiraCreateResponse,
} from './integrations'

// Re-export client and error handling for advanced usage
export { apiClient } from '../client'
export { ApiException, errorSanitizer, type ApiError } from '../errors'

// Import APIs for convenience exports
import { userApi } from './user'
import { projectApi } from './project'
import { widgetApi } from './widget'
import { roadmapApi } from './roadmap'
import { feedbackApi } from './feedback'
import { dashboardApi } from './dashboard'
import { integrationsApi } from './integrations'
import type { UserProfileUpdateRequest } from './user'
import type { ProjectCreateRequest } from './project'
import type { WidgetCreateRequest } from './widget'
import type { RoadmapCreateRequest } from './roadmap'
import type { RoadmapColumnCreateRequest } from './roadmap'

// Convenience API object for backward compatibility
export const api = {
  getCurrentUser: () => userApi.getCurrentUser(),
  syncUser: () => userApi.syncUser(),
  updateUserProfile: (data: UserProfileUpdateRequest) => userApi.updateProfile(data),
  deleteAccount: () => userApi.deleteAccount(),

  getProjectsByOrganization: (organizationId: string) =>
    projectApi.getByOrganization(organizationId),
  getProject: (id: string) => projectApi.getProject(id),
  createProject: (data: ProjectCreateRequest) => projectApi.createProject(data),
  updateProject: (id: string, data: any) => projectApi.updateProject(id, data),
  deleteProject: (id: string) => projectApi.deleteProject(id),

  getWidgetsByProject: (projectId: string) => widgetApi.getByProject(projectId),
  getWidget: (id: string) => widgetApi.getWidget(id),
  createWidget: (data: WidgetCreateRequest) => widgetApi.createWidget(data),
  updateWidget: (id: string, data: any) => widgetApi.updateWidget(id, data),
  deleteWidget: (id: string) => widgetApi.deleteWidget(id),

  getRoadmapsByProject: (projectId: string) => roadmapApi.getByProject(projectId),
  createRoadmap: (data: RoadmapCreateRequest) => roadmapApi.createRoadmap(data),
  updateRoadmap: (id: string, data: any) => roadmapApi.updateRoadmap(id, data),

  getDashboardMetrics: (timeRange?: string, projectId?: string) =>
    dashboardApi.getDashboardMetrics(timeRange, projectId),
  getRecentActivity: (projectId?: string) => dashboardApi.getRecentActivity(projectId),
  getFeedbackData: (feedbackType?: string, projectId?: string) =>
    dashboardApi.getFeedbackData(feedbackType, projectId),

  getIntegrationsByProject: (projectId: string) => integrationsApi.getIntegrations(projectId),
  createIntegration: (data: any) => integrationsApi.createJiraIntegration(data),
  updateIntegration: (id: string, data: any) => integrationsApi.updateJiraIntegration(id, data),
  deleteIntegration: (id: string) => integrationsApi.deleteJiraIntegration(id),
}
