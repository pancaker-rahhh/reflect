import { apiClient } from '../client'

export interface SubscriptionPlan {
  plan: 'free' | 'pro'
  status: string
  organization_id: string
}

export interface SubscriptionLimits {
  projects: number
  widgets: number
  responses: number
}

export interface SubscriptionFeatures {
  advanced_targeting: boolean
  branding_removal: boolean
  priority_support: boolean
  dofollow_backlink: boolean
  jira_integration: boolean
}

export interface FeatureCheck {
  feature: string
  enabled: boolean
  organization_id: string
}

export interface PlanUpdateResponse {
  success: boolean
  plan: string
  organization_id: string
}

export interface SubscriptionCancelResponse {
  success: boolean
  plan: string
  status: string
  organization_id: string
}

export const subscriptionApi = {
  getPlan: (organizationId: string): Promise<SubscriptionPlan> =>
    apiClient.get(`/organizations/${organizationId}/subscription/plan`),

  getLimits: (organizationId: string): Promise<SubscriptionLimits> =>
    apiClient.get(`/organizations/${organizationId}/subscription/limits`),

  getFeatures: (organizationId: string): Promise<SubscriptionFeatures> =>
    apiClient.get(`/organizations/${organizationId}/subscription/features`),

  checkFeature: (organizationId: string, featureName: string): Promise<FeatureCheck> =>
    apiClient.get(`/organizations/${organizationId}/subscription/feature/${featureName}`),

  updatePlan: (organizationId: string, plan: string): Promise<PlanUpdateResponse> =>
    apiClient.post(`/organizations/${organizationId}/subscription/update-plan`, { plan }),

  cancelSubscription: (organizationId: string): Promise<SubscriptionCancelResponse> =>
    apiClient.post(`/organizations/${organizationId}/subscription/cancel`),
}
