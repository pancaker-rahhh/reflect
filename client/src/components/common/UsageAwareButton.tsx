import React from 'react'
import { Button } from '@/components/ui/button'
import { useSubscription } from '@/hooks/useSubscription'
import { useNavigate } from 'react-router-dom'

interface UsageAwareButtonProps {
  resourceType: string
  action: () => void
  children: React.ReactNode
  disabled?: boolean
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function UsageAwareButton({
  resourceType,
  action,
  children,
  disabled,
  variant = 'default',
  size = 'default',
  className,
}: UsageAwareButtonProps) {
  const navigate = useNavigate()
  const { canCreateResource, getUsageInfo } = useSubscription()

  const canCreate = canCreateResource(resourceType)
  const usageInfo = getUsageInfo(resourceType)

  const handleClick = () => {
    if (!canCreate) {
      navigate('/app/settings/billing')
      return
    }
    action()
  }

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || !canCreate}
      variant={!canCreate ? 'outline' : variant}
      size={size}
      className={className}
    >
      {children}
      {!canCreate && !usageInfo.isUnlimited && (
        <span className="ml-2 text-xs text-muted-foreground">
          ({usageInfo.current}/{usageInfo.limit})
        </span>
      )}
    </Button>
  )
}
