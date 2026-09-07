import { memo } from 'react'
import { Check } from 'phosphor-react'
import { motion } from 'framer-motion'
import { Zap, Tag } from 'lucide-react'
import { PRICING_PLANS, formatPrice, getFeatureList } from '@/lib/constants/pricing'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const SUNSET_MSG = 'Reflect has been sunset and is no longer accepting new sign-ups.'

export const PricingSection = memo(() => {
  const displayPlans = [
    PRICING_PLANS.find((plan) => plan.id === 'free'),
    PRICING_PLANS.find((plan) => plan.id === 'pro_monthly'),
    PRICING_PLANS.find((plan) => plan.id === 'pro_yearly'),
  ]
    .filter(Boolean)
    .map((plan) => ({
      ...plan!,
      price:
        plan!.id === 'pro_yearly'
          ? formatPrice(plan!.price.yearly) + '/year'
          : formatPrice(plan!.price.monthly) + '/month',
      features: getFeatureList(plan!),
      buttonText: 'Get started',
      primary: plan!.is_popular || false,
    }))

  return (
    <motion.div
      id="pricing"
      className="bg-background py-12 sm:py-16 lg:py-20"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          <motion.p
            className="text-lg font-semibold leading-7 text-primary"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Pricing
          </motion.p>
          <motion.h2
            className="mt-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            viewport={{ once: true }}
          >
            Simple pricing.{' '}
            <em className="font-serif italic font-normal">No surprises.</em>
          </motion.h2>
          <motion.p
            className="mt-4 text-sm sm:text-base text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Kept here for reference — Reflect is no longer accepting new sign-ups.
          </motion.p>
        </motion.div>

        <div className="isolate mx-auto mt-8 sm:mt-12 grid max-w-6xl grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {displayPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 ${
                plan.primary || plan.id === 'pro_yearly'
                  ? 'bg-background ring-2 ring-primary shadow-2xl relative'
                  : 'bg-muted/5 ring-1 ring-border/30 shadow-xl'
              }`}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              whileHover={{
                scale: 1.02,
                y: -5,
                transition: { duration: 0.2 },
              }}
              viewport={{ once: true }}
            >
              {plan.id === 'pro_monthly' && (
                <motion.div
                  className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-primary text-primary-foreground px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg whitespace-nowrap">
                    <Zap size={14} className="inline mr-1" /> Most Popular
                  </div>
                </motion.div>
              )}

              {plan.id === 'pro_yearly' && (
                <motion.div
                  className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-green-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg whitespace-nowrap">
                    <Tag size={14} className="inline mr-1" /> 20% Off
                  </div>
                </motion.div>
              )}

              <motion.div
                className="flex items-center justify-between gap-x-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                viewport={{ once: true }}
              >
                <h3
                  className={`text-xl sm:text-2xl font-bold leading-8 ${
                    plan.primary || plan.id === 'pro_yearly' ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  {plan.display_name}
                </h3>
              </motion.div>

              <motion.p
                className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 text-muted-foreground"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                viewport={{ once: true }}
              >
                {plan.description}
              </motion.p>

              <motion.p
                className="mt-4 sm:mt-6 flex items-baseline gap-x-1"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                viewport={{ once: true }}
              >
                <span className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                  {plan.price}
                </span>
              </motion.p>

              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0} className="mt-8 sm:mt-10 block cursor-not-allowed">
                    <motion.button
                      disabled
                      aria-disabled="true"
                      className={`block w-full rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3 sm:py-4 text-center text-base sm:text-lg font-semibold leading-6 opacity-50 pointer-events-none transition-all ${
                        plan.primary || plan.id === 'pro_yearly'
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-background text-primary ring-1 ring-inset ring-border'
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 0.5, y: 0 }}
                      transition={{ delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      {plan.buttonText}
                    </motion.button>
                  </span>
                </TooltipTrigger>
                <TooltipContent className="bg-foreground text-background max-w-[220px] text-center">
                  {SUNSET_MSG}
                </TooltipContent>
              </Tooltip>

              <ul
                role="list"
                className="mt-8 sm:mt-10 lg:mt-12 space-y-4 sm:space-y-5 text-base sm:text-lg leading-6 text-muted-foreground"
              >
                {plan.features.map((feature, featureIndex) => (
                  <motion.li
                    key={feature}
                    className="flex gap-x-3 sm:gap-x-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: featureIndex * 0.04,
                      duration: 0.4,
                    }}
                    viewport={{ once: true }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{
                        delay: featureIndex * 0.04,
                        type: 'spring',
                        stiffness: 200,
                      }}
                      viewport={{ once: true }}
                      className="flex-shrink-0"
                    >
                      <Check className="h-6 w-5 sm:h-7 sm:w-6 text-primary" aria-hidden="true" />
                    </motion.div>
                    <span className="text-sm sm:text-base lg:text-lg">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
})

PricingSection.displayName = 'PricingSection'
