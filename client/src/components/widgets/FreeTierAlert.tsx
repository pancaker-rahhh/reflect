import { AlertCircle, Zap } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { organizationApi } from '@/lib/api/organization'
import { useAppContext } from '@/context/AppContext'
import { useSubscription } from '@/hooks/useSubscription'
import { UsageBar } from '@/components/common/UsageBar'
import { useNavigate } from 'react-router-dom'

export function FreeTierAlert() {
  const navigate = useNavigate()
  const { currentOrganization } = useAppContext()
  const { data: organizations } = useQuery({
    queryKey: ['organizations', 'my'],
    queryFn: () => organizationApi.getMy(),
  })

  // Prefer the organizations list entry (often richer),
  // otherwise fall back to context. Pick the one that has subscription_plan.
  const candidateFromList = organizations?.[0]
  const org =
    (candidateFromList && candidateFromList.subscription_plan
      ? candidateFromList
      : currentOrganization) ||
    currentOrganization ||
    candidateFromList
  const { getUsageInfo } = useSubscription()

  const handleUpgrade = () => {
    navigate('/app/settings/billing')
  }

  if (!org) return null
  const isFreeTier = org.subscription_plan === 'free'
  if (!isFreeTier) return null

  const widgetUsage = getUsageInfo('widgets')
  const responseUsage = getUsageInfo('responses')

  return (
    <Alert className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30">
      <AlertCircle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-900 dark:text-orange-100">
        Free Tier Limitations
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-4">
        <p className="text-orange-800 dark:text-orange-200">
          Your current plan allows for {widgetUsage.limit} active widget and up to{' '}
          {responseUsage.limit} responses per month.
        </p>

        <div className="space-y-3">
          <UsageBar resourceType="widgets" label="Widgets" />
          <UsageBar resourceType="responses" label="Responses" />
        </div>

        <div className="flex items-center gap-3">
          <Button size="sm" className="gap-2" onClick={handleUpgrade}>
            <Zap className="h-4 w-4" />
            Upgrade to Pro
          </Button>
          <span className="text-sm text-orange-700 dark:text-orange-300">
            Unlock unlimited widgets and responses
          </span>
        </div>
      </AlertDescription>
    </Alert>
  )
}
