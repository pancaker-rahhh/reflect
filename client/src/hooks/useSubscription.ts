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
    data: subscription,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['subscription', currentOrganization?.id],
    queryFn: () => subscriptionApi.getInfo(currentOrganization?.id || ''),
    enabled: !!currentOrganization?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const isFeatureEnabled = (feature: string): boolean => {
    return subscription?.features[feature as keyof SubscriptionFeatures] ?? false
  }

  const canCreateResource = (resourceType: string): boolean => {
    const currentUsage = subscription?.usage[resourceType] ?? 0
    const limit = subscription?.limits[resourceType as keyof SubscriptionLimits] ?? 0
    return currentUsage < limit
  }

  const getUpgradeMessage = (feature: string): string => {
    const messages: Record<string, string> = {
      advanced_targeting: 'Advanced targeting requires Pro plan',
      branding_removal: 'Remove branding with Pro plan',
      priority_support: 'Priority support with Pro plan',
      dofollow_backlink: 'Do-follow backlink with Pro plan',
      unlimited_widgets: 'Unlimited widgets with Pro plan',
      unlimited_responses: 'Unlimited responses with Pro plan',
    }
    return messages[feature] || 'This feature requires Pro plan'
  }

  const getUsageInfo = (resourceType: string) => {
    const currentUsage = subscription?.usage[resourceType] ?? 0
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
