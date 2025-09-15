'use client'

import { useState, useEffect, useCallback } from 'react'
import { Check, CreditCard, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { paymentApi, type PaymentPlan } from '@/lib/api/payment'
import { useAppContext } from '@/context/AppContext'
import { PaymentForm } from './PaymentForm'

interface PaymentPlansProps {
  onPlanSelect?: (plan: PaymentPlan) => void
  selectedPlanId?: string
}

export function PaymentPlans({ onPlanSelect: _onPlanSelect, selectedPlanId }: PaymentPlansProps) {
  const { currentOrganization } = useAppContext()
  const [plans, setPlans] = useState<PaymentPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)

  const fetchPlans = useCallback(async () => {
    if (!currentOrganization?.id) return

    try {
      setIsLoading(true)
      setError(null)
      const response = await paymentApi.getPaymentPlans(currentOrganization.id)
      setPlans(response.plans)

      // Auto-select if selectedPlanId is provided
      if (selectedPlanId) {
        const plan = response.plans.find((p) => p.id === selectedPlanId)
        if (plan) {
          setSelectedPlan(plan)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payment plans')
    } finally {
      setIsLoading(false)
    }
  }, [currentOrganization?.id, selectedPlanId])

  useEffect(() => {
    if (currentOrganization?.id) {
      fetchPlans()
    }
  }, [currentOrganization?.id, fetchPlans])

  const handleUpgrade = (plan: PaymentPlan) => {
    setSelectedPlan(plan)
    setShowPaymentForm(true)
  }

  const handlePaymentSuccess = (paymentLink: string) => {
    // Redirect to payment
    window.location.href = paymentLink
  }

  const handlePaymentError = (error: string) => {
    setError(error)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading payment plans...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (showPaymentForm && selectedPlan) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Complete Your Payment</h2>
          <p className="text-muted-foreground">Upgrade to {selectedPlan.display_name}</p>
        </div>

        <PaymentForm
          planId={selectedPlan.id}
          planName={selectedPlan.display_name}
          price={selectedPlan.price}
          currency={selectedPlan.currency}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />

        <div className="text-center">
          <Button variant="outline" onClick={() => setShowPaymentForm(false)}>
            Back to Plans
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Choose Your Plan</h2>
        <p className="text-muted-foreground mt-2">Select the plan that best fits your needs</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative transition-all duration-200 hover:shadow-lg ${
              selectedPlan?.id === plan.id ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
            }`}
          >
            {plan.id === 'pro_monthly' && (
              <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">Most Popular</Badge>
            )}

            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl">{plan.display_name}</CardTitle>
              <CardDescription className="text-sm">{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">
                  /{plan.interval === 'month' ? 'month' : 'year'}
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Features */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Features included:</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>
                      {plan.limits.projects === 999999 ? 'Unlimited' : plan.limits.projects}{' '}
                      Projects
                    </span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>
                      {plan.limits.widgets === 999999 ? 'Unlimited' : plan.limits.widgets} Widgets
                    </span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>
                      {plan.limits.responses === 999999 ? 'Unlimited' : plan.limits.responses}{' '}
                      Responses
                    </span>
                  </li>
                  {plan.features.advanced_targeting && (
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>Advanced Targeting</span>
                    </li>
                  )}
                  {plan.features.branding_removal && (
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>Remove Branding</span>
                    </li>
                  )}
                  {plan.features.priority_support && (
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>Priority Support</span>
                    </li>
                  )}
                  {plan.features.jira_integration && (
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>Jira Integration</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Action Button */}
              <Button className="w-full" onClick={() => handleUpgrade(plan)} disabled={isLoading}>
                <CreditCard className="mr-2 h-4 w-4" />
                {plan.id === 'free' ? 'Get Started' : 'Upgrade Now'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>All plans include a 7-day free trial.</p>
        <p>Cancel anytime before the trial ends, no hidden charges.</p>
      </div>
    </div>
  )
}
