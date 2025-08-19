import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services(mock)/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { CreditCard, Check, Zap, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BillingSettings() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')

  const { data: organization, isLoading } = useQuery({
    queryKey: ['organization'],
    queryFn: () => api.getOrganizations().then((organizations) => organizations[0]),
  })

  const currentPlan = organization?.subscription?.plan || 'free'

  const plans = {
    free: {
      name: 'Free Tier',
      price: { monthly: 0, yearly: 0 },
      features: [
        '1 project',
        '1 active widget',
        'Up to 20 responses, bug reports, feature requests',
        'Public roadmap page',
      ],
    },
    pro: {
      name: 'Pro Plan',
      price: { monthly: 49, yearly: 490 },
      features: [
        '2 included projects',
        'Unlimited active widgets',
        'Unlimited responses, bug reports, feature requests',
        'Do follow backlink',
        'Public roadmap page',
        'Priority email support',
        'Branding removal',
        'Advanced targeting',
        '+$15/month per additional project',
      ],
    },
  }

  const handleUpgrade = () => {
    // This would typically open a payment modal or redirect to checkout
    console.log('Upgrade to Pro')
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Billing Settings</CardTitle>
            <CardDescription>Manage your subscription and billing preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-32 bg-muted animate-pulse rounded" />
            <div className="h-96 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const yearlyDiscount = Math.round(
    (1 - plans.pro.price.yearly / 12 / plans.pro.price.monthly) * 100
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing Settings
          </CardTitle>
          <CardDescription>Manage your subscription and billing preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <Label htmlFor="billing-cycle" className="text-base font-medium">
                Billing Cycle
              </Label>
              <Badge variant="secondary" className="text-green-600 bg-green-100 w-fit">
                Save {yearlyDiscount}%
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={cn(
                  'text-sm',
                  billingCycle === 'monthly' ? 'font-medium' : 'text-muted-foreground'
                )}
              >
                Monthly
              </span>
              <Switch
                id="billing-cycle"
                checked={billingCycle === 'yearly'}
                onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
              />
              <span
                className={cn(
                  'text-sm',
                  billingCycle === 'yearly' ? 'font-medium' : 'text-muted-foreground'
                )}
              >
                Yearly
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Current Plan</h3>
            <div className="flex items-center gap-2">
              <Badge variant={currentPlan === 'free' ? 'secondary' : 'default'}>
                {plans[currentPlan as keyof typeof plans].name}
              </Badge>
              {currentPlan === 'pro' && <Crown className="h-4 w-4 text-yellow-500" />}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Plan Comparison</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(plans).map(([planKey, plan]) => {
                const isCurrentPlan = currentPlan === planKey
                const isPro = planKey === 'pro'
                const price = plan.price[billingCycle]
                const monthlyPrice = billingCycle === 'yearly' ? price / 12 : price

                return (
                  <Card
                    key={planKey}
                    className={cn(
                      'relative',
                      isCurrentPlan && 'ring-2 ring-primary',
                      isPro && 'border-primary/50'
                    )}
                  >
                    {isPro && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{plan.name}</span>
                        {isCurrentPlan && <Badge variant="outline">Current</Badge>}
                      </CardTitle>
                      <div className="space-y-1">
                        <div className="text-3xl font-bold">
                          ${billingCycle === 'yearly' ? price : monthlyPrice}
                          <span className="text-base font-normal text-muted-foreground">
                            /{billingCycle === 'yearly' ? 'year' : 'month'}
                          </span>
                        </div>
                        {billingCycle === 'yearly' && price > 0 && (
                          <p className="text-sm text-muted-foreground">
                            ${monthlyPrice.toFixed(0)}/month billed yearly
                          </p>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {!isCurrentPlan && isPro && (
                        <Button onClick={handleUpgrade} className="w-full" size="lg">
                          <Zap className="mr-2 h-4 w-4" />
                          Upgrade Now
                        </Button>
                      )}

                      {isCurrentPlan && isPro && (
                        <Button variant="outline" className="w-full" size="lg" disabled>
                          Current Plan
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
