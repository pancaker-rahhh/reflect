import { useState } from 'react';
import { Check, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const navigate = useNavigate();

  const plans = {
    free: {
      name: 'Free',
      price: { monthly: '$0', annually: '$0' },
      description: 'Perfect for hobby projects & early-stage startups.',
      features: [
        'Manage 1 project',
        'Enable 1 active widget',
        '20 responses/month',
        '20 bug reports/month',
        '20 feature requests/month',
        'Public roadmap page',
      ],
      buttonText: 'Start for Free',
      primary: false,
    },
    pro: {
      name: 'Pro',
      price: { monthly: '$49', annually: '$490' },
      description: 'The ultimate toolkit for growing businesses.',
      features: [
        'Manage 2 projects',
        'Unlimited active widgets',
        'Unlimited responses',
        'Unlimited bug reports',
        'Unlimited feature requests',
        'Get a dofollow backlink',
        'Public roadmap page',
        'Priority email support',
        'Option to remove branding',
        'Advanced user targeting',
      ],
      buttonText: 'Start Your Free Trial',
      primary: true,
    },
  };

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <motion.div 
      id="pricing" 
      className="bg-white py-24 sm:py-32"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          className="mx-auto max-w-4xl text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.p 
            className="text-base font-semibold leading-7 text-purple-600"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Pricing
          </motion.p>
          <motion.h2 
            className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            The Right Plan for Your Needs
          </motion.h2>
          <motion.p 
            className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Start for free, and unlock more power as you grow. No hidden fees, ever.
          </motion.p>
        </motion.div>

          <motion.div 
            className="mt-16 flex justify-center items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <span
              className={`font-semibold transition-colors ${
                billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'
              }`}
            >
              Monthly
            </span>
            <motion.div
              className="relative rounded-full p-1 bg-gray-800 flex cursor-pointer w-14"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annually' : 'monthly')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                className="w-6 h-6 bg-white rounded-full shadow-md"
                animate={{ x: billingCycle === 'monthly' ? 0 : 28 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </motion.div>
            <span
              className={`font-semibold transition-colors ${
                billingCycle === 'annually' ? 'text-gray-900' : 'text-gray-500'
              }`}
            >
              Annually
            </span>
            <motion.span
              className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
              animate={{ 
                opacity: billingCycle === 'annually' ? 1 : 0,
                scale: billingCycle === 'annually' ? 1 : 0.8
              }}
              transition={{ duration: 0.3 }}
            >
              Get 2 months free!
            </motion.span>
          </motion.div>

        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          {Object.values(plans).map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`rounded-3xl p-8 xl:p-10 ${
                plan.primary ? 'bg-white ring-2 ring-purple-600 shadow-2xl relative' : 'bg-gray-50 ring-1 ring-gray-200'
              }`}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 + (index * 0.1) }}
              whileHover={{ 
                scale: 1.02,
                y: -5,
                transition: { duration: 0.2 }
              }}
              viewport={{ once: true }}
            >
              {plan.primary && (
                <motion.div
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + (index * 0.1) }}
                  viewport={{ once: true }}
                >
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    ⚡ Most Popular
                  </div>
                </motion.div>
              )}

              <motion.div 
                className="flex items-center justify-between gap-x-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.7 + (index * 0.1) }}
                viewport={{ once: true }}
              >
                <h3 className={`text-xl font-semibold leading-8 ${plan.primary ? 'text-purple-600' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                {plan.primary && (
                  <motion.p 
                    className="rounded-full bg-purple-600/10 px-3 py-1 text-sm font-semibold leading-5 text-purple-600 flex items-center gap-1"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.8 + (index * 0.1), type: "spring", stiffness: 200 }}
                    viewport={{ once: true }}
                  >
                    <Zap size={16} /> Most Popular
                  </motion.p>
                )}
              </motion.div>

              <motion.p 
                className="mt-4 text-base leading-7 text-gray-600"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + (index * 0.1) }}
                viewport={{ once: true }}
              >
                {plan.description}
              </motion.p>

              <motion.p 
                className="mt-6 flex items-baseline gap-x-1"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + (index * 0.1), type: "spring", stiffness: 200 }}
                viewport={{ once: true }}
              >
                <motion.span 
                  className="text-5xl font-bold tracking-tight text-gray-900"
                  key={billingCycle}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {plan.price[billingCycle]}
                </motion.span>
                <span className="text-sm font-semibold leading-6 text-gray-600">
                  {billingCycle === 'monthly' ? '/month' : '/year'}
                </span>
              </motion.p>

              <motion.button
                onClick={handleGetStarted}
                className={`mt-8 block rounded-md px-3 py-3 text-center text-base font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all ${
                  plan.primary
                    ? 'bg-purple-600 text-white shadow-sm hover:bg-purple-500 focus-visible:outline-purple-600'
                    : 'bg-white text-purple-600 ring-1 ring-inset ring-purple-200 hover:bg-purple-50'
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + (index * 0.1) }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                viewport={{ once: true }}
              >
                {plan.buttonText}
              </motion.button>

              <ul role="list" className="mt-8 space-y-4 text-base leading-6 text-gray-700 xl:mt-10">
                {plan.features.map((feature, featureIndex) => (
                  <motion.li 
                    key={feature} 
                    className="flex gap-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ 
                      delay: 1.1 + (index * 0.1) + (featureIndex * 0.05),
                      duration: 0.4
                    }}
                    viewport={{ once: true }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ 
                        delay: 1.2 + (index * 0.1) + (featureIndex * 0.05),
                        type: "spring",
                        stiffness: 200
                      }}
                      viewport={{ once: true }}
                    >
                      <Check className="h-6 w-5 flex-none text-purple-600" aria-hidden="true" />
                    </motion.div>
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
