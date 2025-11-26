export interface PricingPlan {
  id: string
  name: string
  display_name: string
  price: {
    monthly: number
    yearly: number
  }
  currency: string
  interval: 'month' | 'year' | null
  interval_count: number | null
  trial_days: number
  limits: {
    projects: number
    widgets: number
    responses: number
    forms: number
    form_responses: number
    bug_reports: number
    feature_requests: number
  }
  features: {
    advanced_targeting: boolean
    branding_removal: boolean
    priority_support: boolean
    dofollow_backlink: boolean
    jira_integration: boolean
    public_roadmap: boolean
  }
  description: string
  is_active: boolean
  is_popular?: boolean
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'free',
    display_name: 'Free',
    price: { monthly: 0, yearly: 0 },
    currency: 'USD',
    interval: null,
    interval_count: null,
    trial_days: 0,
    limits: {
      projects: 1,
      widgets: 1,
      responses: 20,
      forms: 1,
      form_responses: 20,
      bug_reports: 0,
      feature_requests: 0,
    },
    features: {
      advanced_targeting: false,
      branding_removal: false,
      priority_support: false,
      dofollow_backlink: false,
      jira_integration: false,
      public_roadmap: true,
    },
    description: 'Perfect for hobby projects & early-stage startups.',
    is_active: true,
  },
  {
    id: 'pro_monthly',
    name: 'pro',
    display_name: 'Pro Monthly',
    price: { monthly: 9.99, yearly: 119.88 },
    currency: 'USD',
    interval: 'month',
    interval_count: 1,
    trial_days: 0,
    limits: {
      projects: 999999, // Unlimited
      widgets: 999999, // Unlimited
      responses: 999999, // Unlimited
      forms: 999999, // Unlimited
      form_responses: 999999, // Unlimited
      bug_reports: 999999, // Unlimited
      feature_requests: 999999, // Unlimited
    },
    features: {
      advanced_targeting: false,
      branding_removal: true,
      priority_support: true,
      dofollow_backlink: false,
      jira_integration: true,
      public_roadmap: true,
    },
    description: 'For teams ready to scale. Everything you need to turn feedback into growth.',
    is_active: true,
    is_popular: true,
  },
  {
    id: 'pro_yearly',
    name: 'pro',
    display_name: 'Pro Yearly',
    price: { monthly: 8.33, yearly: 99.99 }, // ~2 months free
    currency: 'USD',
    interval: 'year',
    interval_count: 1,
    trial_days: 0,
    limits: {
      projects: 999999, // Unlimited
      widgets: 999999, // Unlimited
      responses: 999999, // Unlimited
      forms: 999999, // Unlimited
      form_responses: 999999, // Unlimited
      bug_reports: 999999, // Unlimited
      feature_requests: 999999, // Unlimited
    },
    features: {
      advanced_targeting: false,
      branding_removal: true,
      priority_support: true,
      dofollow_backlink: false,
      jira_integration: true,
      public_roadmap: true,
    },
    description: 'For serious builders. Same power, better value. Save $19.89/year.',
    is_active: true,
    is_popular: false,
  },
]

// Helper functions
export const getPlanById = (id: string): PricingPlan | undefined => {
  return PRICING_PLANS.find((plan) => plan.id === id)
}

export const getActivePlans = (): PricingPlan[] => {
  return PRICING_PLANS.filter((plan) => plan.is_active)
}

export const getPaidPlans = (): PricingPlan[] => {
  return PRICING_PLANS.filter((plan) => plan.price.monthly > 0 && plan.is_active)
}

export const getFreePlan = (): PricingPlan | undefined => {
  return PRICING_PLANS.find((plan) => plan.id === 'free')
}

export const getPopularPlan = (): PricingPlan | undefined => {
  return PRICING_PLANS.find((plan) => plan.is_popular)
}

// Format price for display
export const formatPrice = (price: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price)
}

// Calculate yearly discount percentage
export const calculateYearlyDiscount = (monthlyPrice: number, yearlyPrice: number): number => {
  const monthlyYearly = yearlyPrice / 12
  return Math.round((1 - monthlyYearly / monthlyPrice) * 100)
}

// Get feature list for display
export const getFeatureList = (plan: PricingPlan): string[] => {
  const features: string[] = []

  // Basic limits (all plans)
  if (plan.limits.projects === 999999) {
    features.push('Unlimited projects')
  } else {
    features.push(`${plan.limits.projects} project${plan.limits.projects > 1 ? 's' : ''}`)
  }

  if (plan.limits.widgets === 999999) {
    features.push('Unlimited active widgets')
  } else {
    features.push(`${plan.limits.widgets} active widget${plan.limits.widgets > 1 ? 's' : ''}`)
  }

  if (plan.limits.responses === 999999) {
    features.push('Unlimited responses')
  } else {
    features.push(`${plan.limits.responses} responses/month`)
  }

  // Pro-only features
  if (plan.features.priority_support) {
    features.push('Priority email support')
  }

  if (plan.features.jira_integration) {
    features.push('JIRA integration')
  }

  if (plan.features.branding_removal) {
    features.push('Remove Reflect branding')
  }

  if (plan.features.public_roadmap) {
    features.push('Public roadmap page')
  }

  return features
}
