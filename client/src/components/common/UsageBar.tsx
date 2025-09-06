import React from 'react'
import { Progress } from '@/components/ui/progress'
import { useSubscription } from '@/hooks/useSubscription'

interface UsageBarProps {
  resourceType: string
  label?: string
  className?: string
}

export function UsageBar({ resourceType, label, className }: UsageBarProps) {
  const { getUsageInfo } = useSubscription()
  const usageInfo = getUsageInfo(resourceType)

  const displayLabel =
    label || resourceType.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())

  if (usageInfo.isUnlimited) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex justify-between text-sm">
          <span className="font-medium">{displayLabel}</span>
          <span className="text-green-600">Unlimited</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm">
        <span className="font-medium">{displayLabel}</span>
        <span className="text-muted-foreground">
          {usageInfo.current} / {usageInfo.limit}
        </span>
      </div>
      <Progress
        value={usageInfo.percentage}
        className="h-2"
        aria-label={`${displayLabel} usage: ${usageInfo.percentage}%`}
      />
      {usageInfo.percentage > 80 && (
        <p className="text-xs text-orange-600">
          {usageInfo.percentage > 95 ? 'Limit almost reached' : 'Approaching limit'}
        </p>
      )}
    </div>
  )
}
