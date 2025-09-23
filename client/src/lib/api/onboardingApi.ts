import { apiClient } from '../client';

export interface OnboardingStartRequest {
  user_type: 'solo' | 'team';
  referral_source?: string;
}

export interface OnboardingStartResponse {
  user_id: string;
  onboarding_id: string;
  current_step: string;
  user_type: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface OnboardingStatusResponse {
  user_id: string;
  onboarding_completed: boolean;
  user_type?: string;
  current_step?: string;
  has_created_project: boolean;
  has_created_organization: boolean;
  completion_percentage: number;
  steps_completed: Record<string, boolean>;
  created_at?: string;
  updated_at?: string;
}

export interface OnboardingUpdateRequest {
  current_step?: string;
  steps_completed?: Record<string, boolean>;
  has_created_project?: boolean;
  has_created_organization?: boolean;
  company_size?: string;
  use_case?: string;
  metadata?: Record<string, unknown>;
}

export interface OnboardingCompleteRequest {
  feedback?: string;
  skipped_steps?: string[];
}

export interface OnboardingCompleteResponse {
  success: boolean;
  message: string;
  user_id: string;
  completed_at: string;
  total_duration_minutes?: number;
}

export interface OnboardingSkipResponse {
  success: boolean;
  message: string;
  user_id: string;
  skipped_at: string;
}

export interface FirstTimeUserResponse {
  is_first_time: boolean;
}

export const onboardingApi = {
  startOnboarding: (data: OnboardingStartRequest) =>
    apiClient.post<OnboardingStartResponse>('/onboarding/start', data),

  getOnboardingStatus: () =>
    apiClient.get<OnboardingStatusResponse>('/onboarding/status'),

  updateOnboarding: (data: OnboardingUpdateRequest) =>
    apiClient.put<OnboardingStatusResponse>('/onboarding/update', data),

  completeOnboarding: (data: OnboardingCompleteRequest = {}) =>
    apiClient.post<OnboardingCompleteResponse>('/onboarding/complete', data),

  skipOnboarding: () =>
    apiClient.post<OnboardingSkipResponse>('/onboarding/skip'),

  checkFirstTimeUser: () =>
    apiClient.get<FirstTimeUserResponse>('/onboarding/check-first-time'),

  autoCreateOrganization: () =>
    apiClient.post('/onboarding/auto-create-organization'),
};