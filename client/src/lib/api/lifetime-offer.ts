import { apiClient } from '../client'

export interface LifetimeOfferEligibility {
  eligible: boolean
  reason: 'eligible' | 'already_paid' | 'sold_out' | 'expired' | 'organization_not_found'
  spots_remaining: number
  expires_at: string
}

export const lifetimeOfferApi = {
  checkEligibility: async (organizationId: string): Promise<LifetimeOfferEligibility> => {
    return apiClient.get(`/organizations/${organizationId}/lifetime-offer/eligibility`)
  },

  dismiss: async (organizationId: string): Promise<void> => {
    return apiClient.post(`/organizations/${organizationId}/lifetime-offer/dismiss`, {})
  },
}

