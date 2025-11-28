import { motion } from 'framer-motion'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { SEOHead } from '@/components/common/SEOHead'
import { usePageAnalytics } from '@/hooks/usePageAnalytics'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function RightFeedbackQuestionsPost() {
  usePageAnalytics()

  return (
    <>
      <SEOHead
        title="Asking the Right Feedback Questions: A Guide for SaaS Teams Reflect Blog"
        description="Learn how to ask the right questions when collecting user feedback. Discover which questions yield actionable insights and which ones to avoid."
        keywords="feedback questions, user feedback, feedback collection, SaaS feedback, feedback surveys"
        canonicalUrl="https://reflectfeedback.com/blog/right-feedback-questions"
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
                  Asking the Right Feedback Questions: A Guide for SaaS Teams
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Learn how to ask the right questions when collecting user feedback. Discover which
                  questions yield actionable insights and which ones to avoid.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="prose prose-lg max-w-none text-muted-foreground space-y-6"
              >
                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Why Question Design Matters
                </h2>
                <p>
                  The questions you ask when collecting feedback determine the quality of insights
                  you receive. Poorly designed questions lead to vague, unactionable feedback, while
                  well-designed questions yield specific, actionable insights that help you build
                  better products. Question design is one of the most important aspects of feedback
                  collection.
                </p>
                <p>
                  When using an{' '}
                  <Link to="/features" className="text-primary hover:underline">
                    in-app feedback tool
                  </Link>
                  , the questions you ask in your feedback forms directly impact the value of the
                  feedback you collect. Take time to design questions that will give you the
                  insights you need to make better product decisions.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Questions to Avoid
                </h2>
                <p>Some questions are counterproductive and should be avoided:</p>
                <ul>
                  <li>
                    <strong className="text-foreground">"What do you think?"</strong> - Too vague
                    and doesn't guide users toward actionable feedback
                  </li>
                  <li>
                    <strong className="text-foreground">"How can we improve?"</strong> - Too broad
                    and overwhelming
                  </li>
                  <li>
                    <strong className="text-foreground">"Rate your experience 1-10"</strong> -
                    Without context, ratings are meaningless
                  </li>
                  <li>
                    <strong className="text-foreground">Leading questions</strong> - Questions that
                    suggest a desired answer
                  </li>
                  <li>
                    <strong className="text-foreground">Multiple questions in one</strong> -
                    Confusing and hard to answer
                  </li>
                </ul>
                <p>
                  These questions don't yield actionable insights and can frustrate users. Instead,
                  ask specific, focused questions that guide users toward providing useful feedback.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Questions That Work
                </h2>
                <p>
                  Effective feedback questions are specific, contextual, and actionable. Here are
                  examples of questions that work:
                </p>
                <ul>
                  <li>
                    <strong className="text-foreground">
                      "What were you trying to do when you encountered this issue?"
                    </strong>{' '}
                    - For bug reports, this provides context
                  </li>
                  <li>
                    <strong className="text-foreground">
                      "What feature would make this workflow easier?"
                    </strong>{' '}
                    - Specific and actionable
                  </li>
                  <li>
                    <strong className="text-foreground">
                      "What's the main reason you're considering canceling?"
                    </strong>{' '}
                    - Direct and specific
                  </li>
                  <li>
                    <strong className="text-foreground">
                      "Which feature do you use most often?"
                    </strong>{' '}
                    - Helps prioritize development
                  </li>
                </ul>
                <p>
                  These questions are specific enough to yield actionable insights while being easy
                  for users to answer. They guide users toward providing useful feedback.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Contextual Questions
                </h2>
                <p>
                  The best feedback questions are contextual. They're asked at the right time and
                  place. For example, when users are using a specific feature, ask about that
                  feature. When they encounter a bug, ask about the bug. Context makes questions
                  more relevant and easier to answer.
                </p>
                <p>
                  An{' '}
                  <Link to="/feedback-widget" className="text-primary hover:underline">
                    in-app feedback widget
                  </Link>{' '}
                  makes contextual questions possible. You can trigger feedback requests based on
                  user actions, feature usage, or specific events. This context makes feedback more
                  valuable and easier for users to provide.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Open-Ended vs. Structured Questions
                </h2>
                <p>
                  Both open-ended and structured questions have their place. Open-ended questions
                  (like "What feature would you like to see?") allow users to express ideas freely
                  but can be harder to analyze. Structured questions (like multiple choice or rating
                  scales) are easier to analyze but may limit responses.
                </p>
                <p>
                  Use a combination: start with structured questions to gather quantitative data,
                  then follow up with open-ended questions to gather qualitative insights. For
                  example, ask users to rate a feature, then ask why they gave that rating.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Questions for Different Feedback Types
                </h2>
                <p>Different types of feedback require different questions:</p>
                <ul>
                  <li>
                    <strong className="text-foreground">Bug reports:</strong> "What were you trying
                    to do?" "What happened instead?" "Can you reproduce this?"
                  </li>
                  <li>
                    <strong className="text-foreground">Feature requests:</strong> "What problem are
                    you trying to solve?" "How would this feature help you?"
                  </li>
                  <li>
                    <strong className="text-foreground">General feedback:</strong> "What's working
                    well?" "What's not working well?" "What would you change?"
                  </li>
                </ul>
                <p>
                  Tailor your questions to the type of feedback you're collecting. A{' '}
                  <Link to="/bug-reporting" className="text-primary hover:underline">
                    bug reporting tool
                  </Link>{' '}
                  should ask different questions than a{' '}
                  <Link to="/feature-requests" className="text-primary hover:underline">
                    feature request tool
                  </Link>
                  .
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Keeping Questions Short
                </h2>
                <p>
                  Long, complex questions are harder to answer and lead to lower response rates.
                  Keep questions short and focused. If you need more information, ask follow-up
                  questions rather than combining everything into one long question.
                </p>
                <p>
                  Short questions are also easier to analyze. When feedback is concise and focused,
                  it's easier to identify patterns and take action.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Testing and Iterating
                </h2>
                <p>
                  Question design is an iterative process. Test different questions and see which
                  ones yield the best insights. Analyze the feedback you receive and adjust your
                  questions accordingly. Over time, you'll develop a set of questions that work well
                  for your product and users.
                </p>
                <p>
                  Don't be afraid to experiment. Try different question formats, phrasings, and
                  structures to find what works best for your specific use case.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">Conclusion</h2>
                <p>
                  Asking the right questions is essential for collecting valuable feedback. By
                  avoiding vague or leading questions, asking specific and contextual questions, and
                  testing and iterating, you can design feedback questions that yield actionable
                  insights. The key is making questions easy to answer while gathering the
                  information you need to make better product decisions.
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
                  Ready to Ask Better Questions?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Get started with Reflect's customizable feedback forms. Design questions that
                  yield actionable insights.
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
