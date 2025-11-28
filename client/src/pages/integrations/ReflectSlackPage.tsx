import { motion } from 'framer-motion'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { SEOHead } from '@/components/common/SEOHead'
import { usePageAnalytics } from '@/hooks/usePageAnalytics'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const steps = [
  {
    step: 1,
    title: 'Connect Your Slack Workspace',
    description:
      'Authorize Reflect to access your Slack workspace through our secure OAuth integration.',
  },
  {
    step: 2,
    title: 'Choose Your Channels',
    description:
      'Select which Slack channels should receive feedback notifications. You can set up different channels for bugs, feature requests, and general feedback.',
  },
  {
    step: 3,
    title: 'Configure Notification Settings',
    description:
      'Customize when and how notifications are sent. Set up filters, mention specific team members, and configure notification frequency.',
  },
  {
    step: 4,
    title: 'Start Receiving Feedback',
    description:
      'Once configured, all new feedback, bug reports, and feature requests will automatically appear in your selected Slack channels.',
  },
]

export default function ReflectSlackPage() {
  usePageAnalytics()

  return (
    <>
      <SEOHead
        title="Reflect + Slack Send Feedback & Bug Reports to Slack"
        description="Integrate Reflect with Slack to receive feedback, bug reports, and feature requests directly in your Slack channels. Set up in minutes and never miss important user feedback."
        keywords="reflect slack integration, feedback slack, bug reports slack, slack notifications"
        canonicalUrl="https://reflectfeedback.com/integrations/slack"
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
                Reflect + Slack: Send Feedback & Bug Reports to Slack
              </h1>
              <p className="text-lg sm:text-xl leading-8 text-muted-foreground">
                Keep your team in the loop with real-time Slack notifications for every piece of
                feedback, bug report, and feature request. Never miss important user insights.
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
                  How It Works
                </h2>
                <div className="space-y-6">
                  {steps.map((item, index) => (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex gap-6"
                    >
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                          {item.step}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                        <p className="text-muted-foreground">{item.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                  Why Integrate Reflect with Slack?
                </h2>
                <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
                  <p>
                    <strong className="text-foreground">Real-Time Notifications:</strong> Get
                    instant notifications in Slack whenever users submit feedback, report bugs, or
                    request features. Your team stays informed without constantly checking the
                    Reflect dashboard.
                  </p>
                  <p>
                    <strong className="text-foreground">Better Team Collaboration:</strong> Share
                    feedback directly in Slack channels where your team already works. Team members
                    can discuss, assign, and prioritize feedback without leaving Slack.
                  </p>
                  <p>
                    <strong className="text-foreground">Reduced Context Switching:</strong> No need
                    to switch between Reflect and Slack. All feedback appears where your team
                    already communicates, making it easier to act on user insights.
                  </p>
                  <p>
                    <strong className="text-foreground">Customizable Notifications:</strong> Set up
                    different channels for different types of feedback. Route bugs to your
                    engineering channel, feature requests to product, and general feedback to
                    customer success.
                  </p>
                  <p>
                    <strong className="text-foreground">Rich Context:</strong> Slack notifications
                    include screenshots, user information, and full feedback details, so your team
                    has everything they need to respond quickly.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20 text-center"
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                  Ready to Connect Reflect with Slack?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Start receiving feedback notifications in Slack today. Set up takes less than 5
                  minutes.
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
                    to="/"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl bg-background text-foreground hover:bg-muted transition-all duration-300 border-2 border-border hover:border-primary"
                  >
                    Learn More
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
