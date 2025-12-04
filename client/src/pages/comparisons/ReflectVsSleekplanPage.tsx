import { motion } from 'framer-motion'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { SEOHead } from '@/components/common/SEOHead'
import { usePageAnalytics } from '@/hooks/usePageAnalytics'
import { Link } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import TLDRBox from '@/components/common/TLDRBox'
import ComparisonTable from '@/components/common/ComparisonTable'
import MigrationCTA from '@/components/common/MigrationCTA'

const comparisonData = [
  { label: 'Core product', reflect: 'In-app widget', competitor: 'Hosted portal' },
  { label: 'Feature voting', reflect: 'Yes — in-widget', competitor: 'Yes — portal' },
  { label: 'Bug reporting', reflect: 'Screenshots + logs', competitor: 'No' },
  { label: 'Integrations', reflect: 'Jira, GitHub, Slack', competitor: 'Basic' },
  { label: 'Pricing model', reflect: 'Developer-friendly', competitor: 'Per-seat' },
  {
    label: 'In-App Widget',
    reflect: <Check className="h-5 w-5 text-green-500" />,
    competitor: <X className="h-5 w-5 text-red-500" />,
  },
  {
    label: 'Screenshot Bug Reports',
    reflect: <Check className="h-5 w-5 text-green-500" />,
    competitor: <X className="h-5 w-5 text-red-500" />,
  },
  {
    label: 'Free Plan',
    reflect: <Check className="h-5 w-5 text-green-500" />,
    competitor: <X className="h-5 w-5 text-red-500" />,
  },
  {
    label: 'Feature Voting',
    reflect: <Check className="h-5 w-5 text-green-500" />,
    competitor: <Check className="h-5 w-5 text-green-500" />,
  },
  {
    label: 'Public Roadmap',
    reflect: <Check className="h-5 w-5 text-green-500" />,
    competitor: <Check className="h-5 w-5 text-green-500" />,
  },
  {
    label: 'Lightweight',
    reflect: <Check className="h-5 w-5 text-green-500" />,
    competitor: <X className="h-5 w-5 text-red-500" />,
  },
  {
    label: '5-Minute Setup',
    reflect: <Check className="h-5 w-5 text-green-500" />,
    competitor: <X className="h-5 w-5 text-red-500" />,
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can Reflect provide the same simple portal as Sleekplan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Reflect can provide a public roadmap and portal-style pages while keeping focus on in-app capture.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Reflect support privacy controls for EU customers?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — Reflect supports privacy options suitable for EU customers; contact us for data residency requirements.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I migrate from Sleekplan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Follow the migration guide: export from Sleekplan, map fields to Reflect CSV, import posts then votes/comments.',
      },
    },
  ],
}

export default function ReflectVsSleekplanPage() {
  usePageAnalytics()

  return (
    <>
      <SEOHead
        title="Reflect vs Sleekplan — Which Feedback Tool Is Best?"
        description="Compare Reflect and Sleekplan on widget performance, feature voting, roadmap, privacy, and pricing. Reflect offers advanced bug reporting and fast in-app capture."
        keywords="reflect vs sleekplan, sleekplan alternative, roadmap tool comparison"
        canonicalUrl="https://reflectfeedback.com/comparisons/reflect-vs-sleekplan"
        ogImage="https://reflectfeedback.com/og-image.png"
        schemaType="default"
        structuredData={faqSchema}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
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
              <TLDRBox>
                <p>
                  Sleekplan offers a simple feedback portal and roadmap; Reflect adds richer in-app
                  bug reporting, automatic context capture, and a developer-friendly integration
                  that's better for product teams.
                </p>
              </TLDRBox>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6">
                Reflect vs Sleekplan — Feature & Pricing Comparison
              </h1>
              <MigrationCTA competitor="Sleekplan" />
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
                  Overview of Sleekplan
                </h2>
                <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
                  <p>
                    Sleekplan is a product roadmap and feedback management tool that helps teams
                    create beautiful public roadmaps and collect feature requests. It focuses
                    primarily on visual roadmap presentation and user voting on features.
                  </p>
                  <p>
                    Sleekplan excels at creating attractive, shareable roadmaps that help teams
                    communicate their product direction to users. The platform offers customizable
                    roadmap views, status tracking, and basic feedback collection through external
                    forms.
                  </p>
                  <p>
                    However, Sleekplan lacks native in-app feedback collection and doesn't offer bug
                    reporting capabilities. Teams using Sleekplan often need additional tools for
                    comprehensive feedback management, which can fragment the user experience.
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
                  <ComparisonTable rows={comparisonData} competitorName="Sleekplan" />
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
                    <strong className="text-foreground">All-in-One Platform:</strong> Reflect
                    combines roadmap management, feature requests, bug reporting, and in-app
                    feedback in one platform. Sleekplan focuses primarily on roadmaps, requiring
                    additional tools for comprehensive feedback management.
                  </p>
                  <p>
                    <strong className="text-foreground">In-App Feedback Collection:</strong>{' '}
                    Reflect's native widget lets users submit feedback directly inside your
                    application. Sleekplan relies on external forms and portals, creating friction
                    for users.
                  </p>
                  <p>
                    <strong className="text-foreground">Bug Reporting:</strong> Built-in screenshot
                    capture and bug reporting capabilities make Reflect a complete solution.
                    Sleekplan doesn't offer bug reporting features.
                  </p>
                  <p>
                    <strong className="text-foreground">Free Plan:</strong> Reflect offers a
                    generous free plan to get started. Sleekplan's pricing starts at $19/month,
                    which can be a barrier for smaller teams.
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
                        <span>You want an all-in-one feedback platform</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>You need a free plan to get started</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-card rounded-xl p-6 border border-border">
                    <h3 className="text-xl font-bold text-foreground mb-4">Choose Sleekplan If:</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>You only need roadmap visualization</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>You already have separate feedback tools</span>
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
                  <p>Migrating from Sleekplan to Reflect:</p>
                  <ol className="list-decimal list-inside space-y-3 ml-4">
                    <li>Export your Sleekplan roadmap and feature requests</li>
                    <li>Sign up for Reflect and create your project</li>
                    <li>Import your roadmap items and feature requests</li>
                    <li>Install Reflect's widget for in-app feedback</li>
                    <li>Update your public roadmap URL and notify users</li>
                  </ol>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                viewport={{ once: true }}
              >
                <section aria-label="FAQ">
                  <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">FAQ</h2>
                  <div className="space-y-4">
                    <details className="bg-card rounded-xl p-6 border border-border">
                      <summary className="text-lg font-semibold text-foreground cursor-pointer">
                        Can Reflect provide the same simple portal as Sleekplan?
                      </summary>
                      <div className="mt-4 text-muted-foreground">
                        Reflect can provide a public roadmap and portal-style pages while keeping
                        focus on in-app capture.
                      </div>
                    </details>
                    <details className="bg-card rounded-xl p-6 border border-border">
                      <summary className="text-lg font-semibold text-foreground cursor-pointer">
                        Does Reflect support privacy controls for EU customers?
                      </summary>
                      <div className="mt-4 text-muted-foreground">
                        Yes — Reflect supports privacy options suitable for EU customers; contact us
                        for data residency requirements.
                      </div>
                    </details>
                    <details className="bg-card rounded-xl p-6 border border-border">
                      <summary className="text-lg font-semibold text-foreground cursor-pointer">
                        How do I migrate from Sleekplan?
                      </summary>
                      <div className="mt-4 text-muted-foreground">
                        Follow the migration guide: export from Sleekplan, map fields to Reflect
                        CSV, import posts then votes/comments.
                      </div>
                    </details>
                  </div>
                </section>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                viewport={{ once: true }}
              >
                <MigrationCTA competitor="Sleekplan" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20 text-center"
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                  Ready to Switch from Sleekplan?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Get more value with Reflect's all-in-one feedback platform. Start free today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-xl hover:shadow-2xl"
                  >
                    Get Started Free
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
