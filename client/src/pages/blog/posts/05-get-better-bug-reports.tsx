import { motion } from 'framer-motion'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { SEOHead } from '@/components/common/SEOHead'
import { usePageAnalytics } from '@/hooks/usePageAnalytics'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function GetBetterBugReportsPost() {
  usePageAnalytics()

  return (
    <>
      <SEOHead
        title="How to Get Better Bug Reports from Users – Reflect Blog"
        description="Learn how to collect better bug reports with screenshots, context, and actionable details. Discover best practices for bug reporting workflows that help your team fix issues faster."
        keywords="bug reports, bug reporting, screenshot bug reports, bug tracking, bug reporting best practices"
        canonicalUrl="https://reflectfeedback.com/blog/get-better-bug-reports"
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
                  How to Get Better Bug Reports from Users
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Learn how to collect better bug reports with screenshots, context, and actionable
                  details. Discover best practices for bug reporting workflows that help your team
                  fix issues faster.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="prose prose-lg max-w-none text-muted-foreground space-y-6"
              >
                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  The Problem with Traditional Bug Reports
                </h2>
                <p>
                  Most bug reports from users are incomplete, vague, or missing critical
                  information. "It's broken" or "This doesn't work" doesn't help your engineering
                  team fix issues. Without screenshots, browser information, console logs, or steps
                  to reproduce, developers waste time trying to understand and reproduce bugs.
                </p>
                <p>
                  The solution is to make bug reporting easy and automatic. Use a{' '}
                  <Link to="/bug-reporting" className="text-primary hover:underline">
                    bug reporting tool
                  </Link>{' '}
                  that captures all the context your team needs automatically.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Screenshot Capture Is Essential
                </h2>
                <p>
                  A picture is worth a thousand words, especially when it comes to bug reports.
                  Screenshots show exactly what the user saw, making it much easier for developers
                  to understand and fix issues. The best bug reporting tools include one-click
                  screenshot capture with annotation tools.
                </p>
                <p>
                  When users can highlight, draw, and annotate screenshots, they can point out
                  exactly what went wrong. This visual context eliminates guesswork and speeds up
                  bug resolution significantly.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Automatic Context Collection
                </h2>
                <p>
                  Modern bug reporting tools automatically capture browser information, console
                  logs, network requests, and user actions. This context is invaluable for
                  developers trying to reproduce and fix bugs. Instead of asking users for technical
                  details they may not know, the tool collects everything automatically.
                </p>
                <p>
                  Tools like Reflect automatically capture this context, giving your team everything
                  they need to fix bugs faster. No more back-and-forth emails asking for browser
                  versions or console errors.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Make Bug Reporting In-App
                </h2>
                <p>
                  The best place to report a bug is right where the user encounters it. In-app bug
                  reporting eliminates friction and ensures users report issues while the problem is
                  fresh in their mind. Use an{' '}
                  <Link to="/feedback-widget" className="text-primary hover:underline">
                    in-app feedback widget
                  </Link>{' '}
                  that includes bug reporting capabilities.
                </p>
                <p>
                  When bug reporting is built into your application, users don't have to switch
                  contexts, remember details, or navigate to a separate support portal. They can
                  report bugs instantly, which leads to more and better bug reports.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Clear Steps to Reproduce
                </h2>
                <p>
                  While automatic context collection helps, it's also important to guide users to
                  provide clear steps to reproduce bugs. Well-designed bug reporting forms prompt
                  users for:
                </p>
                <ul>
                  <li>What they were trying to do</li>
                  <li>What they expected to happen</li>
                  <li>What actually happened</li>
                  <li>Steps to reproduce the issue</li>
                </ul>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Prioritize and Organize
                </h2>
                <p>
                  Once you're collecting better bug reports, you need a system to prioritize and
                  organize them. Use a bug reporting tool that lets you categorize bugs, assign
                  priority levels, and track resolution status. This helps your team focus on the
                  most critical issues first.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">Close the Loop</h2>
                <p>
                  When bugs are fixed, let users know. Closing the loop builds trust and encourages
                  users to continue reporting issues. Use automated notifications or update users
                  through your public roadmap.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">Conclusion</h2>
                <p>
                  Better bug reports lead to faster bug fixes and happier users. By making bug
                  reporting easy, automatic, and in-app, you can collect the context your team needs
                  to fix issues quickly. The key is using the right tools and workflows that capture
                  everything automatically while making it easy for users to report problems.
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
                  Ready to Get Better Bug Reports?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Start collecting better bug reports with Reflect's screenshot capture and
                  automatic context collection.
                </p>
                <Link
                  to="/login"
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
