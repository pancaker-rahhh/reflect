import React from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import { UpgradePrompt } from './UpgradePrompt'

interface FeatureGateProps {
  feature: string
  children: React.ReactNode
  fallback?: React.ReactNode
  showUpgradePrompt?: boolean
}

export function FeatureGate({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
}: FeatureGateProps) {
  const { isFeatureEnabled, getUpgradeMessage } = useSubscription()

  if (!isFeatureEnabled(feature)) {
    if (showUpgradePrompt) {
      return <UpgradePrompt message={getUpgradeMessage(feature)} />
    }
    return fallback || null
  }

  return <>{children}</>
}
