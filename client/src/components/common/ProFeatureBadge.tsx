import { useSubscription } from '@/hooks/useSubscription'

interface ProFeatureBadgeProps {
  feature: string
  className?: string
}

export function ProFeatureBadge({ feature, className = '' }: ProFeatureBadgeProps) {
  const { isFeatureEnabled } = useSubscription()
  const isEnabled = isFeatureEnabled(feature)

  // Only show "Pro Feature" badge for free users
  if (isEnabled) {
    return null
  }

  return (
    <span className={`text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full ${className}`}>
      Pro Feature
    </span>
  )
}
