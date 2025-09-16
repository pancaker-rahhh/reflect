import { useQuery } from '@tanstack/react-query'
import { useAppContext } from '@/context/AppContext'
import {
  subscriptionApi,
  type SubscriptionLimits,
  type SubscriptionFeatures,
} from '@/lib/api/subscription'

export function useSubscription() {
  const { currentOrganization } = useAppContext()

  const {
    data: plan,
    isLoading: planLoading,
    error: planError,
  } = useQuery({
    queryKey: ['subscription-plan', currentOrganization?.id],
    queryFn: () => subscriptionApi.getPlan(currentOrganization?.id || ''),
    enabled: !!currentOrganization?.id,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: false,
  })

  const {
    data: limits,
    isLoading: limitsLoading,
    error: limitsError,
  } = useQuery({
    queryKey: ['subscription-limits', currentOrganization?.id],
    queryFn: () => subscriptionApi.getLimits(currentOrganization?.id || ''),
    enabled: !!currentOrganization?.id,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: false,
  })

  const {
    data: features,
    isLoading: featuresLoading,
    error: featuresError,
  } = useQuery({
    queryKey: ['subscription-features', currentOrganization?.id],
    queryFn: () => subscriptionApi.getFeatures(currentOrganization?.id || ''),
    enabled: !!currentOrganization?.id,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: false,
  })

  const subscription =
    plan && limits && features
      ? {
          plan: plan.plan,
          status: plan.status,
          subscription_ends_at: plan.subscription_ends_at,
          payment_status: plan.payment_status,
          limits,
          features,
          usage: {
            projects: 0, // This would need to be fetched separately
            widgets: 0, // This would need to be fetched separately
            responses: 0, // This would need to be fetched separately
          },
        }
      : undefined

  const isLoading = planLoading || limitsLoading || featuresLoading
  const error = planError || limitsError || featuresError

  const isFeatureEnabled = (feature: string): boolean => {
    return subscription?.features[feature as keyof SubscriptionFeatures] ?? false
  }

  const canCreateResource = (resourceType: string): boolean => {
    const currentUsage = subscription?.usage[resourceType as keyof typeof subscription.usage] ?? 0
    const limit = subscription?.limits[resourceType as keyof SubscriptionLimits] ?? 0
    return currentUsage < limit
  }

  const getUpgradeMessage = (feature: string): string => {
    const messages: Record<string, string> = {
      advanced_targeting: 'Advanced targeting requires Pro plan',
      branding_removal: 'Remove branding with Pro plan',
      priority_support: 'Priority support with Pro plan',
      dofollow_backlink: 'Do-follow backlink with Pro plan',
      jira_integration: 'Jira integration requires Pro plan',
      unlimited_widgets: 'Unlimited widgets with Pro plan',
      unlimited_responses: 'Unlimited responses with Pro plan',
    }
    return messages[feature] || 'This feature requires Pro plan'
  }

  const getUsageInfo = (resourceType: string) => {
    const currentUsage = subscription?.usage[resourceType as keyof typeof subscription.usage] ?? 0
    const limit = subscription?.limits[resourceType as keyof SubscriptionLimits] ?? 0
    return {
      current: currentUsage,
      limit,
      remaining: Math.max(0, limit - currentUsage),
      isUnlimited: limit >= 999,
      percentage: limit > 0 ? Math.round((currentUsage / limit) * 100) : 0,
    }
  }

  return {
    subscription,
    isLoading,
    error,
    isFeatureEnabled,
    canCreateResource,
    getUpgradeMessage,
    getUsageInfo,
    isPro: subscription?.plan === 'pro',
    isFree: subscription?.plan === 'free',
  }
}
