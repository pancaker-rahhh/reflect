import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  onboardingApi,
  type OnboardingStartRequest,
  type OnboardingUpdateRequest,
  type OnboardingCompleteRequest,
} from '../lib/api/onboardingApi'

export const ONBOARDING_KEYS = {
  all: ['onboarding'] as const,
  status: () => [...ONBOARDING_KEYS.all, 'status'] as const,
  firstTime: () => [...ONBOARDING_KEYS.all, 'first-time'] as const,
}

export const useOnboardingStatus = () => {
  return useQuery({
    queryKey: ONBOARDING_KEYS.status(),
    queryFn: onboardingApi.getOnboardingStatus,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useCheckFirstTimeUser = () => {
  return useQuery({
    queryKey: ONBOARDING_KEYS.firstTime(),
    queryFn: onboardingApi.checkFirstTimeUser,
    retry: false,
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on component mount if data exists
  })
}

export const useStartOnboarding = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: OnboardingStartRequest) => onboardingApi.startOnboarding(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_KEYS.status() })
      queryClient.invalidateQueries({ queryKey: ONBOARDING_KEYS.firstTime() })
    },
  })
}

export const useUpdateOnboarding = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: OnboardingUpdateRequest) => onboardingApi.updateOnboarding(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_KEYS.status() })
    },
  })
}

export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data?: OnboardingCompleteRequest) => onboardingApi.completeOnboarding(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ['user'] }) // Invalidate user data
    },
  })
}

export const useSkipOnboarding = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => onboardingApi.skipOnboarding(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ['user'] }) // Invalidate user data
    },
  })
}

export const useAutoCreateOrganization = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => onboardingApi.autoCreateOrganization(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_KEYS.status() })
      queryClient.invalidateQueries({ queryKey: ['organizations'] }) // Invalidate org data
    },
  })
}
