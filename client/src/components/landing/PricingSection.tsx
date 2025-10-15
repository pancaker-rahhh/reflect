import { Check } from 'phosphor-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { PRICING_PLANS, formatPrice, getFeatureList } from '@/lib/constants/pricing'

export const PricingSection = () => {
  const navigate = useNavigate()

  // Get all 3 plans: Free, Pro Monthly, Pro Yearly
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
      buttonText: plan!.id === 'free' ? 'Start for Free' : 'Start Your Free Trial',
      primary: plan!.is_popular || false,
    }))

  const handleGetStarted = () => {
    navigate('/login')
  }

  return (
    <motion.div
      id="pricing"
      className="bg-background py-12 sm:py-16 lg:py-20"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
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
            className="mt-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[hsl(var(--foreground))] leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            The Right Plan for Your Needs
          </motion.h2>
          <motion.p
            className="mx-auto mt-6 sm:mt-8 max-w-3xl text-base sm:text-lg md:text-xl leading-7 sm:leading-8 text-[hsl(var(--muted-foreground))] px-4 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Start for free, and unlock more power as you grow. No hidden fees, ever.
          </motion.p>
        </motion.div>

  <div className="isolate mx-auto mt-8 sm:mt-12 grid max-w-6xl grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {displayPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 ${
                plan.primary || plan.id === 'pro_yearly'
                  ? 'bg-[hsl(var(--background))] ring-2 ring-[hsl(var(--primary))] shadow-2xl relative'
                  : 'bg-[hsl(var(--muted))/0.05] ring-1 ring-[hsl(var(--border))/0.3] shadow-xl'
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
                  className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg whitespace-nowrap">
                    ⚡ Most Popular
                  </div>
                </motion.div>
              )}

              {plan.id === 'pro_yearly' && (
                <motion.div
                  className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-green-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg whitespace-nowrap">
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
                  className={`text-xl sm:text-2xl font-bold leading-8 ${
                    plan.primary || plan.id === 'pro_yearly'
                      ? 'text-[hsl(var(--primary))]'
                      : 'text-[hsl(var(--foreground))]'
                  }`}
                >
                  {plan.display_name}
                </h3>
              </motion.div>

              <motion.p
                className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 text-[hsl(var(--muted-foreground))]"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                viewport={{ once: true }}
              >
                {plan.description}
              </motion.p>

              <motion.p
                className="mt-4 sm:mt-6 flex items-baseline gap-x-1"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + index * 0.1, type: 'spring', stiffness: 200 }}
                viewport={{ once: true }}
              >
                <span className="text-3xl sm:text-4xl font-bold tracking-tight text-[hsl(var(--foreground))]">
                  {plan.price}
                </span>
              </motion.p>

              <motion.button
                onClick={handleGetStarted}
                className={`mt-8 sm:mt-10 block w-full rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3 sm:py-4 text-center text-base sm:text-lg font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all ${
                  plan.primary || plan.id === 'pro_yearly'
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm hover:bg-red-600 focus-visible:outline-[hsl(var(--primary))]'
                    : 'bg-[hsl(var(--background))] text-[hsl(var(--primary))] ring-1 ring-inset ring-[hsl(var(--border))] hover:bg-gray-100 hover:text-red-600'
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                whileTap={{ scale: 0.98 }}
                viewport={{ once: true }}
              >
                {plan.buttonText}
              </motion.button>

              <ul
                role="list"
                className="mt-8 sm:mt-10 lg:mt-12 space-y-4 sm:space-y-5 text-base sm:text-lg leading-6 text-[hsl(var(--muted-foreground))]"
              >
                {plan.features.map((feature, featureIndex) => (
                  <motion.li
                    key={feature}
                    className="flex gap-x-3 sm:gap-x-4"
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
                      className="flex-shrink-0"
                    >
                      <Check
                        className="h-6 w-5 sm:h-7 sm:w-6 text-[hsl(var(--primary))]"
                        aria-hidden="true"
                      />
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
}
