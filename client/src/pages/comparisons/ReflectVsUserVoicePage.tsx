import { motion } from 'framer-motion'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { SEOHead } from '@/components/common/SEOHead'
import { usePageAnalytics } from '@/hooks/usePageAnalytics'
import { Link } from 'react-router-dom'
import { Check, X, ArrowRight } from 'lucide-react'

const comparisonData = [
  { feature: 'In-App Widget', reflect: true, uservoice: false },
  { feature: 'Screenshot Bug Reports', reflect: true, uservoice: false },
  { feature: '5-Minute Setup', reflect: true, uservoice: false },
  { feature: 'Free Plan', reflect: true, uservoice: false },
  { feature: 'Feature Voting', reflect: true, uservoice: true },
  { feature: 'Public Roadmap', reflect: true, uservoice: true },
  { feature: 'Lightweight (<50KB)', reflect: true, uservoice: false },
  { feature: 'Modern UI/UX', reflect: true, uservoice: false },
]

export default function ReflectVsUserVoicePage() {
  usePageAnalytics()

  return (
    <>
      <SEOHead
        title="Reflect vs UserVoice Best Alternative to UserVoice in 2025"
        description="Compare Reflect vs UserVoice for feedback management. See why Reflect's modern in-app widget, screenshot bug reports, and affordable pricing make it the best UserVoice alternative."
        keywords="reflect vs uservoice, uservoice alternative, feedback tool comparison, uservoice vs reflect"
        canonicalUrl="https://reflectfeedback.com/comparisons/reflect-vs-uservoice"
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
                Reflect vs UserVoice: Best Alternative to UserVoice in 2025
              </h1>
              <p className="text-lg sm:text-xl leading-8 text-muted-foreground">
                Looking for a UserVoice alternative? Compare Reflect's modern in-app feedback
                widget, screenshot bug reporting, and affordable pricing against UserVoice's
                enterprise-focused platform.
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
                  Overview of UserVoice
                </h2>
                <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
                  <p>
                    UserVoice is one of the oldest and most established feedback management
                    platforms, founded in 2008. It's designed primarily for enterprise teams that
                    need comprehensive feedback collection, feature request management, and customer
                    support integration.
                  </p>
                  <p>
                    UserVoice offers robust features including idea forums, feedback widgets, help
                    desk integration, and analytics. It's particularly strong in enterprise
                    environments where teams need advanced SSO, custom branding, and extensive API
                    access.
                  </p>
                  <p>
                    However, UserVoice's interface feels dated compared to modern alternatives, and
                    its pricing can be prohibitive for smaller teams. The platform also lacks native
                    in-app feedback collection and screenshot bug reporting capabilities that modern
                    SaaS teams need.
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
                            UserVoice
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
                              {row.uservoice ? (
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
                    <strong className="text-foreground">Modern, Lightweight Design:</strong> Reflect
                    offers a modern, intuitive interface that users actually enjoy using. Our widget
                    is lightweight (under 50KB) and doesn't slow down your application, unlike
                    UserVoice's heavier implementation.
                  </p>
                  <p>
                    <strong className="text-foreground">In-App Feedback Collection:</strong>{' '}
                    Reflect's native in-app widget lets users submit feedback directly inside your
                    product. UserVoice primarily relies on external portals and email, which creates
                    friction and reduces response rates.
                  </p>
                  <p>
                    <strong className="text-foreground">Screenshot Bug Reporting:</strong> Built-in
                    screenshot capture and annotation make bug reporting effortless. UserVoice
                    doesn't offer this capability, forcing teams to use separate tools.
                  </p>
                  <p>
                    <strong className="text-foreground">Affordable Pricing:</strong> Reflect starts
                    with a free plan and offers transparent, affordable pricing. UserVoice's
                    enterprise-focused pricing can cost hundreds of dollars per month, making it
                    inaccessible for many teams.
                  </p>
                  <p>
                    <strong className="text-foreground">Fast Setup:</strong> Get started with
                    Reflect in 5 minutes. UserVoice requires more configuration and setup time,
                    especially for enterprise deployments.
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
                        <span>You want modern, lightweight feedback collection</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>You need in-app feedback and bug reporting</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>You're looking for affordable pricing</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>You want fast setup and easy implementation</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-card rounded-xl p-6 border border-border">
                    <h3 className="text-xl font-bold text-foreground mb-4">Choose UserVoice If:</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>You need enterprise SSO and advanced security</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>You have a large budget ($400+/month)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>You need extensive help desk integration</span>
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
                  <p>Migrating from UserVoice to Reflect is straightforward:</p>
                  <ol className="list-decimal list-inside space-y-3 ml-4">
                    <li>Export your UserVoice data using their export feature</li>
                    <li>Sign up for Reflect and create your project</li>
                    <li>Import your top feature requests and feedback</li>
                    <li>Install Reflect's widget in your application</li>
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
                  Ready to Switch from UserVoice?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Experience modern feedback collection with Reflect. Start free today.
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
