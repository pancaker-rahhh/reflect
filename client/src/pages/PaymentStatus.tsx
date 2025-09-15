import { useSearchParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { organizationApi } from '@/lib/api/organization'

interface PaymentStatusConfig {
  icon: React.ReactNode
  title: string
  description: string
  color: string
  badgeVariant: 'default' | 'destructive' | 'secondary' | 'outline'
}

const PAYMENT_STATUS_CONFIG: Record<string, PaymentStatusConfig> = {
  succeeded: {
    icon: <CheckCircle2 className="w-16 h-16 text-green-500" />,
    title: 'Payment Successful',
    description: 'Your payment has been processed successfully. Your subscription is now active.',
    color: 'text-green-500',
    badgeVariant: 'default',
  },
  active: {
    icon: <CheckCircle2 className="w-16 h-16 text-green-500" />,
    title: 'Subscription Active',
    description: 'Your subscription is now active! You can access all Pro features.',
    color: 'text-green-500',
    badgeVariant: 'default',
  },
  completed: {
    icon: <CheckCircle2 className="w-16 h-16 text-green-500" />,
    title: 'Payment Completed',
    description: 'Your payment has been completed successfully. Your subscription is now active.',
    color: 'text-green-500',
    badgeVariant: 'default',
  },
  failed: {
    icon: <XCircle className="w-16 h-16 text-red-500" />,
    title: 'Payment Failed',
    description:
      "We couldn't process your payment. Please try again or contact support if the issue persists.",
    color: 'text-red-500',
    badgeVariant: 'destructive',
  },
  processing: {
    icon: <Clock className="w-16 h-16 text-yellow-500" />,
    title: 'Payment Processing',
    description: 'Your payment is being processed. This may take a few moments.',
    color: 'text-yellow-500',
    badgeVariant: 'secondary',
  },
  cancelled: {
    icon: <AlertCircle className="w-16 h-16 text-orange-500" />,
    title: 'Payment Cancelled',
    description: 'Your payment was cancelled. You can try again anytime.',
    color: 'text-orange-500',
    badgeVariant: 'outline',
  },
}

function PaymentStatusContent() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [isVerifying, setIsVerifying] = useState(false)

  const status = searchParams.get('status') || 'processing'
  const paymentId = searchParams.get('payment_id')
  const subscriptionId = searchParams.get('subscription_id')
  const organizationId = searchParams.get('organization_id')

  const config = PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG.processing

  // Fetch organization data to verify subscription status
  const { refetch } = useQuery({
    queryKey: ['organizations', 'my'],
    queryFn: () => organizationApi.getMy(),
    enabled: status === 'succeeded' && !isVerifying,
  })

  // const _organization = organizations?.[0]

  useEffect(() => {
    // Simulate loading for better UX
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Handle successful payment - redirect to billing settings with verification
  useEffect(() => {
    // Check for successful payment status (succeeded, active, or completed)
    const isSuccessful = ['succeeded', 'active', 'completed'].includes(status)

    if (isSuccessful && !isLoading && !isVerifying) {
      setIsVerifying(true)

      // Refetch organization data to get updated subscription status
      refetch().then(() => {
        // Redirect to billing settings after a short delay
        setTimeout(() => {
          navigate('/app/settings/billing', {
            state: {
              paymentSuccess: true,
              paymentId,
              subscriptionId,
              organizationId,
            },
          })
        }, 2000)
      })
    }
  }, [status, isLoading, isVerifying, refetch, navigate, paymentId, subscriptionId, organizationId])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Clock className="w-16 h-16 text-yellow-500 animate-spin" />
        <p className="text-muted-foreground mt-4">Loading payment status...</p>
      </div>
    )
  }

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 animate-pulse" />
        <h2 className="text-2xl font-bold text-green-600 mt-4">Payment Successful!</h2>
        <p className="text-muted-foreground mt-2">Verifying your subscription status...</p>
        <p className="text-sm text-muted-foreground mt-1">Redirecting to billing settings...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="mb-6">{config.icon}</div>
          <CardTitle className={`text-3xl font-bold ${config.color}`}>{config.title}</CardTitle>
          <CardDescription className="text-lg mt-2">{config.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Payment Details */}
          {(paymentId || subscriptionId) && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground">Payment Details</h3>
              <div className="space-y-1">
                {paymentId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment ID:</span>
                    <span className="font-mono">{paymentId}</span>
                  </div>
                )}
                {subscriptionId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subscription ID:</span>
                    <span className="font-mono">{subscriptionId}</span>
                  </div>
                )}
                {organizationId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Organization:</span>
                    <span className="font-mono">{organizationId}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={config.badgeVariant} className="capitalize">
                    {status}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/app/dashboard">Go to Dashboard</Link>
            </Button>

            {status === 'failed' && (
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link to="/app/settings/billing">Try Again</Link>
              </Button>
            )}

            {status === 'cancelled' && (
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link to="/app/settings/billing">Upgrade Plan</Link>
              </Button>
            )}
          </div>

          {/* Help Text */}
          <div className="text-center text-sm text-muted-foreground">
            {(status === 'succeeded' || status === 'active' || status === 'completed') && (
              <p>You can now access all Pro features. Check your email for a receipt.</p>
            )}
            {status === 'failed' && (
              <p>If you continue to experience issues, please contact our support team.</p>
            )}
            {status === 'processing' && (
              <p>You will receive an email confirmation once the payment is complete.</p>
            )}
            {status === 'cancelled' && <p>No charges were made to your account.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentStatusPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Payment Status</h1>
          <p className="text-muted-foreground mt-2">
            Check the status of your subscription payment
          </p>
        </div>

        <PaymentStatusContent />
      </div>
    </main>
  )
}
