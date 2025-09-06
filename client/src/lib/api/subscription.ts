import { apiClient } from '../client'

export interface SubscriptionLimits {
  projects: number
  widgets: number
  responses: number
  bug_reports: number
  feature_requests: number
}

export interface SubscriptionFeatures {
  advanced_targeting: boolean
  branding_removal: boolean
  priority_support: boolean
  dofollow_backlink: boolean
}

export interface SubscriptionInfo {
  plan: 'free' | 'pro'
  status: string
  limits: SubscriptionLimits
  features: SubscriptionFeatures
  usage: Record<string, number>
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

export const subscriptionApi = {
  getLimits: (organizationId: string): Promise<SubscriptionLimits> =>
    apiClient.get(`/organizations/${organizationId}/subscription/limits`),

  getFeatures: (organizationId: string): Promise<SubscriptionFeatures> =>
    apiClient.get(`/organizations/${organizationId}/subscription/features`),

  getUsage: (organizationId: string): Promise<Record<string, number>> =>
    apiClient.get(`/organizations/${organizationId}/subscription/usage`),

  getInfo: (organizationId: string): Promise<SubscriptionInfo> =>
    apiClient.get(`/organizations/${organizationId}/subscription/info`),

  checkUsage: (organizationId: string, resourceType: string): Promise<UsageCheck> =>
    apiClient.get(`/organizations/${organizationId}/subscription/check/${resourceType}`),

  checkFeature: (organizationId: string, featureName: string): Promise<FeatureCheck> =>
    apiClient.get(`/organizations/${organizationId}/subscription/feature/${featureName}`),
}
