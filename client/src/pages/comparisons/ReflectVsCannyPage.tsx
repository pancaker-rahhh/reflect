import { motion } from 'framer-motion'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { SEOHead } from '@/components/common/SEOHead'
import { usePageAnalytics } from '@/hooks/usePageAnalytics'
import { Link } from 'react-router-dom'
import { Check, X, ArrowRight } from 'lucide-react'

const comparisonData = [
  { feature: 'In-App Widget', reflect: true, canny: false },
  { feature: 'Screenshot Bug Reports', reflect: true, canny: false },
  { feature: '5-Minute Setup', reflect: true, canny: false },
  { feature: 'Free Plan Available', reflect: true, canny: false },
  { feature: 'Feature Voting', reflect: true, canny: true },
  { feature: 'Public Roadmap', reflect: true, canny: true },
  { feature: 'Lightweight (<50KB)', reflect: true, canny: false },
  { feature: 'Custom Branding', reflect: true, canny: true },
]

export default function ReflectVsCannyPage() {
  usePageAnalytics()

  return (
    <>
      <SEOHead
        title="Reflect vs Canny – Best Alternative to Canny in 2025"
        description="Compare Reflect vs Canny for feedback management. See why Reflect's in-app widget, screenshot bug reports, and 5-minute setup make it the best Canny alternative. Start free."
        keywords="reflect vs canny, canny alternative, feedback tool comparison, canny vs reflect, user feedback tool"
        canonicalUrl="https://reflectfeedback.com/comparisons/reflect-vs-canny"
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
                Reflect vs Canny: Best Alternative to Canny in 2025
              </h1>
              <p className="text-lg sm:text-xl leading-8 text-muted-foreground">
                Looking for a Canny alternative? Compare Reflect's in-app feedback widget,
                screenshot bug reporting, and lightning-fast setup against Canny's feature request
                management.
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
                  Overview of Canny
                </h2>
                <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
                  <p>
                    Canny is a popular feature request management tool that helps product teams
                    collect, organize, and prioritize user feedback. Founded in 2017, Canny has
                    built a strong reputation for helping companies manage feature requests through
                    voting boards and public roadmaps.
                  </p>
                  <p>
                    Canny excels at creating beautiful public-facing boards where users can submit
                    and vote on feature requests. It integrates well with popular tools like Slack,
                    Intercom, and Zendesk, making it easy to sync feedback from multiple channels.
                  </p>
                  <p>
                    However, Canny primarily focuses on feature requests and lacks native in-app
                    feedback collection. Teams often need to use Canny alongside other tools for bug
                    reporting, surveys, and in-app feedback, which can fragment the feedback
                    collection process.
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
                            Canny
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
                              {row.canny ? (
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
                    <strong className="text-foreground">In-App Feedback Collection:</strong> Unlike
                    Canny, Reflect provides a native in-app feedback widget that lets users submit
                    feedback, bug reports, and feature requests directly inside your application. No
                    context switching, no friction—users can share their thoughts at the moment they
                    have them.
                  </p>
                  <p>
                    <strong className="text-foreground">Screenshot Bug Reporting:</strong> Reflect
                    includes built-in screenshot capture and annotation tools, making it easy for
                    users to report bugs with visual context. Canny doesn't offer this capability,
                    forcing teams to use separate bug tracking tools.
                  </p>
                  <p>
                    <strong className="text-foreground">Lightning-Fast Setup:</strong> Reflect
                    installs in 5 minutes with a single script tag. No complex configuration, no
                    dependencies. Canny requires more setup time and integration work to connect
                    with your existing tools.
                  </p>
                  <p>
                    <strong className="text-foreground">All-in-One Solution:</strong> Reflect
                    combines feature requests, bug reports, surveys, and feedback collection in one
                    platform. With Canny, you'll likely need additional tools for comprehensive
                    feedback management.
                  </p>
                  <p>
                    <strong className="text-foreground">Free Plan:</strong> Reflect offers a
                    generous free plan that lets you get started immediately. Canny's pricing starts
                    at $99/month, which can be prohibitive for smaller teams.
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
                        <span>You want in-app feedback collection</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>You need screenshot bug reporting</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>You want a fast, lightweight solution</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>You need an all-in-one feedback platform</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>You're on a budget or just getting started</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-card rounded-xl p-6 border border-border">
                    <h3 className="text-xl font-bold text-foreground mb-4">Choose Canny If:</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>You only need feature request management</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>You have a large budget ($99+/month)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>You need advanced SSO and enterprise features</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>You already have separate bug tracking tools</span>
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
                  <p>
                    Migrating from Canny to Reflect is straightforward. Here's how to make the
                    switch:
                  </p>
                  <ol className="list-decimal list-inside space-y-3 ml-4">
                    <li>
                      <strong className="text-foreground">Export your Canny data:</strong> Use
                      Canny's export feature to download your feature requests, votes, and user
                      comments as CSV files.
                    </li>
                    <li>
                      <strong className="text-foreground">Sign up for Reflect:</strong> Create a
                      free Reflect account and set up your first project. The setup takes less than
                      5 minutes.
                    </li>
                    <li>
                      <strong className="text-foreground">Import feature requests:</strong> Use
                      Reflect's import tools or manually recreate your top feature requests. Focus
                      on the most-voted items first.
                    </li>
                    <li>
                      <strong className="text-foreground">Install the Reflect widget:</strong> Add
                      Reflect's lightweight widget to your application. It will start collecting new
                      feedback immediately.
                    </li>
                    <li>
                      <strong className="text-foreground">Update your public roadmap:</strong> If
                      you had a public Canny board, create a new public roadmap in Reflect and share
                      it with your users.
                    </li>
                    <li>
                      <strong className="text-foreground">Notify your users:</strong> Let your users
                      know about the switch and direct them to the new feedback widget or roadmap
                      URL.
                    </li>
                  </ol>
                  <p>
                    Reflect's team can help with the migration process. Contact support if you need
                    assistance importing large amounts of data.
                  </p>
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
                  Ready to Switch from Canny?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Experience the power of in-app feedback collection, screenshot bug reports, and
                  lightning-fast setup. Start free today.
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
