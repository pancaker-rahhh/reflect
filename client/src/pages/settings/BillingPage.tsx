import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Settings, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { PaymentPlans } from '@/components/payment/PaymentPlans'
import { usePayment } from '@/hooks/usePayment'
import { useSubscription } from '@/hooks/useSubscription'

export default function BillingPage() {
  const navigate = useNavigate()
  const { subscription, isLoading: subscriptionLoading } = useSubscription()
  const { cancelSubscription, isCancelling } = usePayment()
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [cancellationError, setCancellationError] = useState<string | null>(null)

  const handleCancelSubscription = async () => {
    if (
      !confirm('Are you sure you want to cancel your subscription? This action cannot be undone.')
    ) {
      return
    }

    try {
      setCancellationError(null)
      await cancelSubscription()
      // The subscription will be updated via the webhook
    } catch (error) {
      setCancellationError(error instanceof Error ? error.message : 'Failed to cancel subscription')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'past_due':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Active
          </Badge>
        )
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      case 'past_due':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Past Due
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (subscriptionLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading billing information...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Billing & Subscription</h1>
            <p className="text-muted-foreground mt-1">
              Manage your subscription and billing information
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <Settings className="mr-2 h-4 w-4" />
            Back to Settings
          </Button>
        </div>

        {/* Current Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold capitalize">{subscription.plan} Plan</h3>
                    <p className="text-sm text-muted-foreground">Status: {subscription.status}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(subscription.status)}
                    {getStatusBadge(subscription.status)}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Projects</h4>
                    <p className="text-2xl font-bold">
                      {subscription.limits.projects === 999999 ? '∞' : subscription.limits.projects}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Widgets</h4>
                    <p className="text-2xl font-bold">
                      {subscription.limits.widgets === 999999 ? '∞' : subscription.limits.widgets}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Responses</h4>
                    <p className="text-2xl font-bold">
                      {subscription.limits.responses === 999999
                        ? '∞'
                        : subscription.limits.responses}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Features</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(subscription.features).map(
                        ([feature, enabled]) =>
                          enabled && (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                            </Badge>
                          )
                      )}
                      {Object.values(subscription.features).every((enabled) => !enabled) && (
                        <span className="text-sm text-muted-foreground">
                          No premium features enabled
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {subscription.plan === 'free' ? (
                      <Button onClick={() => setShowUpgrade(true)}>Upgrade Plan</Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={handleCancelSubscription}
                        disabled={isCancelling}
                      >
                        {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
                      </Button>
                    )}
                  </div>
                </div>

                {cancellationError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{cancellationError}</AlertDescription>
                  </Alert>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No Subscription Found</h3>
                <p className="text-muted-foreground mb-4">
                  Unable to load your subscription information.
                </p>
                <Button onClick={() => setShowUpgrade(true)}>View Available Plans</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Plans */}
        {showUpgrade && (
          <Card>
            <CardHeader>
              <CardTitle>Available Plans</CardTitle>
              <CardDescription>Choose the plan that best fits your needs</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentPlans
                onPlanSelect={(_plan) => {
                  // Close the upgrade modal and let PaymentPlans handle the payment flow
                  setShowUpgrade(false)
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Billing Information */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
            <CardDescription>Your billing and payment details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4" />
              <p>Billing information is managed through our secure payment processor.</p>
              <p className="text-sm mt-2">
                For billing questions, please contact our support team.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
