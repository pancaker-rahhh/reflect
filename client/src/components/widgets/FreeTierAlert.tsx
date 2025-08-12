import { AlertCircle, Zap } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/client'

interface Organization {
  id: string
  name: string
  subscription: {
    plan: 'free' | 'pro'
    widgetLimit: number
    responseLimit: number
  }
}

export function FreeTierAlert() {
  const { data: organizations } = useQuery({
    queryKey: ['organizations', 'my'],
    queryFn: () => apiClient.get<Organization[]>('/organizations/my')
  })

  const currentOrganization = organizations?.[0]
  const isFreeTier = currentOrganization?.subscription.plan === 'free'
  
  if (!isFreeTier) return null

  const { widgetLimit, responseLimit } = currentOrganization.subscription

  return (
    <Alert className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30">
      <AlertCircle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-900 dark:text-orange-100">Free Tier Limitations</AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p className="text-orange-800 dark:text-orange-200">
          Your current plan allows for {widgetLimit} active widget and up to {responseLimit} responses per month.
        </p>
        <div className="flex items-center gap-3">
          <Button size="sm" className="gap-2">
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