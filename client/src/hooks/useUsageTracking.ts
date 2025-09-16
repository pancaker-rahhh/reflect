import { useQuery } from '@tanstack/react-query'
import { useAppContext } from '@/context/AppContext'
import { usageTrackingApi, type UsageLimits, type UsageFeatures } from '@/lib/api/usageTracking'

export function useUsageTracking() {
  const { currentOrganization } = useAppContext()

  const {
    data: limits,
    isLoading: limitsLoading,
    error: limitsError,
  } = useQuery({
    queryKey: ['usage-limits', currentOrganization?.id],
    queryFn: () => usageTrackingApi.getLimits(currentOrganization?.id || ''),
    enabled: !!currentOrganization?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const {
    data: features,
    isLoading: featuresLoading,
    error: featuresError,
  } = useQuery({
    queryKey: ['usage-features', currentOrganization?.id],
    queryFn: () => usageTrackingApi.getFeatures(currentOrganization?.id || ''),
    enabled: !!currentOrganization?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const {
    data: usage,
    isLoading: usageLoading,
    error: usageError,
  } = useQuery({
    queryKey: ['usage-current', currentOrganization?.id],
    queryFn: () => usageTrackingApi.getUsage(currentOrganization?.id || ''),
    enabled: !!currentOrganization?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const isLoading = limitsLoading || featuresLoading || usageLoading
  const error = limitsError || featuresError || usageError

  const isFeatureEnabled = (feature: string): boolean => {
    return features?.[feature as keyof UsageFeatures] ?? false
  }

  const canCreateResource = (resourceType: string): boolean => {
    const currentUsage = usage?.[resourceType] ?? 0
    const limit = limits?.[resourceType as keyof UsageLimits] ?? 0
    return currentUsage < limit
  }

  const getUsageInfo = (resourceType: string) => {
    const currentUsage = usage?.[resourceType] ?? 0
    const limit = limits?.[resourceType as keyof UsageLimits] ?? 0
    return {
      current: currentUsage,
      limit,
      remaining: Math.max(0, limit - currentUsage),
      isUnlimited: limit >= 999,
      percentage: limit > 0 ? Math.round((currentUsage / limit) * 100) : 0,
    }
  }

  return {
    limits,
    features,
    usage,
    isLoading,
    error,
    isFeatureEnabled,
    canCreateResource,
    getUsageInfo,
  }
}
