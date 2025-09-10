import { apiClient } from '../client'

export interface UsageLimits {
  projects: number
  widgets: number
  responses: number
}

export interface UsageFeatures {
  advanced_targeting: boolean
  branding_removal: boolean
  priority_support: boolean
  dofollow_backlink: boolean
  jira_integration: boolean
}

export interface UsageCheck {
  can_create: boolean
  current_usage: number
  limit: number
  resource_type: string
}

export interface FeatureCheck {
  feature: string
  enabled: boolean
  organization_id: string
}

export const usageTrackingApi = {
  getLimits: (organizationId: string): Promise<UsageLimits> =>
    apiClient.get(`/organizations/${organizationId}/usage/limits`),

  getFeatures: (organizationId: string): Promise<UsageFeatures> =>
    apiClient.get(`/organizations/${organizationId}/usage/features`),

  getUsage: (organizationId: string): Promise<Record<string, number>> =>
    apiClient.get(`/organizations/${organizationId}/usage/current`),

  checkUsage: (organizationId: string, resourceType: string): Promise<UsageCheck> =>
    apiClient.get(`/organizations/${organizationId}/usage/check/${resourceType}`),

  checkFeature: (organizationId: string, featureName: string): Promise<FeatureCheck> =>
    apiClient.get(`/organizations/${organizationId}/usage/feature/${featureName}`),
}
