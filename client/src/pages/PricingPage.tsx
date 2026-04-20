import { motion } from 'framer-motion'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { SEOHead } from '@/components/common/SEOHead'
import { PricingSection } from '@/components/landing/PricingSection'
import { Zap, Shield, HeadphonesIcon } from 'lucide-react'
import { usePageAnalytics } from '@/hooks/usePageAnalytics'
import { Link } from 'react-router-dom'

const faqs = [
  {
    question: 'Is there a free plan?',
    answer:
      'Yes! Our free plan includes 1 widget, 1 form, and 20 responses per month. Perfect for getting started and testing Reflect with your team.',
  },
  {
    question: 'Can I change plans later?',
    answer:
      'Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we prorate any charges.',
  },
  {
    question: 'Do you offer annual billing?',
    answer:
      'Yes! Annual plans save you 20% compared to monthly billing. Perfect for teams who want to commit and save.',
  },
  {
    question: 'What happens if I exceed my plan limits?',
    answer:
      "We'll notify you when you approach your limits. You can upgrade your plan at any time to continue collecting feedback without interruption.",
  },
  {
    question: 'Is there a setup fee?',
    answer: 'No setup fees, ever. Just simple, transparent pricing. No hidden costs, no surprises.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      'Yes, you can cancel your subscription at any time. Your account will remain active until the end of your billing period.',
  },
]

const benefits = [
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Fast Setup',
    description: 'Get started in 5 minutes. No complicated configuration, no bloat.',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Secure & Private',
    description: 'Enterprise-grade security. Your data stays private and secure.',
  },
  {
    icon: <HeadphonesIcon className="h-6 w-6" />,
    title: 'Support Included',
    description: 'Get help when you need it. Email support included with all plans.',
  },
]

export default function PricingPage() {
  usePageAnalytics()

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Reflect - In-App Feedback Platform',
    description:
      'Complete SaaS feedback platform with in-app feedback widgets, bug reporting, feature request voting, and NPS/CSAT/CES surveys',
    brand: {
      '@type': 'Brand',
      name: 'Reflect',
    },
    offers: {
      '@type': 'AggregateOffer',
      offerCount: '3',
      lowPrice: '0',
      highPrice: '99',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: 'https://reflectfeedback.com/pricing',
    },
  }

  return (
    <>
      <SEOHead
        title="Feedback Tool Pricing - Plans for Teams | Reflect"
        description="Transparent pricing for Reflect - free and team plans for in-app feedback, bug reporting, and feature voting. No setup fees. Compare plans and features."
        keywords="SaaS feedback platform pricing, in-app feedback tool pricing, feedback widget pricing, bug reporting tool pricing, feature request tool pricing, NPS survey pricing"
        canonicalUrl="https://reflectfeedback.com/pricing"
        ogImage="https://reflectfeedback.com/og-image.png"
        schemaType="pricing"
        structuredData={[faqSchema, productSchema]}
        breadcrumbs={[
          { name: 'Home', url: 'https://reflectfeedback.com/' },
          { name: 'Pricing', url: 'https://reflectfeedback.com/pricing' },
        ]}
      />
      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-primary/3 to-background py-16 sm:py-20 lg:py-24">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              className="mx-auto max-w-4xl text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6">
                Simple, Transparent Pricing for SaaS Feedback Tools
              </h1>
              <p className="mt-6 text-lg sm:text-xl leading-8 text-muted-foreground max-w-3xl mx-auto">
                No setup fees, no hidden costs, no surprises. Choose the plan that works for your
                team. Start free, upgrade when you're ready. Reflect offers affordable pricing for
                in-app feedback collection, bug reporting, and feature request management.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <PricingSection />

        {/* Benefits Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                  Everything You Need to Get Started
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  All plans include access to our complete SaaS feedback platform with in-app
                  feedback widgets, bug reporting tools, and feature request voting. Learn more
                  about our{' '}
                  <Link to="/features" className="text-primary hover:underline">
                    features
                  </Link>{' '}
                  and{' '}
                  <Link to="/feedback-widget" className="text-primary hover:underline">
                    feedback widget
                  </Link>{' '}
                  capabilities.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-card rounded-xl p-6 border border-border text-center"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                      {benefit.icon}
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                  Frequently Asked Questions
                </h2>
              </motion.div>

              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                    viewport={{ once: true }}
                    className="bg-card rounded-xl p-6 border border-border"
                  >
                    <h3 className="text-xl font-bold text-foreground mb-3">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
