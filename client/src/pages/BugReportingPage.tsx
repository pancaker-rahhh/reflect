import { motion } from 'framer-motion'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { SEOHead } from '@/components/common/SEOHead'
import { Camera, Edit3, FileText, TrendingDown, Clock, Users } from 'lucide-react'
import { usePageAnalytics } from '@/hooks/usePageAnalytics'

const features = [
  {
    icon: <Camera className="h-8 w-8" />,
    title: 'Screenshot Capture',
    description:
      'Users can capture screenshots directly from their browser with one click. No need to use external tools or take manual screenshots. The widget handles everything automatically.',
  },
  {
    icon: <Edit3 className="h-8 w-8" />,
    title: 'Annotation Tools',
    description:
      'Let users highlight, draw, and annotate screenshots to point out exactly what went wrong. Visual context makes it easier for your team to understand and reproduce issues.',
  },
  {
    icon: <FileText className="h-8 w-8" />,
    title: 'Automatic Context Collection',
    description:
      'We automatically capture browser info, console logs, network requests, and user actions. No need to ask users for technical details—we collect it all automatically.',
  },
  {
    icon: <TrendingDown className="h-8 w-8" />,
    title: 'Reduce Churn',
    description:
      'Fix bugs faster with better context. When users can report issues easily and your team has all the information they need, you resolve problems quicker and keep customers happy.',
  },
]

export default function BugReportingPage() {
  usePageAnalytics()

  return (
    <>
      <SEOHead
        title="Reflect Bug Reporting Tool – Capture Issues Instantly"
        description="The fastest in-app bug reporting tool for SaaS. Screenshot capture, annotation, automatic context collection. Fix bugs faster and reduce churn. Start free."
        keywords="bug reporting tool, bug tracking, bug reporting software, in-app bug reporting, screenshot bug reports, bug tracking tool"
        canonicalUrl="https://reflectfeedback.com/bug-reporting"
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
                The Fastest In-App Bug Reporting Tool for SaaS
              </h1>
              <p className="mt-6 text-lg sm:text-xl leading-8 text-muted-foreground max-w-3xl mx-auto">
                Capture bugs with screenshots, annotations, and automatic context collection. Give
                your team everything they need to fix issues faster and reduce customer churn.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
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

        {/* How It Works Section */}
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
                  How Bug Reporting Reduces Churn
                </h2>
                <p className="text-lg text-muted-foreground">
                  When users encounter bugs, they need a fast, easy way to report them. The easier
                  it is to report issues, the more likely users will stick around instead of
                  switching to a competitor.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                    <Clock className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Faster Resolution</h3>
                  <p className="text-muted-foreground">
                    With screenshots and automatic context, your team can reproduce and fix bugs in
                    minutes instead of days.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                    <Users className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Better Experience</h3>
                  <p className="text-muted-foreground">
                    Users appreciate when you make it easy to report issues. They feel heard and
                    valued, which builds loyalty.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                    <TrendingDown className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Lower Churn</h3>
                  <p className="text-muted-foreground">
                    When bugs get fixed quickly, users stay. Reduce churn by making bug reporting
                    effortless and resolution fast.
                  </p>
                </motion.div>
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
                Start Capturing Better Bug Reports Today
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join teams using Reflect to fix bugs faster and keep customers happy.
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
