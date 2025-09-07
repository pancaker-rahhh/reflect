import React from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import { UpgradePrompt } from './UpgradePrompt'
import { cn } from '@/lib/utils'

interface FeatureGateWithDisabledStateProps {
  feature: string
  children: React.ReactNode
  fallback?: React.ReactNode
  showUpgradePrompt?: boolean
  className?: string
}

export function FeatureGateWithDisabledState({
  feature,
  children,
  showUpgradePrompt = true,
  className,
}: FeatureGateWithDisabledStateProps) {
  const { isFeatureEnabled, getUpgradeMessage } = useSubscription()
  const isEnabled = isFeatureEnabled(feature)

  if (!isEnabled) {
    if (showUpgradePrompt) {
      return (
        <div className="space-y-3">
          <div className={cn('opacity-50 pointer-events-none', className)}>{children}</div>
          <UpgradePrompt message={getUpgradeMessage(feature)} />
        </div>
      )
    }
    return <div className={cn('opacity-50 pointer-events-none', className)}>{children}</div>
  }

  return <div className={className}>{children}</div>
}
