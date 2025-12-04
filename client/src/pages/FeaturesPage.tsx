import { motion } from 'framer-motion'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { SEOHead } from '@/components/common/SEOHead'
import { MessageSquare, Bug, Lightbulb, Zap, BarChart3, Shield } from 'lucide-react'
import { usePageAnalytics } from '@/hooks/usePageAnalytics'

const features = [
  {
    icon: <MessageSquare className="h-8 w-8" />,
    title: 'Real-Time In-App Feedback',
    description:
      'Capture user feedback directly inside your application at the moment it happens. No context switching, no friction. Users can share their thoughts, suggestions, and concerns without leaving your product.',
  },
  {
    icon: <Bug className="h-8 w-8" />,
    title: 'Bug Reports with Screenshots',
    description:
      'Users can capture screenshots, annotate issues, and send detailed bug reports instantly. Automatic context collection includes browser info, console logs, and user actions to help your team reproduce and fix issues faster.',
  },
  {
    icon: <Lightbulb className="h-8 w-8" />,
    title: 'Feature Voting & Prioritization',
    description:
      'Let users vote on the features they want most. See which requests get the most traction, organize them automatically, and build what your customers actually need. Close the loop by updating users when features ship.',
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: 'Widgets & Customization',
    description:
      'Our lightweight feedback widget installs in minutes and blends seamlessly into your UI. Customize colors, position, fields, and categories to match your brand. Remove our branding on Pro plans.',
  },
  {
    icon: <BarChart3 className="h-8 w-8" />,
    title: 'Analytics & Insights',
    description:
      'Track feedback trends over time, filter by date ranges, and spot patterns in your dashboard. Understand what features matter most, identify common pain points, and make data-driven product decisions. This includes NPS, CSAT, and CES tracking to help SaaS teams understand satisfaction over time.',
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: 'Secure & Private',
    description:
      'Enterprise-grade security with data encryption, GDPR compliance, and SOC 2 certification. Your user feedback data stays private and secure. Control access with role-based permissions and team collaboration tools.',
  },
]

export default function FeaturesPage() {
  usePageAnalytics()

  return (
    <>
      <SEOHead
        title="SaaS Feedback Platform — Features | Reflect"
        description="See Reflect's features: in-app feedback widget, bug reporting with screenshots, feature voting, analytics, and public roadmap tools built for SaaS teams."
        keywords="in-app feedback tool, feedback features, bug reporting, feature requests, feedback widget, SaaS feedback, customer feedback tools"
        canonicalUrl="https://reflectfeedback.com/features"
        ogImage="https://reflectfeedback.com/og-image.png"
        schemaType="product"
        breadcrumbs={[
          { name: 'Home', url: 'https://reflectfeedback.com/' },
          { name: 'Features', url: 'https://reflectfeedback.com/features' },
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
                The Complete SaaS Feedback Platform
              </h1>
              <p className="mt-6 text-lg sm:text-xl leading-8 text-muted-foreground max-w-3xl mx-auto">
                Everything you need to collect, organize, and act on user feedback, all in one
                lightweight platform. No bloat, no complexity, just powerful tools that work.
                Reflect works as both a SaaS feedback platform and a customer feedback management
                system, helping product teams centralize user insights.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 text-primary">{feature.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
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
                Why Reflect Is the Complete SaaS Feedback Platform
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of SaaS teams using Reflect to build better products.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href="/login"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-xl hover:shadow-2xl"
                >
                  Get Started Free
                </motion.a>
                <motion.a
                  href="/"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl bg-background text-foreground hover:bg-muted transition-all duration-300 border-2 border-border hover:border-primary"
                >
                  Learn More
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
