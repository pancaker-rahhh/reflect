import { motion } from 'framer-motion'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { SEOHead } from '@/components/common/SEOHead'
import { usePageAnalytics } from '@/hooks/usePageAnalytics'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function BuildPublicRoadmapPost() {
  usePageAnalytics()

  return (
    <>
      <SEOHead
        title="How to Build a Public Roadmap That Builds Trust Reflect Blog"
        description="Learn how to create a public product roadmap that builds trust, manages expectations, and keeps users engaged. Discover best practices for public roadmaps in SaaS."
        keywords="public roadmap, product roadmap, public product roadmap, roadmap transparency, SaaS roadmap"
        canonicalUrl="https://reflectfeedback.com/blog/build-public-roadmap"
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
                  How to Build a Public Roadmap That Builds Trust
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Learn how to create a public product roadmap that builds trust, manages
                  expectations, and keeps users engaged. Discover best practices for public roadmaps
                  in SaaS.
                </p>
                <p className="text-base text-muted-foreground mb-8">
                  Looking for a roadmap tool? Compare Reflect with alternatives like{' '}
                  <Link to="/comparisons/reflect-vs-canny" className="text-primary hover:underline">
                    Canny
                  </Link>{' '}
                  or{' '}
                  <Link to="/comparisons/reflect-vs-frill" className="text-primary hover:underline">
                    Frill
                  </Link>
                  .
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="prose prose-lg max-w-none text-muted-foreground space-y-6"
              >
                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Why Public Roadmaps Matter
                </h2>
                <p>
                  Public roadmaps have become essential for SaaS companies that want to build trust
                  and transparency with their users. When users can see what you're building and
                  when features are coming, they feel more connected to your product and are more
                  likely to stick around. Public roadmaps also help manage expectations and reduce
                  support inquiries about upcoming features.
                </p>
                <p>
                  A well-maintained public roadmap shows that you're listening to user feedback and
                  building features that matter. It creates a sense of progress and momentum, even
                  when individual features take time to ship. This transparency builds trust and
                  encourages users to continue providing feedback.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  What to Include in Your Roadmap
                </h2>
                <p>
                  Your public roadmap should include features that users have requested, organized
                  by status: planned, in progress, and shipped. Each feature should have a clear
                  description, status, and estimated timeline (if possible). You can also include
                  features that you're considering but haven't committed to yet.
                </p>
                <p>
                  The best roadmaps are connected to your{' '}
                  <Link to="/feature-requests" className="text-primary hover:underline">
                    feature request tool
                  </Link>
                  , showing which user requests are being worked on. This connection demonstrates
                  that user feedback directly influences your product development, encouraging more
                  users to submit requests.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Organizing Your Roadmap
                </h2>
                <p>
                  Organize your roadmap by timeframes (this quarter, next quarter, future) or by
                  status (planned, in progress, shipped). Time-based organization helps users
                  understand when features are coming, while status-based organization shows current
                  progress.
                </p>
                <p>
                  You can also organize by categories or themes: core features, integrations,
                  improvements, etc. This helps users find features they care about and understand
                  your product's direction.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Managing Expectations
                </h2>
                <p>
                  One of the biggest challenges with public roadmaps is managing expectations.
                  Features can be delayed, priorities can change, and timelines can shift. Be
                  transparent about this uncertainty while still providing value.
                </p>
                <p>
                  Use language like "targeting Q2" instead of "will ship in Q2" to set appropriate
                  expectations. Update your roadmap regularly to reflect changes, and communicate
                  clearly when priorities shift. This transparency builds trust even when timelines
                  change.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Linking Roadmap to Feature Requests
                </h2>
                <p>
                  The most effective public roadmaps are connected to your feature request system.
                  When users vote on features, they can see which ones are planned or in progress on
                  your roadmap. This creates a clear connection between user feedback and product
                  development.
                </p>
                <p>
                  When you update a feature request's status to "planned" or "in progress," it
                  should automatically appear on your public roadmap. This automation ensures your
                  roadmap stays up-to-date and shows users that their feedback matters.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Updating Your Roadmap Regularly
                </h2>
                <p>
                  A stale roadmap is worse than no roadmap at all. Update your roadmap regularly, at
                  least monthly, to reflect current progress and priorities. When features ship,
                  move them to a "shipped" section and celebrate the win with your users.
                </p>
                <p>
                  Regular updates show that your roadmap is a living document, not a forgotten page.
                  They also give users a sense of progress and momentum, even when individual
                  features take time to build.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Communicating Changes
                </h2>
                <p>
                  When priorities change or features are delayed, communicate clearly with your
                  users. Update your roadmap, explain the reasoning, and show what you're working on
                  instead. This transparency builds trust even when things don't go as planned.
                </p>
                <p>
                  Consider sending email updates or in-app notifications when significant roadmap
                  changes occur. This keeps users informed and shows that you value their interest
                  in your product's direction.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">Best Practices</h2>
                <p>Here are some best practices for building effective public roadmaps:</p>
                <ul>
                  <li>Keep it simple and easy to understand</li>
                  <li>Update regularly to reflect current progress</li>
                  <li>Link to feature requests to show user influence</li>
                  <li>Use clear status indicators (planned, in progress, shipped)</li>
                  <li>Be transparent about uncertainty and changes</li>
                  <li>Celebrate shipped features</li>
                  <li>Make it easy for users to find and navigate</li>
                </ul>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">Conclusion</h2>
                <p>
                  Public roadmaps are powerful tools for building trust and transparency with your
                  users. By organizing features clearly, managing expectations, linking to feature
                  requests, and updating regularly, you can create a roadmap that keeps users
                  engaged and demonstrates that their feedback matters. Start building your public
                  roadmap today and see the difference it makes.
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
                  Ready to Build Your Public Roadmap?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Get started with Reflect's feature request tool and public roadmap. Connect user
                  feedback to your product development.
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
