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

export interface PaymentItem {
  brand_id?: string | null
  created_at?: string | null
  currency?: string | null
  customer?: {
    customer_id?: string | null
    email?: string | null
    name?: string | null
  } | null
  digital_products_delivered?: boolean | null
  metadata?: Record<string, unknown>
  payment_id?: string | null
  payment_method?: string | null
  payment_method_type?: string | null
  status?: string | null
  subscription_id?: string | null
  total_amount?: number | null
}

export interface PaymentsListResponse {
  items: PaymentItem[]
  page_number: number
  page_size: number
}

export interface ListPaymentsQuery {
  created_at_gte?: string
  created_at_lte?: string
  page_size?: number
  page_number?: number
  subscription_id?: string
  customer_id?: string
  status?:
    | 'succeeded'
    | 'failed'
    | 'cancelled'
    | 'processing'
    | 'requires_customer_action'
    | 'requires_merchant_action'
    | 'requires_payment_method'
    | 'requires_confirmation'
    | 'requires_capture'
    | 'partially_captured'
    | 'partially_captured_and_capturable'
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
  ): Promise<{
    success: boolean
    message: string
    organization_id: string
    subscription_ends_at?: string | null
  }> => apiClient.post(`/organizations/${organizationId}/payment/cancel-subscription`),

  undoCancelSubscription: (
    organizationId: string
  ): Promise<{ success: boolean; message: string; organization_id: string }> =>
    apiClient.post(`/organizations/${organizationId}/payment/cancel-subscription/undo`),

  changePlan: (
    organizationId: string,
    newPlanId: string,
    quantity = 1
  ): Promise<{ success: boolean; message: string; organization_id: string; new_plan_id: string }> =>
    apiClient.post(`/organizations/${organizationId}/payment/change-plan`, {
      new_plan_id: newPlanId,
      quantity,
    }),

  getPaymentPlans: (organizationId: string): Promise<PaymentPlansResponse> =>
    apiClient.get(`/organizations/${organizationId}/payment/plans`),

  listPayments: (
    organizationId: string,
    params?: ListPaymentsQuery
  ): Promise<PaymentsListResponse> => {
    const query = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.append(key, String(value))
        }
      })
    }
    const qs = query.toString()
    const path = `/organizations/${organizationId}/payment/payments${qs ? `?${qs}` : ''}`
    return apiClient.get(path)
  },
}
