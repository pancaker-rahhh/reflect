import { useNavigate } from 'react-router-dom'
import { Check, AlertCircle, ArrowLeft, Zap, Shield, Infinity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useQuery } from '@tanstack/react-query'
import { useAppContext } from '@/context/AppContext'
import { lifetimeOfferApi } from '@/lib/api/lifetime-offer'
import { usePayment } from '@/hooks/usePayment'
import { useAuth } from '@/contexts/AuthContext'

export default function LifetimeOfferPage() {
  const navigate = useNavigate()
  const { currentOrganization } = useAppContext()
  const { user } = useAuth()
  const { createPaymentLink, isCreatingPayment } = usePayment()

  const { data: eligibility, isLoading } = useQuery({
    queryKey: ['lifetime-offer-eligibility', currentOrganization?.id],
    queryFn: () => lifetimeOfferApi.checkEligibility(currentOrganization!.id),
    enabled: !!currentOrganization?.id,
  })

  const handleClaimOffer = async () => {
    if (!currentOrganization?.id || !user?.email) return

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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading offer details...</span>
        </div>
      </div>
    )
  }

  if (!eligibility?.eligible) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button
          variant="outline"
          onClick={() => navigate('/app/settings/account?tab=billing')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {eligibility?.reason === 'already_paid' &&
              "You're already a Pro member! This offer is only for free plan users."}
            {eligibility?.reason === 'sold_out' &&
              'Sorry, all lifetime access spots have been claimed. Check out our other plans!'}
            {eligibility?.reason === 'expired' &&
              'This offer has expired. Check out our current plans!'}
            {!eligibility?.reason && 'This offer is not available.'}
          </AlertDescription>
        </Alert>

        <div className="mt-6">
          <Button onClick={() => navigate('/app/settings/account?tab=billing')}>
            View Available Plans
          </Button>
        </div>
      </div>
    )
  }

  const daysUntilExpiry = Math.ceil(
    (new Date(eligibility.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  const proFeatures = [
    { icon: Infinity, text: 'Unlimited projects' },
    { icon: Infinity, text: 'Unlimited widgets' },
    { icon: Infinity, text: 'Unlimited responses' },
    { icon: Zap, text: 'Advanced targeting & segmentation' },
    { icon: Shield, text: 'Remove Reflect branding' },
    { icon: Check, text: 'Priority support' },
    { icon: Check, text: 'Dofollow backlink' },
    { icon: Check, text: 'Jira integration' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-950/20 dark:to-blue-950/20">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button
          variant="outline"
          onClick={() => navigate('/app/settings/account?tab=billing')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Badge className="text-lg px-4 py-1 bg-gradient-to-r from-purple-600 to-blue-600">
              Early Supporter Exclusive
            </Badge>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Lifetime Pro Access
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-6">
            Lock in unlimited access forever as a founding member
          </p>

          <div className="flex flex-wrap justify-center items-center gap-6 text-sm font-medium">
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <AlertCircle className="h-5 w-5" />
              <span className="text-lg">
                Only <strong>{eligibility.spots_remaining}</strong> spots remaining
              </span>
            </div>
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <AlertCircle className="h-5 w-5" />
              <span className="text-lg">
                Expires in <strong>{daysUntilExpiry}</strong> days
              </span>
            </div>
          </div>
        </div>

        {/* Main Offer Card */}
        <Card className="border-2 border-primary shadow-2xl mb-8 hover:border-primary">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Pricing */}
              <div className="text-center md:text-left">
                <p className="text-sm font-medium text-muted-foreground mb-2">One-time payment</p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-6xl font-bold text-primary">$99</span>
                  <span className="text-lg text-muted-foreground line-through">$348/year</span>
                </div>
                <p className="text-muted-foreground mb-6">
                  Save over <strong className="text-foreground">$250/year</strong> compared to Pro
                  Yearly
                </p>

                <Button
                  size="lg"
                  className="w-full text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  onClick={handleClaimOffer}
                  disabled={isCreatingPayment}
                >
                  {isCreatingPayment ? 'Redirecting to checkout...' : 'Claim Lifetime Access Now'}
                </Button>

                <p className="text-xs text-muted-foreground mt-4">
                  Secure checkout powered by Dodo Payments
                </p>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-xl font-bold mb-4">Everything in Pro, Forever:</h3>
                <ul className="space-y-3">
                  {proFeatures.map((feature, index) => {
                    const Icon = feature.icon
                    return (
                      <li key={index} className="flex items-center gap-3">
                        <div className="shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-foreground">{feature.text}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Why This Offer */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Why We&apos;re Offering This</h2>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">You&apos;re Early</h3>
                <p className="text-sm text-muted-foreground">
                  As one of our first users, you&apos;re helping us build something amazing. This is
                  our way of saying thanks.
                </p>
              </div>
              <div>
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Lifetime Guarantee</h3>
                <p className="text-sm text-muted-foreground">
                  Pay once, own forever. No recurring charges, no surprises. Your access is
                  guaranteed for life.
                </p>
              </div>
              <div>
                <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold mb-2">Exclusive Access</h3>
                <p className="text-sm text-muted-foreground">
                  This offer will never be repeated. Once the {eligibility.spots_remaining} spots
                  are gone, it&apos;s gone forever.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">What happens after I purchase?</h4>
                <p className="text-sm text-muted-foreground">
                  You&apos;ll immediately get lifetime access to all Pro features. No expiration, no
                  renewal required.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Is this really lifetime?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes! As long as Reflect exists, you&apos;ll have Pro access. No asterisks, no fine
                  print.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Can I upgrade from free to lifetime later?</h4>
                <p className="text-sm text-muted-foreground">
                  This is a limited-time offer for early supporters only. Once the{' '}
                  {eligibility.spots_remaining} spots are claimed or the deadline passes, it
                  won&apos;t be available again.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
                <p className="text-sm text-muted-foreground">
                  We accept all major credit cards and payment methods through our secure payment
                  processor.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
