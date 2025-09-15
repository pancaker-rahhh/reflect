import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppContext } from '@/context/AppContext'
import {
  subscriptionApi,
  type SubscriptionPlan,
  type SubscriptionLimits,
  type SubscriptionFeatures,
} from '@/lib/api/subscription'

export function useSubscriptionPlan() {
  const { currentOrganization } = useAppContext()
  const queryClient = useQueryClient()

  const {
    data: subscriptionPlan,
    isLoading: planLoading,
    error: planError,
  } = useQuery({
    queryKey: ['subscription-plan', currentOrganization?.id],
    queryFn: () => subscriptionApi.getPlan(currentOrganization?.id || ''),
    enabled: !!currentOrganization?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const {
    data: limits,
    isLoading: limitsLoading,
    error: limitsError,
  } = useQuery({
    queryKey: ['subscription-limits', currentOrganization?.id],
    queryFn: () => subscriptionApi.getLimits(currentOrganization?.id || ''),
    enabled: !!currentOrganization?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const {
    data: features,
    isLoading: featuresLoading,
    error: featuresError,
  } = useQuery({
    queryKey: ['subscription-features', currentOrganization?.id],
    queryFn: () => subscriptionApi.getFeatures(currentOrganization?.id || ''),
    enabled: !!currentOrganization?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const updatePlanMutation = useMutation({
    mutationFn: ({ organizationId, plan }: { organizationId: string; plan: string }) =>
      subscriptionApi.updatePlan(organizationId, plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plan'] })
      queryClient.invalidateQueries({ queryKey: ['subscription-limits'] })
      queryClient.invalidateQueries({ queryKey: ['subscription-features'] })
    },
  })

  const cancelSubscriptionMutation = useMutation({
    mutationFn: (organizationId: string) => subscriptionApi.cancelSubscription(organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plan'] })
      queryClient.invalidateQueries({ queryKey: ['subscription-limits'] })
      queryClient.invalidateQueries({ queryKey: ['subscription-features'] })
    },
  })

  const isLoading = planLoading || limitsLoading || featuresLoading
  const error = planError || limitsError || featuresError

  const isFeatureEnabled = (feature: string): boolean => {
    return features?.[feature as keyof SubscriptionFeatures] ?? false
  }

  const getUpgradeMessage = (feature: string): string => {
    const messages: Record<string, string> = {
      advanced_targeting: 'Advanced targeting requires Pro plan',
      branding_removal: 'Remove branding with Pro plan',
      priority_support: 'Priority support with Pro plan',
      dofollow_backlink: 'Do-follow backlink with Pro plan',
      jira_integration: 'Jira integration requires Pro plan',
    }
    return messages[feature] || 'This feature requires Pro plan'
  }

  const updatePlan = (plan: string) => {
    if (!currentOrganization?.id) return
    return updatePlanMutation.mutateAsync({
      organizationId: currentOrganization.id,
      plan,
    })
  }

  const cancelSubscription = () => {
    if (!currentOrganization?.id) return
    return cancelSubscriptionMutation.mutateAsync(currentOrganization.id)
  }

  return {
    plan: subscriptionPlan,
    limits,
    features,
    isLoading,
    error,
    isFeatureEnabled,
    getUpgradeMessage,
    updatePlan,
    cancelSubscription,
    isUpdating: updatePlanMutation.isPending,
    isCancelling: cancelSubscriptionMutation.isPending,
    isPro: subscriptionPlan?.plan === 'pro',
    isFree: subscriptionPlan?.plan === 'free',
  }
}
