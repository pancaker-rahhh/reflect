import { motion } from 'framer-motion'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { SEOHead } from '@/components/common/SEOHead'
import { usePageAnalytics } from '@/hooks/usePageAnalytics'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function ReportBugsInsideYourAppPost() {
  usePageAnalytics()

  return (
    <>
      <SEOHead
        title="How to Let Users Report Bugs Inside Your App – Reflect Blog"
        description="Learn how to implement in-app bug reporting that makes it easy for users to report issues without leaving your application. Discover best practices for in-app bug reporting."
        keywords="in-app bug reporting, report bugs in app, bug reporting widget, in-app bug reports"
        canonicalUrl="https://reflectfeedback.com/blog/report-bugs-inside-your-app"
        ogImage="https://reflectfeedback.com/og-image.png"
        schemaType="blog"
      />
      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        <article className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
                  How to Let Users Report Bugs Inside Your App
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Learn how to implement in-app bug reporting that makes it easy for users to report
                  issues without leaving your application. Discover best practices for in-app bug
                  reporting.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="prose prose-lg max-w-none text-muted-foreground space-y-6"
              >
                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Why In-App Bug Reporting Matters
                </h2>
                <p>
                  In-app bug reporting is the most effective way to collect bug reports from users.
                  When users can report bugs directly inside your application, they're more likely
                  to do so because there's no friction or context switching. They can report issues
                  immediately when they encounter them, while the problem is fresh in their mind.
                </p>
                <p>
                  Traditional bug reporting methods—like email or external forms—require users to
                  remember details, switch contexts, and navigate to a separate page. This friction
                  leads to fewer bug reports and lower-quality reports. In-app bug reporting
                  eliminates this friction and makes bug reporting effortless.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Choosing the Right Tool
                </h2>
                <p>
                  The first step to implementing in-app bug reporting is choosing the right tool.
                  Look for a{' '}
                  <Link to="/bug-reporting" className="text-primary hover:underline">
                    bug reporting tool
                  </Link>{' '}
                  that:
                </p>
                <ul>
                  <li>Installs easily with minimal code</li>
                  <li>Captures screenshots with one click</li>
                  <li>Collects browser and console information automatically</li>
                  <li>Integrates with your existing tools (Slack, Linear, GitHub)</li>
                  <li>Provides a customizable widget that matches your brand</li>
                </ul>
                <p>
                  Tools like Reflect make it easy to add in-app bug reporting to your application.
                  The{' '}
                  <Link to="/feedback-widget" className="text-primary hover:underline">
                    feedback widget
                  </Link>{' '}
                  installs in minutes and provides everything you need to collect bug reports
                  in-app.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Widget Placement and Design
                </h2>
                <p>
                  Where you place your bug reporting widget matters. It should be easily accessible
                  but not intrusive. Common placements include:
                </p>
                <ul>
                  <li>Bottom-right corner (most common)</li>
                  <li>Bottom-left corner</li>
                  <li>Floating button that expands on click</li>
                  <li>Integrated into your navigation or header</li>
                </ul>
                <p>
                  The widget should match your brand's design and feel native to your application.
                  Customize colors, fonts, and styling to make it feel like part of your product,
                  not a third-party add-on.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Making Bug Reporting Effortless
                </h2>
                <p>
                  The key to successful in-app bug reporting is making it effortless. Users should
                  be able to report bugs in seconds, not minutes. Here's how:
                </p>
                <ul>
                  <li>
                    <strong className="text-foreground">One-click screenshot capture:</strong> Users
                    should be able to capture screenshots with a single click, without leaving your
                    app.
                  </li>
                  <li>
                    <strong className="text-foreground">Automatic context collection:</strong>{' '}
                    Browser info, console logs, and user actions should be captured automatically.
                  </li>
                  <li>
                    <strong className="text-foreground">Minimal form fields:</strong> Keep the bug
                    report form short. Ask only for essential information.
                  </li>
                  <li>
                    <strong className="text-foreground">Instant confirmation:</strong> Show users
                    immediate confirmation that their bug report was received.
                  </li>
                </ul>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Screenshot Capture and Annotation
                </h2>
                <p>
                  Screenshot capture is essential for in-app bug reporting. Users should be able to
                  capture screenshots directly from your application, annotate them to highlight
                  issues, and submit them instantly. This visual context makes it much easier for
                  your team to understand and fix bugs.
                </p>
                <p>
                  The best bug reporting tools include annotation features that let users highlight,
                  draw, and add text to screenshots. This makes bug reports incredibly precise and
                  actionable.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Automatic Context Collection
                </h2>
                <p>
                  In-app bug reporting tools can automatically collect technical context that users
                  might not know how to provide: browser version, operating system, console errors,
                  network requests, and user actions leading up to the bug. This automatic context
                  collection makes bug reports complete and actionable.
                </p>
                <p>
                  When your{' '}
                  <Link to="/features" className="text-primary hover:underline">
                    bug reporting tool
                  </Link>{' '}
                  captures this context automatically, your engineering team has everything they
                  need to reproduce and fix bugs without asking users for additional information.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Integration with Your Workflow
                </h2>
                <p>
                  In-app bug reports should integrate seamlessly with your team's workflow. When
                  bugs are reported, they should automatically:
                </p>
                <ul>
                  <li>Create issues in your project management tool (Linear, Jira, GitHub)</li>
                  <li>Notify your team in Slack or other communication tools</li>
                  <li>Route to the right team members based on bug type</li>
                  <li>Tag and categorize bugs automatically</li>
                </ul>
                <p>
                  This integration ensures that bug reports don't get lost and are acted on quickly.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">Best Practices</h2>
                <p>Here are some best practices for implementing in-app bug reporting:</p>
                <ul>
                  <li>Make the widget always accessible but never intrusive</li>
                  <li>Use clear, friendly copy that encourages bug reporting</li>
                  <li>Provide immediate confirmation when bugs are submitted</li>
                  <li>Follow up with users when bugs are fixed</li>
                  <li>Use analytics to understand bug reporting patterns</li>
                  <li>Continuously improve based on user feedback</li>
                </ul>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">Conclusion</h2>
                <p>
                  In-app bug reporting is the most effective way to collect bug reports from users.
                  By making bug reporting effortless, capturing screenshots and context
                  automatically, and integrating with your workflow, you can collect better bug
                  reports and fix issues faster. Start implementing in-app bug reporting today and
                  see the difference it makes.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="mt-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20 text-center"
              >
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Ready to Add In-App Bug Reporting?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Get started with Reflect's in-app bug reporting. Easy installation, automatic
                  context, and seamless integrations.
                </p>
                <Link
                  to="/features"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-xl hover:shadow-2xl"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </motion.div>
            </div>
          </div>
        </article>
      </div>
      <Footer />
    </>
  )
}
