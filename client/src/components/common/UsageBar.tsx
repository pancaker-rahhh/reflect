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
    <div className={`space-y-3 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="font-medium text-sm">{displayLabel}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {usageInfo.current} / {usageInfo.limit}
          </span>
          <span className="text-xs font-medium text-primary">
            {Math.round(usageInfo.percentage)}%
          </span>
        </div>
      </div>
      <Progress value={usageInfo.percentage} showPercentage={false} className="h-2" />
      {usageInfo.percentage > 80 && (
        <div className="flex items-center gap-1">
          <div
            className={`w-2 h-2 rounded-full ${
              usageInfo.percentage > 95 ? 'bg-red-500' : 'bg-orange-500'
            }`}
          />
          <p className="text-xs text-muted-foreground">
            {usageInfo.percentage > 95 ? 'Limit almost reached' : 'Approaching limit'}
          </p>
        </div>
      )}
    </div>
  )
}
