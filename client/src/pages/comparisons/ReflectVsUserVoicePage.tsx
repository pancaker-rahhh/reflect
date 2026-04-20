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
  { label: 'Feature voting', reflect: 'Yes - in-widget', competitor: 'Yes - portal' },
  { label: 'Bug reporting', reflect: 'Screenshots + logs', competitor: 'Basic' },
  { label: 'Integrations', reflect: 'Jira, GitHub, Slack', competitor: 'Jira, GitHub, Zendesk' },
  { label: 'Pricing model', reflect: 'Developer-friendly', competitor: 'Enterprise/seat' },
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
    label: '5-Minute Setup',
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
    label: 'Lightweight (<50KB)',
    reflect: <Check className="h-5 w-5 text-green-500" />,
    competitor: <X className="h-5 w-5 text-red-500" />,
  },
  {
    label: 'Modern UI/UX',
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
      name: 'Can Reflect replace UserVoice?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes - Reflect is a strong alternative for teams who want in-app feedback and richer bug context with a developer-first integration.',
      },
    },
    {
      '@type': 'Question',
      name: 'How quickly can my team move feedback from UserVoice to Reflect?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Migration usually takes a few days depending on dataset size; see the migration guide for step-by-step instructions.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Reflect support SSO and enterprise security?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes - Reflect supports SSO and enterprise security features; contact sales for enterprise plans.',
      },
    },
  ],
}

export default function ReflectVsUserVoicePage() {
  usePageAnalytics()

  return (
    <>
      <SEOHead
        title="Reflect vs UserVoice - Better User Feedback for SaaS"
        description="Compare Reflect and UserVoice by features, pricing, and ease of use. Reflect is focused on in-app capture and fast developer workflows."
        keywords="reflect vs uservoice, uservoice alternative, feedback tool comparison, uservoice vs reflect"
        canonicalUrl="https://reflectfeedback.com/comparisons/reflect-vs-uservoice"
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
                  UserVoice is feature-rich for enterprise community portals; Reflect is better for
                  product teams who want in-app feedback, richer bug context, and a simpler
                  developer-first integration.
                </p>
              </TLDRBox>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6">
                Reflect vs UserVoice - Which Feedback Tool Fits Your Team?
              </h1>
              <MigrationCTA competitor="UserVoice" />
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
                  <ComparisonTable rows={comparisonData} competitorName="UserVoice" />
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
                <section aria-label="FAQ">
                  <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">FAQ</h2>
                  <div className="space-y-4">
                    <details className="bg-card rounded-xl p-6 border border-border">
                      <summary className="text-lg font-semibold text-foreground cursor-pointer">
                        Can Reflect replace UserVoice?
                      </summary>
                      <div className="mt-4 text-muted-foreground">
                        Yes - Reflect is a strong alternative for teams who want in-app feedback and
                        richer bug context with a developer-first integration.
                      </div>
                    </details>
                    <details className="bg-card rounded-xl p-6 border border-border">
                      <summary className="text-lg font-semibold text-foreground cursor-pointer">
                        How quickly can my team move feedback from UserVoice to Reflect?
                      </summary>
                      <div className="mt-4 text-muted-foreground">
                        Migration usually takes a few days depending on dataset size; see the
                        migration guide for step-by-step instructions.
                      </div>
                    </details>
                    <details className="bg-card rounded-xl p-6 border border-border">
                      <summary className="text-lg font-semibold text-foreground cursor-pointer">
                        Does Reflect support SSO and enterprise security?
                      </summary>
                      <div className="mt-4 text-muted-foreground">
                        Yes - Reflect supports SSO and enterprise security features; contact sales
                        for enterprise plans.
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
                <MigrationCTA competitor="UserVoice" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
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
