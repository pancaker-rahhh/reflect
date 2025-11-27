import { motion } from 'framer-motion'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { SEOHead } from '@/components/common/SEOHead'
import { usePageAnalytics } from '@/hooks/usePageAnalytics'
import { Link } from 'react-router-dom'
import { Check, X, ArrowRight } from 'lucide-react'

const comparisonData = [
  { feature: 'In-App Widget', reflect: true, productboard: false },
  { feature: 'Screenshot Bug Reports', reflect: true, productboard: false },
  { feature: 'Free Plan', reflect: true, productboard: false },
  { feature: 'Feature Voting', reflect: true, productboard: true },
  { feature: 'Public Roadmap', reflect: true, productboard: true },
  { feature: 'Lightweight', reflect: true, productboard: false },
  { feature: '5-Minute Setup', reflect: true, productboard: false },
  { feature: 'Affordable Pricing', reflect: true, productboard: false },
]

export default function ReflectVsProductBoardPage() {
  usePageAnalytics()

  return (
    <>
      <SEOHead
        title="Reflect vs Productboard – Best Alternative to Productboard in 2025"
        description="Compare Reflect vs Productboard for product management. See why Reflect's in-app widget, bug reporting, and affordable pricing make it the best Productboard alternative."
        keywords="reflect vs productboard, productboard alternative, product management tool comparison"
        canonicalUrl="https://reflectfeedback.com/comparisons/reflect-vs-productboard"
        ogImage="https://reflectfeedback.com/og-image.png"
        schemaType="default"
      />
      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-primary/3 to-background py-16 sm:py-20 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              className="mx-auto max-w-4xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6">
                Reflect vs Productboard: Best Alternative to Productboard in 2025
              </h1>
              <p className="text-lg sm:text-xl leading-8 text-muted-foreground">
                Compare Reflect's comprehensive feedback platform with Productboard's enterprise
                product management tool. See why Reflect offers better value with in-app feedback
                and affordable pricing.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                  Overview of Productboard
                </h2>
                <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
                  <p>
                    Productboard is an enterprise product management platform that helps product
                    teams understand user needs, prioritize features, and align around product
                    strategy. It's designed for large organizations with complex product management
                    workflows.
                  </p>
                  <p>
                    Productboard offers comprehensive features including user research management,
                    feature prioritization frameworks, roadmap planning, and integration with
                    development tools. It's particularly strong for teams that need advanced
                    prioritization methodologies and enterprise-level collaboration.
                  </p>
                  <p>
                    However, Productboard is expensive (starting at $20/user/month), lacks native
                    in-app feedback collection, and doesn't offer bug reporting capabilities. It's
                    also complex to set up and may be overkill for smaller teams that just need to
                    collect and manage user feedback.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                  Feature Comparison
                </h2>
                <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                            Feature
                          </th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                            Reflect
                          </th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                            Productboard
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {comparisonData.map((row, index) => (
                          <tr key={index} className="hover:bg-muted/50 transition-colors">
                            <td className="px-6 py-4 text-sm text-foreground">{row.feature}</td>
                            <td className="px-6 py-4 text-center">
                              {row.reflect ? (
                                <Check className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-red-500 mx-auto" />
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {row.productboard ? (
                                <Check className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-red-500 mx-auto" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                  Strengths of Reflect
                </h2>
                <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
                  <p>
                    <strong className="text-foreground">Affordable Pricing:</strong> Reflect starts
                    with a free plan and offers transparent, affordable pricing. Productboard's
                    pricing starts at $20/user/month, which can cost thousands of dollars for larger
                    teams.
                  </p>
                  <p>
                    <strong className="text-foreground">In-App Feedback Collection:</strong>{' '}
                    Reflect's native widget lets users submit feedback directly inside your
                    application. Productboard relies on integrations and external portals, creating
                    friction.
                  </p>
                  <p>
                    <strong className="text-foreground">Bug Reporting:</strong> Built-in screenshot
                    capture and bug reporting make Reflect a complete solution. Productboard doesn't
                    offer bug reporting capabilities.
                  </p>
                  <p>
                    <strong className="text-foreground">Fast Setup:</strong> Get started with
                    Reflect in 5 minutes. Productboard requires extensive setup and configuration,
                    especially for enterprise deployments.
                  </p>
                  <p>
                    <strong className="text-foreground">Focused on Feedback:</strong> Reflect is
                    purpose-built for feedback collection and management. Productboard is a
                    comprehensive product management platform that may include features you don't
                    need.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                  Who Should Choose Which Tool?
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-card rounded-xl p-6 border border-border">
                    <h3 className="text-xl font-bold text-foreground mb-4">Choose Reflect If:</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>You need in-app feedback and bug reporting</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>You want affordable, transparent pricing</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>You need fast setup and easy implementation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>You're focused on feedback collection</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-card rounded-xl p-6 border border-border">
                    <h3 className="text-xl font-bold text-foreground mb-4">
                      Choose Productboard If:
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>You need comprehensive product management</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>You have a large budget ($20+/user/month)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>You need advanced prioritization frameworks</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                  Migration Steps to Reflect
                </h2>
                <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
                  <p>Migrating from Productboard to Reflect:</p>
                  <ol className="list-decimal list-inside space-y-3 ml-4">
                    <li>Export your Productboard insights and feature requests</li>
                    <li>Sign up for Reflect and create your project</li>
                    <li>Import your feature requests and user feedback</li>
                    <li>Install Reflect's widget for in-app feedback</li>
                    <li>Update your public roadmap and notify users</li>
                  </ol>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20 text-center"
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                  Ready to Switch from Productboard?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Get better value with Reflect's focused feedback platform. Start free today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-xl hover:shadow-2xl"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/features"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl bg-background text-foreground hover:bg-muted transition-all duration-300 border-2 border-border hover:border-primary"
                  >
                    View Features
                  </Link>
                  <Link
                    to="/pricing"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl bg-background text-foreground hover:bg-muted transition-all duration-300 border-2 border-border hover:border-primary"
                  >
                    See Pricing
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
