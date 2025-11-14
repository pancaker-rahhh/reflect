import { AlertCircle, Zap, RotateCcw, Undo2, X } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { organizationApi } from '@/lib/api/organization'
import { useAppContext } from '@/context/AppContext'
import { useSubscription } from '@/hooks/useSubscription'
import { UsageBar } from '@/components/common/UsageBar'
import { useNavigate, useLocation } from 'react-router-dom'
import { usePayment } from '@/hooks/usePayment'
import { lifetimeOfferApi } from '@/lib/api/lifetime-offer'
import { useAuth } from '@/contexts/AuthContext'

export function FreeTierAlert() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { currentOrganization } = useAppContext()
  const { subscription } = useSubscription()
  const { user } = useAuth()
  const { undoCancelSubscription, isUndoingCancellation, createPaymentLink, isCreatingPayment } =
    usePayment()
  const { data: organizations } = useQuery({
    queryKey: ['organizations', 'my'],
    queryFn: () => organizationApi.getMy(),
  })

  const isOnBillingPage =
    location.pathname.includes('/settings/account') && location.search.includes('tab=billing')

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

  const { data: lifetimeEligibility } = useQuery({
    queryKey: ['lifetime-offer-eligibility', org?.id],
    queryFn: () => lifetimeOfferApi.checkEligibility(org!.id),
    enabled: !!org?.id && org.subscription_plan === 'free',
  })

  const dismissMutation = useMutation({
    mutationFn: () => lifetimeOfferApi.dismiss(org!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations', 'my'] })
      queryClient.invalidateQueries({ queryKey: ['lifetime-offer-eligibility', org?.id] })
    },
  })

  const handleUpgrade = () => {
    navigate('/app/settings/account?tab=billing')
  }

  const handleUndoCancellation = async () => {
    try {
      await undoCancelSubscription()
    } catch (error) {
      console.error('Failed to undo cancellation:', error)
    }
  }

  const handleClaimLifetime = async () => {
    if (!user?.email) return

    try {
      await createPaymentLink({
        plan_id: 'pro_lifetime',
        email: user.email,
        firstName: user.user_metadata?.first_name || '',
        lastName: user.user_metadata?.last_name || '',
        country: 'US',
      })
    } catch (error) {
      console.error('Failed to create payment link:', error)
    }
  }

  if (!org) return null

  const isFreeTier = org.subscription_plan === 'free'
  const isCancelled = org.subscription_status === 'cancelled'

  if (lifetimeEligibility?.eligible && !org.lifetime_offer_dismissed_at) {
    const daysUntilExpiry = Math.ceil(
      (new Date(lifetimeEligibility.expires_at).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    )

    return (
      <Alert className="p-6 border-2 border-primary/30 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <AlertTitle className="text-2xl font-semibold text-primary">
                🎉 Early Supporter Offer: Lifetime Pro Access
              </AlertTitle>
            </div>
            <AlertDescription className="space-y-4">
              <div className="text-lg font-medium">
                <p className="text-foreground">
                  As one of our first users, you&apos;re eligible for an exclusive lifetime deal!
                </p>
                <p className="text-muted-foreground mt-2">
                  Get Pro features for life for a one-time payment of $99.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                <div className="flex items-center gap-2 text-primary">
                  <AlertCircle className="h-4 w-4" />
                  <span>Only {lifetimeEligibility.spots_remaining} spots remaining</span>
                </div>
                <div className="flex items-center gap-2 text-primary">
                  <AlertCircle className="h-4 w-4" />
                  <span>Expires in {daysUntilExpiry} days</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  size="lg"
                  className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  onClick={handleClaimLifetime}
                  disabled={isCreatingPayment}
                >
                  {isCreatingPayment ? 'Redirecting to checkout...' : 'Claim Lifetime Access'}
                </Button>
                {!isOnBillingPage && (
                  <Button size="lg" variant="outline" onClick={handleUpgrade}>
                    See All Plans
                  </Button>
                )}
              </div>
            </AlertDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-8 w-8"
            onClick={() => dismissMutation.mutate()}
            disabled={dismissMutation.isPending}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Alert>
    )
  }

  if (!isFreeTier && !isCancelled) return null

  const widgetUsage = getUsageInfo('widgets')
  const responseUsage = getUsageInfo('responses')
  const formUsage = getUsageInfo('forms')

  // Check if still in grace period (subscription hasn't ended yet)
  // Use org.subscription_ends_at for consistency with org.subscription_status
  const subscriptionEndsAt = org.subscription_ends_at || subscription?.subscription_ends_at
  const isInGracePeriod = subscriptionEndsAt ? new Date(subscriptionEndsAt) > new Date() : false

  // Calculate days remaining
  const daysRemaining = subscriptionEndsAt
    ? Math.ceil(
        (new Date(subscriptionEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0

  if (isCancelled) {
    if (isInGracePeriod) {
      // Still in grace period - show undo cancellation option
      return (
        <Alert className="text-[hsl(var(--banner-info-foreground-light))] p-4 bg-[hsl(var(--banner-info-bg-light))]">
          <AlertCircle className="h-4 w-4 text-[hsl(var(--banner-info-foreground-light))]" />
          <AlertTitle className="text-[hsl(var(--banner-info-foreground-light))]">
            Cancellation Scheduled
          </AlertTitle>
          <AlertDescription className="mt-2">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="default"
                className="gap-2"
                onClick={handleUndoCancellation}
                disabled={isUndoingCancellation}
              >
                <Undo2 className="h-4 w-4" />
                {isUndoingCancellation ? 'Processing...' : 'Undo Cancellation'}
              </Button>
              <span className="text-sm text-[hsl(var(--banner-info-foreground-light))]">
                Your subscription will end in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
                . You can undo this cancellation to keep your Pro features.
              </span>
            </div>
          </AlertDescription>
        </Alert>
      )
    } else {
      // Grace period expired - show renew option
      return (
        <Alert className="text-[hsl(var(--banner-info-foreground-light))] p-4 bg-[hsl(var(--banner-info-bg-light))]">
          <AlertCircle className="h-4 w-4 text-[hsl(var(--banner-info-foreground-light))]" />
          <AlertTitle className="text-[hsl(var(--banner-info-foreground-light))]">
            Subscription Expired
          </AlertTitle>
          <AlertDescription className="mt-2">
            <div className="flex items-center gap-3">
              <Button size="sm" variant="destructive" className="gap-2" onClick={handleUpgrade}>
                <RotateCcw className="h-4 w-4" />
                Renew subscription
              </Button>
              <span className="text-sm text-[hsl(var(--banner-info-foreground-light))]">
                Your subscription has ended. Renew now to regain access to all Pro features.
              </span>
            </div>
          </AlertDescription>
        </Alert>
      )
    }
  }

  return (
    <Alert className="text-[hsl(var(--banner-info-foreground-light))] p-4 bg-[hsl(var(--banner-info-bg-light))]">
      <AlertCircle className="h-4 w-4 text-[hsl(var(--banner-info-foreground-light))]" />
      <AlertTitle className="text-[hsl(var(--banner-info-foreground-light))]">
        Free Tier Limitations
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-4">
        <p className="text-[hsl(var(--banner-info-foreground-light))]">
          Your current plan allows for {widgetUsage.limit} active widget, {formUsage.limit} form,
          and up to {responseUsage.limit} responses per month.
        </p>

        <div className="space-y-3">
          <UsageBar resourceType="widgets" label="Widgets" />
          <UsageBar resourceType="responses" label="Responses" />
          <UsageBar resourceType="forms" label="Forms" />
          <UsageBar resourceType="form_responses" label="Form Responses" />
        </div>

        <div className="flex items-center gap-3">
          {!isOnBillingPage && (
            <Button size="sm" className="gap-2" onClick={handleUpgrade}>
              <Zap className="h-4 w-4" />
              Upgrade to Pro
            </Button>
          )}
          <span className="text-sm text-[hsl(var(--banner-info-foreground-light))]">
            {isOnBillingPage
              ? 'Unlock unlimited widgets, forms, and responses'
              : 'Unlock unlimited widgets, forms, and responses'}
          </span>
        </div>
      </AlertDescription>
    </Alert>
  )
}
