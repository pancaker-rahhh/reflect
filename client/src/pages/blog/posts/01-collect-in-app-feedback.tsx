import { motion } from 'framer-motion'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { SEOHead } from '@/components/common/SEOHead'
import { usePageAnalytics } from '@/hooks/usePageAnalytics'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function CollectInAppFeedbackPost() {
  usePageAnalytics()

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'How to Collect In-App Feedback Without Annoying Users',
    description:
      'Learn best practices for collecting in-app feedback that users actually want to provide. Discover the right timing, placement, and messaging to maximize response rates.',
    datePublished: '2024-11-20',
    dateModified: '2024-11-20',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'https://reflectfeedback.com/blog/collect-in-app-feedback',
    },
    author: {
      '@type': 'Person',
      name: 'Reflect Team',
    },
    image: ['https://reflectfeedback.com/og-image.png'],
    url: 'https://reflectfeedback.com/blog/collect-in-app-feedback',
  }

  return (
    <>
      <SEOHead
        title="How to Collect In-App Feedback Without Annoying Users Reflect Blog"
        description="Learn best practices for collecting in-app feedback that users actually want to provide. Discover the right timing, placement, and messaging to maximize response rates."
        keywords="in-app feedback, collect user feedback, feedback collection, user feedback best practices"
        canonicalUrl="https://reflectfeedback.com/blog/collect-in-app-feedback"
        ogImage="https://reflectfeedback.com/og-image.png"
        schemaType="blog"
        ogType="article"
        structuredData={articleSchema}
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
                  How to Collect In-App Feedback Without Annoying Users
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Learn best practices for collecting in-app feedback that users actually want to
                  provide. Discover the right timing, placement, and messaging to maximize response
                  rates.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="prose prose-lg max-w-none text-muted-foreground space-y-6"
              >
                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  The Challenge of In-App Feedback
                </h2>
                <p>
                  Collecting feedback from users is essential for building better products, but
                  doing it wrong can hurt your user experience. Pop-ups that interrupt workflows,
                  poorly timed requests, and generic messaging all contribute to user frustration
                  and low response rates.
                </p>
                <p>
                  The key to successful in-app feedback collection is making it feel natural,
                  helpful, and non-intrusive. When done right, users actually appreciate the
                  opportunity to share their thoughts because they feel heard and valued.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Timing Is Everything
                </h2>
                <p>
                  The most important factor in collecting feedback is timing. Ask for feedback at
                  the wrong moment, and users will ignore or dismiss your request. Ask at the right
                  moment, and they'll be happy to help.
                </p>
                <p>
                  <strong className="text-foreground">Best times to ask for feedback:</strong>
                </p>
                <ul>
                  <li>After a user completes a key action or milestone</li>
                  <li>When a user has been active for several minutes</li>
                  <li>After they've used a specific feature multiple times</li>
                  <li>When they're in a natural pause point in their workflow</li>
                </ul>
                <p>
                  <strong className="text-foreground">Worst times to ask:</strong>
                </p>
                <ul>
                  <li>Immediately after page load (users haven't experienced anything yet)</li>
                  <li>During critical workflows or transactions</li>
                  <li>When users are clearly in a hurry or focused on a task</li>
                  <li>Multiple times in a single session</li>
                </ul>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Placement and Design Matter
                </h2>
                <p>
                  Where you place your feedback widget and how it looks significantly impacts
                  whether users will engage with it. A well-designed, strategically placed widget
                  feels like a natural part of your application, not an interruption.
                </p>
                <p>
                  Consider using a{' '}
                  <Link to="/feedback-widget" className="text-primary hover:underline">
                    feedback widget
                  </Link>{' '}
                  that blends seamlessly into your UI. Position it in a corner where it's accessible
                  but not intrusive. Use your brand colors and styling to make it feel native to
                  your application.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Crafting the Right Message
                </h2>
                <p>
                  The copy you use in your feedback requests matters. Generic messages like "Tell us
                  what you think" are less effective than specific, contextual requests that show
                  you value the user's input.
                </p>
                <p>Instead of generic prompts, try contextual messaging:</p>
                <ul>
                  <li>"How was your experience with [feature name]?"</li>
                  <li>"Found a bug? Let us know and we'll fix it fast."</li>
                  <li>"Have an idea to improve this? We'd love to hear it."</li>
                </ul>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Making Feedback Easy
                </h2>
                <p>
                  The easier it is to provide feedback, the more likely users will do it. Use an{' '}
                  <Link to="/features" className="text-primary hover:underline">
                    in-app feedback tool
                  </Link>{' '}
                  that lets users submit feedback without leaving your application. Include
                  screenshot capture for bug reports, and keep forms short and focused.
                </p>
                <p>
                  Tools like Reflect make it easy to collect feedback with minimal friction. Users
                  can submit feedback, report bugs with screenshots, and request features all from
                  within your application.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">Closing the Loop</h2>
                <p>
                  One of the most important aspects of feedback collection is closing the loop. When
                  users see that their feedback leads to actual changes, they're more likely to
                  provide feedback in the future. Use a{' '}
                  <Link to="/feature-requests" className="text-primary hover:underline">
                    feature request tool
                  </Link>{' '}
                  that lets you update users when their requested features ship.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">Conclusion</h2>
                <p>
                  Collecting in-app feedback doesn't have to annoy users. By focusing on timing,
                  placement, messaging, and ease of use, you can create a feedback collection
                  experience that users actually appreciate. The key is making feedback feel
                  natural, helpful, and valuable, not like an interruption.
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
                  Ready to Collect Better Feedback?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Start collecting in-app feedback with Reflect. Free plan available.
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
