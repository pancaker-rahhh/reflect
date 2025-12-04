import { motion } from 'framer-motion'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { SEOHead } from '@/components/common/SEOHead'
import { usePageAnalytics } from '@/hooks/usePageAnalytics'
import { Check, X } from 'lucide-react'
import TLDRBox from '@/components/common/TLDRBox'
import ComparisonTable from '@/components/common/ComparisonTable'
import MigrationCTA from '@/components/common/MigrationCTA'

const comparisonData = [
  { label: 'Core product', reflect: 'In-app widget', competitor: 'Hosted portal' },
  { label: 'Feature voting', reflect: 'Yes — in-widget', competitor: 'Yes — portal' },
  { label: 'Bug reporting', reflect: 'Screenshots + logs', competitor: 'Basic' },
  { label: 'Integrations', reflect: 'Jira, GitHub, Slack', competitor: 'Jira, GitHub' },
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
    label: 'Free Plan Available',
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
    label: 'Custom Branding',
    reflect: <Check className="h-5 w-5 text-green-500" />,
    competitor: <Check className="h-5 w-5 text-green-500" />,
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is Reflect a good alternative to Canny?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — Reflect is a strong alternative for teams who want an in-app feedback widget, bug reporting with logs and screenshots, and simpler pricing. For enterprise roadmap features, Canny can be stronger.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I migrate my Canny data to Reflect?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — read our migration guide or request a migration plan to map posts, votes, and comments.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does Reflect pricing compare to Canny?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'See our pricing page for a detailed comparison and example scenarios.',
      },
    },
  ],
}

export default function ReflectVsCannyPage() {
  usePageAnalytics()

  return (
    <>
      <SEOHead
        title="Reflect vs Canny — Best Canny Alternative for SaaS"
        description="Looking for a Canny alternative? See how Reflect compares on pricing, in-app widget, voting, integrations, and migration. Fast install, lightweight widget."
        keywords="reflect vs canny, canny alternative, feedback tool comparison, canny vs reflect, user feedback tool"
        canonicalUrl="https://reflectfeedback.com/comparisons/reflect-vs-canny"
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
                  Reflect is ideal if you want a lightweight in-app feedback widget with deep bug
                  context and simpler pricing. Canny is better for enterprise community portals and
                  advanced roadmap features.
                </p>
              </TLDRBox>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6">
                Reflect vs Canny — Which Is the Better Feature Request Tool?
              </h1>
              <MigrationCTA competitor="Canny" />
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
                  <ComparisonTable rows={comparisonData} competitorName="Canny" />
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
                    context switching, no friction. Users can share their thoughts at the moment
                    they have them.
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
                transition={{ duration: 0.6, delay: 0.8 }}
                viewport={{ once: true }}
              >
                <section aria-label="FAQ">
                  <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">FAQ</h2>
                  <div className="space-y-4">
                    <details className="bg-card rounded-xl p-6 border border-border">
                      <summary className="text-lg font-semibold text-foreground cursor-pointer">
                        Is Reflect a good alternative to Canny?
                      </summary>
                      <div className="mt-4 text-muted-foreground">
                        Yes — Reflect is a strong alternative for teams who want an in-app feedback
                        widget, bug reporting with logs and screenshots, and simpler pricing. For
                        enterprise roadmap features, Canny can be stronger.
                      </div>
                    </details>
                    <details className="bg-card rounded-xl p-6 border border-border">
                      <summary className="text-lg font-semibold text-foreground cursor-pointer">
                        Can I migrate my Canny data to Reflect?
                      </summary>
                      <div className="mt-4 text-muted-foreground">
                        Yes — read our migration guide or request a migration plan to map posts,
                        votes, and comments.
                      </div>
                    </details>
                    <details className="bg-card rounded-xl p-6 border border-border">
                      <summary className="text-lg font-semibold text-foreground cursor-pointer">
                        How does Reflect pricing compare to Canny?
                      </summary>
                      <div className="mt-4 text-muted-foreground">
                        See our pricing page for a detailed comparison and example scenarios.
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
                <MigrationCTA competitor="Canny" />
              </motion.div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
