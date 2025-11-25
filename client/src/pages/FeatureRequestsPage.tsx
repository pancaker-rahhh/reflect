import { motion } from 'framer-motion'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { SEOHead } from '@/components/common/SEOHead'
import { ThumbsUp, List, CheckCircle2, MessageSquare, TrendingUp, Users } from 'lucide-react'
import { usePageAnalytics } from '@/hooks/usePageAnalytics'

const features = [
  {
    icon: <ThumbsUp className="h-8 w-8" />,
    title: 'Voting & Prioritization',
    description:
      'Let users vote on the features they want most. See which requests get the most traction and prioritize your roadmap based on real user demand, not assumptions.',
  },
  {
    icon: <List className="h-8 w-8" />,
    title: 'Roadmap Alignment',
    description:
      "Connect feature requests to your public roadmap. Show users what you're building and when. Build trust by being transparent about your product direction.",
  },
  {
    icon: <CheckCircle2 className="h-8 w-8" />,
    title: 'Closing the Loop',
    description:
      'Update users when features ship. Notify voters when their requested features go live. Build a community of engaged users who feel heard and valued.',
  },
]

const benefits = [
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: 'Build What Users Want',
    description:
      'Stop guessing. See exactly which features get the most votes and build what your customers actually need.',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Engage Your Community',
    description:
      'Let users participate in your product development. Engaged users become advocates and stay longer.',
  },
  {
    icon: <MessageSquare className="h-6 w-6" />,
    title: 'Reduce Support Tickets',
    description:
      'When users can submit and vote on features, they feel heard. Fewer "when will you add X?" support requests.',
  },
]

export default function FeatureRequestsPage() {
  usePageAnalytics()

  return (
    <>
      <SEOHead
        title="Reflect Feature Request Tool – Prioritize What Matters"
        description="Collect, organize, and prioritize feature requests. Let users vote, connect to your roadmap, and close the loop when features ship. Start free."
        keywords="feature request tool, feature voting, feature requests, product roadmap, feature prioritization, user feedback"
        canonicalUrl="https://reflectfeedback.com/feature-requests"
        ogImage="https://reflectfeedback.com/og-image.png"
        schemaType="product"
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
                Collect, Organize, and Prioritize Feature Requests
              </h1>
              <p className="mt-6 text-lg sm:text-xl leading-8 text-muted-foreground max-w-3xl mx-auto">
                Let users vote on the features they want most. Connect requests to your roadmap and
                close the loop when features ship. Build what your customers actually need.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="flex-shrink-0 text-primary mb-4">{feature.icon}</div>
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

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
                  Why Feature Requests Matter
                </h2>
                <p className="text-lg text-muted-foreground">
                  When users can submit and vote on features, you build better products and stronger
                  relationships with your customers.
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

        {/* CTA Section */}
        <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-primary/5 to-background relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Start Collecting Feature Requests Today
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Build what your users actually want. Join teams using Reflect to prioritize features
                based on real demand.
              </p>
              <motion.a
                href="/login"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                Get Started Free
              </motion.a>
            </motion.div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
