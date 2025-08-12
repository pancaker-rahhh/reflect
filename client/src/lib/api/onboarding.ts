import { apiClient } from '../client'

export interface OnboardingCompleteRequest {
  feedback?: string | null
  skipped_steps?: string[]
}

export interface OnboardingUpdateRequest {
  has_created_project?: boolean
  current_step?: string
  steps_completed?: Record<string, boolean>
}

export interface FirstTimeCheckResponse {
  is_first_time: boolean
}

export interface AutoCreateOrganizationResponse {
  id: string
  name: string
  slug: string
}

export const onboardingApi = {
  /**
   * Check if user is first-time user
   */
  checkFirstTime: (): Promise<FirstTimeCheckResponse> =>
    apiClient.get<FirstTimeCheckResponse>('/onboarding/check-first-time'),

  /**
   * Complete onboarding process
   */
  complete: (data: OnboardingCompleteRequest): Promise<void> =>
    apiClient.post<void>('/onboarding/complete', data),

  /**
   * Skip onboarding process
   */
  skip: (): Promise<void> =>
    apiClient.post<void>('/onboarding/skip'),

  /**
   * Update onboarding progress
   */
  update: (data: OnboardingUpdateRequest): Promise<void> =>
    apiClient.put<void>('/onboarding/update', data),

  /**
   * Auto-create organization for solo users
   */
  autoCreateOrganization: (): Promise<AutoCreateOrganizationResponse> =>
    apiClient.post<AutoCreateOrganizationResponse>('/onboarding/auto-create-organization'),
}