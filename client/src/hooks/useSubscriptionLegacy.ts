// Legacy hook for backward compatibility - use useUsageTracking and useSubscriptionPlan instead
import { useUsageTracking } from './useUsageTracking'
import { useSubscriptionPlan } from './useSubscriptionPlan'

export function useSubscription() {
  const usageTracking = useUsageTracking()
  const subscriptionPlan = useSubscriptionPlan()

  // Combine data for backward compatibility
  const subscription =
    subscriptionPlan.plan && usageTracking.limits && usageTracking.features && usageTracking.usage
      ? {
          plan: subscriptionPlan.plan.plan,
          status: subscriptionPlan.plan.status,
          limits: usageTracking.limits,
          features: usageTracking.features,
          usage: usageTracking.usage,
        }
      : undefined

  const isLoading = usageTracking.isLoading || subscriptionPlan.isLoading
  const error = usageTracking.error || subscriptionPlan.error

  const isFeatureEnabled = (feature: string): boolean => {
    return subscription?.features[feature as keyof typeof subscription.features] ?? false
  }

  const canCreateResource = (resourceType: string): boolean => {
    const currentUsage = subscription?.usage[resourceType] ?? 0
    const limit = subscription?.limits[resourceType as keyof typeof subscription.limits] ?? 0
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
    const currentUsage = subscription?.usage[resourceType] ?? 0
    const limit = subscription?.limits[resourceType as keyof typeof subscription.limits] ?? 0
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
