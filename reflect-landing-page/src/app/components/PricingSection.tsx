"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";

// Import pricing data from the main app
// Note: In a real setup, this should be shared via a package or API
const PRICING_PLANS = [
  {
    id: "free",
    name: "free",
    display_name: "Free",
    price: { monthly: 0, yearly: 0 },
    currency: "USD",
    description: "Perfect for hobby projects & early-stage startups.",
    features: [
      "Manage 1 project",
      "Enable 1 active widget",
      "20 responses/month",
      "20 bug reports/month",
      "20 feature requests/month",
      "Public roadmap page",
    ],
    is_active: true,
    is_popular: false,
  },
  {
    id: "pro_monthly",
    name: "pro",
    display_name: "Pro Monthly",
    price: { monthly: 29, yearly: 290 },
    currency: "USD",
    description: "The ultimate toolkit for growing businesses.",
    features: [
      "Unlimited projects",
      "Unlimited active widgets",
      "Unlimited responses",
      "Unlimited bug reports",
      "Unlimited feature requests",
      "Get a dofollow backlink",
      "Public roadmap page",
      "Priority email support",
      "Option to remove branding",
      "Advanced user targeting",
      "JIRA integration",
    ],
    is_active: true,
    is_popular: true,
  },
  {
    id: "pro_yearly",
    name: "pro",
    display_name: "Pro Yearly",
    price: { monthly: 24.17, yearly: 290 },
    currency: "USD",
    description: "Unlimited everything, billed yearly (2 months free).",
    features: [
      "Unlimited projects",
      "Unlimited active widgets",
      "Unlimited responses",
      "Unlimited bug reports",
      "Unlimited feature requests",
      "Get a dofollow backlink",
      "Public roadmap page",
      "Priority email support",
      "Option to remove branding",
      "Advanced user targeting",
      "JIRA integration",
    ],
    is_active: true,
    is_popular: false,
  },
];

const formatPrice = (price: number, currency: string = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(price);
};

const PricingSection = () => {
  // Get all 3 plans: Free, Pro Monthly, Pro Yearly
  const displayPlans = [
    PRICING_PLANS.find((plan) => plan.id === "free"),
    PRICING_PLANS.find((plan) => plan.id === "pro_monthly"),
    PRICING_PLANS.find((plan) => plan.id === "pro_yearly"),
  ]
    .filter(Boolean)
    .map((plan) => ({
      ...plan!,
      price:
        plan!.id === "pro_yearly"
          ? formatPrice(plan!.price.yearly) + "/year"
          : formatPrice(plan!.price.monthly) + "/month",
      buttonText:
        plan!.id === "free" ? "Start for Free" : "Start Your Free Trial",
      primary: plan!.is_popular || false,
    }));

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
            Start for free, and unlock more power as you grow. No hidden fees,
            ever.
          </motion.p>
        </motion.div>

        <div className="isolate mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
          {displayPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`rounded-3xl p-8 xl:p-10 ${
                plan.primary || plan.id === "pro_yearly"
                  ? "bg-white ring-2 ring-purple-600 shadow-2xl relative"
                  : "bg-gray-50 ring-1 ring-gray-200"
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
              {plan.id === "pro_monthly" && (
                <motion.div
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    ⚡ Most Popular
                  </div>
                </motion.div>
              )}

              {plan.id === "pro_yearly" && (
                <motion.div
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
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
                    plan.primary || plan.id === "pro_yearly"
                      ? "text-purple-600"
                      : "text-gray-900"
                  }`}
                >
                  {plan.display_name}
                </h3>
              </motion.div>

              <motion.p
                className="mt-4 text-base leading-7 text-gray-600"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                viewport={{ once: true }}
              >
                {plan.description}
              </motion.p>

              <motion.p
                className="mt-6 flex items-baseline gap-x-1"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.9 + index * 0.1,
                  type: "spring",
                  stiffness: 200,
                }}
                viewport={{ once: true }}
              >
                <span className="text-3xl font-bold tracking-tight text-gray-900">
                  {plan.price}
                </span>
              </motion.p>

              <motion.button
                className={`mt-8 block rounded-md px-3 py-3 text-center text-base font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all ${
                  plan.primary || plan.id === "pro_yearly"
                    ? "bg-purple-600 text-white shadow-sm hover:bg-purple-500 focus-visible:outline-purple-600"
                    : "bg-white text-purple-600 ring-1 ring-inset ring-purple-200 hover:bg-purple-50"
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                viewport={{ once: true }}
              >
                {plan.buttonText}
              </motion.button>

              <ul
                role="list"
                className="mt-8 space-y-4 text-base leading-6 text-gray-700 xl:mt-10"
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
                        type: "spring",
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
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default PricingSection;
