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
import type { UserProfileUpdateRequest } from './user'
import type { ProjectCreateRequest } from './project'
import type { WidgetCreateRequest } from './widget'
import type { RoadmapCreateRequest } from './roadmap'
import type { RoadmapColumnCreateRequest } from './roadmap'

// Convenience API object for backward compatibility
export const api = {
  // User APIs
  getCurrentUser: () => userApi.getCurrentUser(),
  syncUser: () => userApi.syncUser(),
  updateUserProfile: (data: UserProfileUpdateRequest) => userApi.updateProfile(data),
  deleteAccount: () => userApi.deleteAccount(),

  // Project APIs
  getProjectsByOrganization: (organizationId: string) =>
    projectApi.getByOrganization(organizationId),
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

  // Roadmap APIs
  getRoadmap: (projectId: string) => roadmapApi.getByProject(projectId),
  createRoadmap: (data: RoadmapCreateRequest) => roadmapApi.createRoadmap(data),
  updateRoadmap: (roadmapId: string, data: any) => roadmapApi.updateRoadmap(roadmapId, data),
  getPublicRoadmap: (publicSlug: string) => roadmapApi.getPublicRoadmap(publicSlug),
  getPublicRoadmapBySubdomain: (subdomain: string) =>
    roadmapApi.getPublicRoadmapBySubdomain(subdomain),

  // Column APIs
  createRoadmapColumn: (data: RoadmapColumnCreateRequest) => roadmapApi.createColumn(data),
  updateRoadmapColumn: (columnId: string, data: any) => roadmapApi.updateColumn(columnId, data),
  deleteRoadmapColumn: (columnId: string) => roadmapApi.deleteColumn(columnId),

  // Feature APIs
  createRoadmapActionItem: (data: any) => roadmapApi.createFeature(data),
  updateRoadmapActionItem: (featureId: string, data: any) =>
    roadmapApi.updateFeature(featureId, data),
  deleteRoadmapActionItem: (featureId: string) => roadmapApi.deleteFeature(featureId),
  updateFeaturesOrder: (updates: any[]) => roadmapApi.updateFeaturesOrder(updates),
  upvoteFeature: (featureId: string) => roadmapApi.upvoteFeature(featureId),

  // Tag APIs
  createRoadmapTag: (data: any) => roadmapApi.createTag(data),
  getRoadmapTags: (roadmapId: string) => roadmapApi.getRoadmapTags(roadmapId),
  getPublicRoadmapTags: (roadmapId: string) => roadmapApi.getPublicRoadmapTags(roadmapId),
  updateRoadmapTag: (tagId: string, data: any) => roadmapApi.updateTag(tagId, data),
  deleteRoadmapTag: (tagId: string) => roadmapApi.deleteTag(tagId),

  // Feedback APIs
  getActionableFeedback: () => feedbackApi.getActionableFeedback(),
  getConversionPreview: (feedbackId: string) => feedbackApi.getConversionPreview(feedbackId),
  convertToRoadmap: (feedbackId: string, conversionData: any) =>
    feedbackApi.convertToRoadmap(feedbackId, conversionData),

  // Dashboard APIs
  getDashboardMetrics: (timeRange?: string) => dashboardApi.getDashboardMetrics(timeRange),
  getRecentActivity: (projectId?: string) => dashboardApi.getRecentActivity(projectId),
  getFeedbackData: (projectId?: string, timeRange?: string) =>
    dashboardApi.getFeedbackData(projectId, timeRange),
}
