import { apiClient } from '../client'

export interface PaymentLinkRequest {
  plan_id: string
  email: string
  firstName: string
  lastName: string
  country: string
}

export interface PaymentLinkResponse {
  payment_link: string
  subscription_id: string
  payment_id: string
  plan_id: string
  organization_id: string
  amount: number
  currency: string
}

export interface PaymentStatus {
  payment_id: string
  organization_id: string
  subscription_plan: string
  subscription_status: string
  payment_status: string | null
  last_payment_date: string | null
  dodo_subscription_id: string | null
}

export interface PaymentPlan {
  id: string
  name: string
  display_name: string
  dodo_product_id: string | null
  price: number
  currency: string
  interval: string | null
  interval_count: number | null
  trial_days: number
  limits: {
    projects: number
    widgets: number
    responses: number
  }
  features: {
    advanced_targeting: boolean
    branding_removal: boolean
    priority_support: boolean
    dofollow_backlink: boolean
    jira_integration: boolean
  }
  description: string
  is_active: boolean
}

export interface PaymentPlansResponse {
  plans: PaymentPlan[]
  total: number
}

export const paymentApi = {
  createPaymentLink: (
    organizationId: string,
    request: PaymentLinkRequest
  ): Promise<PaymentLinkResponse> =>
    apiClient.post(`/organizations/${organizationId}/payment/create-link`, request),

  getPaymentStatus: (organizationId: string, paymentId: string): Promise<PaymentStatus> =>
    apiClient.get(`/organizations/${organizationId}/payment/status/${paymentId}`),

  cancelSubscription: (
    organizationId: string
  ): Promise<{ success: boolean; message: string; organization_id: string }> =>
    apiClient.post(`/organizations/${organizationId}/payment/cancel-subscription`),

  getPaymentPlans: (organizationId: string): Promise<PaymentPlansResponse> =>
    apiClient.get(`/organizations/${organizationId}/payment/plans`),
}
