import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { organizationApi } from '@/lib/api/organization'
import { upgradeApi } from '@/lib/api/upgrade'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Check, Zap, Crown } from 'lucide-react'
import { PRICING_PLANS, formatPrice, getFeatureList } from '@/lib/constants/pricing'
import { motion } from 'framer-motion'

export function BillingSettings() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const [isVerifying, setIsVerifying] = useState(false)

  const {
    data: organizations,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['organizations', 'my'],
    queryFn: () => organizationApi.getMy(),
  })

  const organization = organizations?.[0]

  const upgradeMutation = useMutation({
    mutationFn: upgradeApi.upgradeToPro,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
    },
  })

  const currentPlan = organization?.subscription_plan || 'free'

  // Handle payment success verification
  useEffect(() => {
    if (location.state?.paymentSuccess) {
      setIsVerifying(true)
      // Refetch organization data to get updated subscription status
      refetch().then(() => {
        setIsVerifying(false)
      })
    }
  }, [location.state?.paymentSuccess, refetch])

  // Get all 3 plans: Free, Pro Monthly, Pro Yearly
  const plans = [
    PRICING_PLANS.find((plan) => plan.id === 'free'),
    PRICING_PLANS.find((plan) => plan.id === 'pro_monthly'),
    PRICING_PLANS.find((plan) => plan.id === 'pro_yearly'),
  ]
    .filter(Boolean)
    .map((plan) => ({
      ...plan!,
      features: getFeatureList(plan!),
    }))

  const handleUpgrade = () => {
    navigate('/app/settings/billing-new')
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Billing Settings</CardTitle>
            <CardDescription>Manage your subscription preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-32 bg-muted animate-pulse rounded" />
            <div className="h-96 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing Settings
          </CardTitle>
          <CardDescription>Manage your subscription preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Current Plan</h3>
            <div className="flex items-center gap-2">
              {isVerifying ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  <span className="text-sm text-muted-foreground">Verifying plan status...</span>
                </div>
              ) : (
                <>
                  <Badge variant={currentPlan === 'free' ? 'secondary' : 'default'}>
                    {plans.find((p) => p.id === currentPlan)?.display_name || 'Free'}
                  </Badge>
                  {(currentPlan === 'pro' ||
                    currentPlan === 'pro_monthly' ||
                    currentPlan === 'pro_yearly') && <Crown className="h-4 w-4 text-yellow-500" />}
                  {location.state?.paymentSuccess && (
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800 border-green-200"
                    >
                      ✓ Payment Successful
                    </Badge>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Available Plans</h3>
            <div className="isolate mx-auto grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
              {plans.map((plan, index) => {
                const isCurrentPlan = currentPlan === plan.id
                const isPro = plan.id.includes('pro')
                const price =
                  plan.id === 'pro_yearly'
                    ? formatPrice(plan.price.yearly) + '/year'
                    : formatPrice(plan.price.monthly) + '/month'

                return (
                  <motion.div
                    key={plan.id}
                    className={`rounded-3xl p-6 xl:p-6 ${
                      isCurrentPlan
                        ? 'bg-white ring-2 ring-purple-600 relative'
                        : isPro
                          ? 'bg-white ring-2 ring-purple-600 shadow-2xl relative'
                          : 'bg-gray-50 ring-1 ring-gray-200'
                    }`}
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                    whileHover={{
                      scale: 1.02,
                      y: -5,
                      transition: { duration: 0.2 },
                    }}
                    viewport={{ once: true }}
                  >
                    {plan.id === 'pro_monthly' && (
                      <motion.div
                        className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                          ⚡ Most Popular
                        </div>
                      </motion.div>
                    )}

                    {plan.id === 'pro_yearly' && (
                      <motion.div
                        className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <div className="bg-gradient-to-r from-green-500 to-emerald-900 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                          💰 10% Off
                        </div>
                      </motion.div>
                    )}

                    <motion.div
                      className="flex items-center justify-between gap-x-4"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <h3
                        className={`text-xl font-semibold leading-8 ${
                          isCurrentPlan || isPro ? 'text-purple-600' : 'text-gray-900'
                        }`}
                      >
                        {plan.display_name}
                      </h3>
                      {isCurrentPlan && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Current
                        </Badge>
                      )}
                    </motion.div>

                    <motion.p
                      className="mt-3 text-base leading-6 text-gray-600"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      {plan.description}
                    </motion.p>

                    <motion.p
                      className="mt-4 flex items-baseline gap-x-1"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 + index * 0.1, type: 'spring', stiffness: 200 }}
                      viewport={{ once: true }}
                    >
                      <span className="text-3xl font-bold tracking-tight text-gray-900">
                        {price}
                      </span>
                    </motion.p>

                    {plan.id === 'pro_yearly' && (
                      <motion.p
                        className="mt-2 text-sm text-muted-foreground"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 1 + index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        {formatPrice(plan.price.yearly / 12)}/month billed yearly
                      </motion.p>
                    )}

                    {!isCurrentPlan && isPro && (
                      <motion.button
                        onClick={handleUpgrade}
                        className={`mt-4 block rounded-md px-3 py-3 text-center text-base font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all ${
                          isPro
                            ? 'bg-purple-600 text-white shadow-sm hover:bg-purple-500 focus-visible:outline-purple-600'
                            : 'bg-white text-purple-600 ring-1 ring-inset ring-purple-200 hover:bg-purple-50'
                        }`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 + index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        viewport={{ once: true }}
                        disabled={upgradeMutation.isPending}
                      >
                        <Zap className="inline mr-2 h-4 w-4" />
                        {upgradeMutation.isPending ? 'Upgrading...' : 'Upgrade Now'}
                      </motion.button>
                    )}

                    {isCurrentPlan && isPro && (
                      <motion.button
                        className="mt-6 block rounded-md px-3 py-3 text-center text-base font-semibold leading-6 bg-gray-100 text-gray-500 cursor-not-allowed"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 + index * 0.1 }}
                        viewport={{ once: true }}
                        disabled
                      >
                        Current Plan
                      </motion.button>
                    )}

                    <ul
                      role="list"
                      className="mt-6 space-y-3 text-base leading-6 text-gray-700 xl:mt-8"
                    >
                      {plan.features.map((feature, featureIndex) => (
                        <motion.li
                          key={feature}
                          className="flex gap-x-3"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: 1.1 + index * 0.1 + featureIndex * 0.05,
                            duration: 0.4,
                          }}
                          viewport={{ once: true }}
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            transition={{
                              delay: 1.2 + index * 0.1 + featureIndex * 0.05,
                              type: 'spring',
                              stiffness: 200,
                            }}
                            viewport={{ once: true }}
                          >
                            <Check
                              className="h-6 w-5 flex-none text-purple-600"
                              aria-hidden="true"
                            />
                          </motion.div>
                          {feature}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
