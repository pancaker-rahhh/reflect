import { useState, useEffect } from 'react'
import { CreditCard, AlertCircle, CheckCircle2, XCircle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { PaymentPlans } from '@/components/payment/PaymentPlans'
import { usePayment } from '@/hooks/usePayment'
import { useAppContext } from '@/context/AppContext'
import { useAuth } from '@/contexts/AuthContext'
import { organizationApi } from '@/lib/api/organization'
import { apiClient } from '@/lib/client'
import { useSubscription } from '@/hooks/useSubscription'
import { ConfirmationModal } from '@/components/common/ConfirmationModal'
import { paymentApi, type PaymentItem } from '@/lib/api/payment'
import { FreeTierAlert } from '@/components/widgets/SubscriptionMessagesBanner'

export function BillingPageContent() {
  const { subscription, isLoading: subscriptionLoading } = useSubscription()
  const { currentOrganization } = useAppContext()
  const { user } = useAuth()
  const {
    cancelSubscription,
    undoCancelSubscription,
    changePlan,
    isCancelling,
    isUndoingCancellation,
    isChangingPlan,
  } = usePayment()
  const [cancellationError, setCancellationError] = useState<string | null>(null)
  const [changeError, setChangeError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [isCancellationScheduled, setIsCancellationScheduled] = useState(false)
  const [isOrgOwner, setIsOrgOwner] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [isLoadingPayments, setIsLoadingPayments] = useState(false)
  const [paymentsError, setPaymentsError] = useState<string | null>(null)
  const [payments, setPayments] = useState<PaymentItem[] | null>(null)
  const [showPaymentsExample, setShowPaymentsExample] = useState(false)

  const formatPaymentAmount = (currency?: string | null, amountMinor?: number | null): string => {
    if (amountMinor === null || amountMinor === undefined) return '-'
    const code = (currency || 'USD').toUpperCase()
    const zeroDecimals = new Set([
      'BIF',
      'CLP',
      'DJF',
      'GNF',
      'JPY',
      'KMF',
      'KRW',
      'MGA',
      'PYG',
      'RWF',
      'UGX',
      'VND',
      'VUV',
      'XAF',
      'XOF',
      'XPF',
      'HUF',
    ])
    const amount = zeroDecimals.has(code) ? amountMinor : amountMinor / 100
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: code }).format(amount)
    } catch {
      return `${amount.toLocaleString()} ${code}`
    }
  }

  const renderPaymentBadge = (status?: string | null) => {
    const s = (status || '').toLowerCase()
    if (s === 'succeeded') return <Badge className="bg-green-100 text-green-800">Succeeded</Badge>
    if (s === 'failed') return <Badge className="bg-red-100 text-red-800">Failed</Badge>
    if (s === 'processing')
      return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
    return (
      <Badge variant="outline" className="capitalize">
        {status || 'unknown'}
      </Badge>
    )
  }

  const openInvoice = async (paymentId?: string | null) => {
    if (!paymentId) return
    const orgId = currentOrganization?.id
    if (!orgId) {
      setPaymentsError('No organization selected')
      return
    }
    try {
      const blob = await apiClient.getBinary(
        `/organizations/${orgId}/payment/invoices/${paymentId}`
      )
      const blobUrl = URL.createObjectURL(blob)
      window.open(blobUrl, '_blank', 'noopener')
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to open invoice'
      setPaymentsError(msg)
    }
  }

  // Determine if current user is the organization owner
  useEffect(() => {
    let mounted = true
    const fetchMembers = async () => {
      try {
        if (!currentOrganization?.id) return
        const members = await organizationApi.getMembers(currentOrganization.id)
        const currentUserId = user?.id
        const owner = members.find((m) => m.role === 'owner')
        if (!mounted) return
        setIsOrgOwner(Boolean(owner && owner.user_id && owner.user_id === currentUserId))
      } catch (e) {
        // If member lookup fails, default to hidden for safety
        if (!mounted) return
        setIsOrgOwner(false)
      }
    }
    fetchMembers()
    return () => {
      mounted = false
    }
  }, [currentOrganization?.id, user?.id])

  const handleCancelSubscription = async () => {
    try {
      setCancellationError(null)
      setInfoMessage(null)
      const result = await cancelSubscription()
      const when = result?.subscription_ends_at
        ? new Date(result.subscription_ends_at).toLocaleString()
        : null
      setInfoMessage(
        when
          ? `Cancellation scheduled. Your subscription will end on ${when}.`
          : 'Cancellation scheduled at the next billing date.'
      )
      setIsCancellationScheduled(true)
    } catch (error) {
      setCancellationError(error instanceof Error ? error.message : 'Failed to cancel subscription')
    }
  }

  const handleUndoCancellation = async () => {
    try {
      setCancellationError(null)
      setInfoMessage(null)
      await undoCancelSubscription()
      setInfoMessage('Cancellation has been undone.')
      setIsCancellationScheduled(false)
    } catch (error) {
      setCancellationError(error instanceof Error ? error.message : 'Failed to undo cancellation')
    }
  }

  const handleChangePlan = async (target: 'monthly' | 'yearly') => {
    if (!subscription) return
    try {
      setChangeError(null)
      setInfoMessage(null)
      const newPlanId = target === 'monthly' ? 'pro_monthly' : 'pro_yearly'
      await changePlan(newPlanId)
      setInfoMessage('Plan change initiated successfully.')
    } catch (error) {
      setChangeError(error instanceof Error ? error.message : 'Failed to change plan')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'expired':
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
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>
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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading billing information...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Subscription Status Banner */}
      <FreeTierAlert />

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
                  <h3 className="text-lg font-semibold capitalize">
                    {subscription.plan.replace('_', ' ')} Plan
                  </h3>
                  <p className="text-sm text-muted-foreground">Status: {subscription.status}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(subscription.status)}
                  {getStatusBadge(subscription.status)}
                </div>
              </div>

              {infoMessage && (
                <Alert>
                  <AlertDescription>{infoMessage}</AlertDescription>
                </Alert>
              )}

              {/* Failure banners */}
              {subscription.status === 'past_due' && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <span>
                      Payment failed. Please select a plan below to retry payment and restore
                      service.
                    </span>
                  </AlertDescription>
                </Alert>
              )}

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
                    {subscription.limits.responses === 999999 ? '∞' : subscription.limits.responses}
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
                        Upgrade plan for premium features
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-2">
                  {subscription.status === 'cancelled' || subscription.status === 'expired' ? (
                    <>
                      {subscription.subscription_ends_at &&
                        new Date(subscription.subscription_ends_at) > new Date() && (
                          <Button
                            onClick={handleUndoCancellation}
                            disabled={isUndoingCancellation}
                            className="w-full md:w-auto"
                          >
                            {isUndoingCancellation ? 'Processing...' : 'Undo Cancellation'}
                          </Button>
                        )}
                    </>
                  ) : subscription.plan !== 'free' && subscription.plan !== 'pro_lifetime' ? (
                    <>
                      <div className="flex gap-2">
                        {subscription.plan === 'pro_monthly' && (
                          <Button
                            variant="outline"
                            onClick={() => handleChangePlan('yearly')}
                            disabled={isChangingPlan}
                            className="w-full bg-primary/90 text-white hover:bg-primary hover:text-white"
                          >
                            {isChangingPlan ? 'Changing…' : 'Switch to Yearly'}
                          </Button>
                        )}
                        {subscription.plan === 'pro_yearly' && (
                          <Button
                            variant="outline"
                            onClick={() => handleChangePlan('monthly')}
                            disabled={isChangingPlan}
                            className="w-full bg-primary/90 text-white hover:bg-primary hover:text-white"
                          >
                            {isChangingPlan ? 'Changing…' : 'Switch to Monthly'}
                          </Button>
                        )}
                      </div>
                      {isOrgOwner && (
                        <Button
                          variant="outline"
                          onClick={() => setShowCancelConfirm(true)}
                          disabled={isCancelling}
                          className="w-full hover:bg-red-500 hover:text-white"
                        >
                          {isCancelling ? 'Cancelling…' : 'Cancel Subscription'}
                        </Button>
                      )}
                    </>
                  ) : null}
                </div>
              </div>

              {cancellationError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{cancellationError}</AlertDescription>
                </Alert>
              )}

              {changeError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{changeError}</AlertDescription>
                </Alert>
              )}

              {/* Undo cancellation banner during grace window */}
              {subscription.status !== 'cancelled' && isCancellationScheduled && (
                <Alert>
                  <AlertDescription className="flex items-center justify-between">
                    <span>
                      Cancellation scheduled. Your subscription will end soon. You can undo within
                      the grace period.
                    </span>
                    <Button
                      variant="outline"
                      onClick={handleUndoCancellation}
                      disabled={isUndoingCancellation}
                    >
                      {isUndoingCancellation ? 'Undoing…' : 'Undo Cancellation'}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No Subscription Found</h3>
              <p className="text-muted-foreground mb-4">
                Unable to load your subscription information. Please view available plans below.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Plans - Always visible */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Choose the plan that best fits your needs</CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentPlans onPlanSelect={(_plan) => {}} />
        </CardContent>
      </Card>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Billing Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="py-1 text-muted-foreground">
            <p>Billing information is managed through our secure payment processor.</p>
            <p className="text-sm mt-1">You can quickly review your recent payments below.</p>
          </div>

          <div>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  setShowPaymentsExample(true)
                  setPaymentsError(null)
                  setIsLoadingPayments(true)
                  setPayments(null)
                  const orgId = currentOrganization?.id
                  if (!orgId) throw new Error('No organization selected')
                  const res = await paymentApi.listPayments(orgId, {
                    page_size: 10,
                    page_number: 0,
                  })
                  setPayments(res.items || [])
                } catch (e) {
                  const msg = e instanceof Error ? e.message : 'Failed to load payments'
                  setPaymentsError(msg)
                } finally {
                  setIsLoadingPayments(false)
                }
              }}
              disabled={isLoadingPayments}
            >
              {isLoadingPayments ? 'Loading Payments…' : 'View Recent Payments'}
            </Button>
          </div>

          {/* Example card using the same layout as actual items (visible after click) */}
          {showPaymentsExample && (
            <div className="mt-2 border rounded-md">
              <div className="flex items-center justify-between px-3 py-2 text-sm opacity-80">
                <div className="flex flex-col">
                  <span className="font-medium">Example Payment ID</span>
                  <span className="text-xs text-muted-foreground">DD/MM/YYYY, HH:MM:SS</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs">Amount $</span>
                  {renderPaymentBadge('succeeded')}
                </div>
              </div>
            </div>
          )}

          {paymentsError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{paymentsError}</AlertDescription>
            </Alert>
          )}

          {payments && payments.length > 0 && (
            <div className="mt-2 border rounded-md divide-y">
              {payments.map((p) => (
                <div
                  key={p.payment_id ?? Math.random()}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{p.payment_id ?? '—'}</span>
                    <span className="text-xs text-muted-foreground">
                      {p.created_at ? new Date(p.created_at).toLocaleString() : 'Unknown date'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs">
                      {formatPaymentAmount(p.currency, p.total_amount)}
                    </span>
                    {renderPaymentBadge(p.status)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openInvoice(p.payment_id || undefined)}
                      disabled={!p.payment_id}
                      className="h-7 px-2"
                    >
                      <FileText className="h-3.5 w-3.5 mr-1" /> Invoice
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel confirmation modal */}
      <ConfirmationModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={async () => {
          await handleCancelSubscription()
          setShowCancelConfirm(false)
        }}
        title="Cancel Subscription"
        description="Are you sure you want to cancel your subscription? This will take effect at the next billing date. You can undo within the grace period."
        confirmText="Confirm Cancellation"
        cancelText="Keep Subscription"
        variant="destructive"
        isLoading={isCancelling}
      />
    </div>
  )
}
