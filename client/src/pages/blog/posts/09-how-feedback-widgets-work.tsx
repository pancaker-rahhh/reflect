import { motion } from 'framer-motion'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { SEOHead } from '@/components/common/SEOHead'
import { usePageAnalytics } from '@/hooks/usePageAnalytics'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function HowFeedbackWidgetsWorkPost() {
  usePageAnalytics()

  return (
    <>
      <SEOHead
        title="How Feedback Widgets Work: A Complete Guide – Reflect Blog"
        description="Learn how feedback widgets work, how to implement them, and best practices for using them to collect user feedback in your SaaS application."
        keywords="feedback widgets, how feedback widgets work, in-app feedback widgets, feedback widget implementation"
        canonicalUrl="https://reflectfeedback.com/blog/how-feedback-widgets-work"
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
                  How Feedback Widgets Work: A Complete Guide
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Learn how feedback widgets work, how to implement them, and best practices for
                  using them to collect user feedback in your SaaS application.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="prose prose-lg max-w-none text-muted-foreground space-y-6"
              >
                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  What Are Feedback Widgets?
                </h2>
                <p>
                  Feedback widgets are lightweight, embeddable components that allow users to submit
                  feedback directly from within your application. They typically appear as a
                  floating button or icon that users can click to open a feedback form. Unlike
                  external feedback forms or email, feedback widgets are integrated into your
                  application, making it easy for users to provide feedback without leaving your
                  product.
                </p>
                <p>
                  Modern{' '}
                  <Link to="/feedback-widget" className="text-primary hover:underline">
                    feedback widgets
                  </Link>{' '}
                  are highly customizable, allowing you to match your brand's design and collect
                  different types of feedback: bug reports, feature requests, general feedback, and
                  surveys. They're designed to be non-intrusive while remaining easily accessible.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  How Feedback Widgets Work Technically
                </h2>
                <p>
                  Feedback widgets work by embedding a small JavaScript snippet into your
                  application. This snippet loads the widget code, which creates a floating UI
                  element that users can interact with. When users submit feedback, the widget sends
                  the data to the feedback service's API, which stores it and can trigger
                  integrations with your other tools.
                </p>
                <p>
                  The widget code is typically loaded asynchronously, so it doesn't slow down your
                  application. It's designed to be lightweight and performant, with minimal impact
                  on page load times. Most modern feedback widgets are built with React or similar
                  frameworks and can be customized through configuration options.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Installation and Setup
                </h2>
                <p>
                  Installing a feedback widget is usually straightforward. Most widgets require just
                  a single line of JavaScript code that you add to your application. The widget then
                  loads automatically and appears in your application.
                </p>
                <p>
                  For example, with Reflect, you add a script tag to your HTML or include it in your
                  React/Vue/Angular application. The widget automatically detects your application's
                  environment and loads accordingly. Configuration options let you customize the
                  widget's appearance, position, and behavior.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Widget Positioning and Display
                </h2>
                <p>
                  Feedback widgets can be positioned in various locations within your application.
                  The most common positions are:
                </p>
                <ul>
                  <li>
                    <strong className="text-foreground">Bottom-right corner:</strong> The most
                    common position, easily accessible but not intrusive
                  </li>
                  <li>
                    <strong className="text-foreground">Bottom-left corner:</strong> Alternative
                    position that works well for right-to-left languages
                  </li>
                  <li>
                    <strong className="text-foreground">Custom position:</strong> Some widgets allow
                    you to specify exact coordinates
                  </li>
                  <li>
                    <strong className="text-foreground">Inline:</strong> Embedded directly in your
                    page content
                  </li>
                </ul>
                <p>
                  The widget typically starts as a small button or icon that expands into a full
                  feedback form when clicked. This keeps it unobtrusive while remaining accessible.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Collecting Different Types of Feedback
                </h2>
                <p>Modern feedback widgets can collect various types of feedback:</p>
                <ul>
                  <li>
                    <strong className="text-foreground">Bug reports:</strong> With screenshot
                    capture and automatic context collection
                  </li>
                  <li>
                    <strong className="text-foreground">Feature requests:</strong> With voting
                    capabilities and categorization
                  </li>
                  <li>
                    <strong className="text-foreground">General feedback:</strong> Open-ended
                    feedback forms
                  </li>
                  <li>
                    <strong className="text-foreground">Surveys:</strong> Structured questions and
                    ratings
                  </li>
                </ul>
                <p>
                  A comprehensive{' '}
                  <Link to="/features" className="text-primary hover:underline">
                    feedback widget
                  </Link>{' '}
                  like Reflect supports all these types, allowing you to collect different kinds of
                  feedback through a single widget interface.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Screenshot Capture and Context
                </h2>
                <p>
                  Advanced feedback widgets include screenshot capture capabilities. When users
                  report bugs, they can capture screenshots directly from your application, annotate
                  them to highlight issues, and submit them instantly. This visual context makes bug
                  reports much more actionable.
                </p>
                <p>
                  Many widgets also automatically collect technical context: browser information,
                  console logs, network requests, and user actions. This automatic context
                  collection ensures that bug reports are complete and actionable without requiring
                  users to provide technical details manually.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Customization and Branding
                </h2>
                <p>
                  Feedback widgets should match your brand's design. Most widgets allow you to
                  customize:
                </p>
                <ul>
                  <li>Colors and themes</li>
                  <li>Fonts and typography</li>
                  <li>Button styles and icons</li>
                  <li>Form fields and labels</li>
                  <li>Position and size</li>
                </ul>
                <p>
                  This customization ensures that the widget feels native to your application, not
                  like a third-party add-on. Some widgets even allow you to remove their branding
                  entirely on paid plans.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Integration and Workflow
                </h2>
                <p>
                  Feedback widgets integrate with your existing tools and workflows. When feedback
                  is submitted, it can:
                </p>
                <ul>
                  <li>Create issues in project management tools (Linear, Jira, GitHub)</li>
                  <li>Send notifications to Slack or other communication tools</li>
                  <li>Trigger webhooks for custom integrations</li>
                  <li>Store feedback in your database via API</li>
                </ul>
                <p>
                  This integration ensures that feedback flows seamlessly into your team's workflow,
                  making it easy to act on user input.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Best Practices for Using Feedback Widgets
                </h2>
                <p>To get the most out of feedback widgets, follow these best practices:</p>
                <ul>
                  <li>Make the widget easily accessible but not intrusive</li>
                  <li>Use clear, friendly copy that encourages feedback</li>
                  <li>Customize the widget to match your brand</li>
                  <li>Provide immediate confirmation when feedback is submitted</li>
                  <li>Follow up with users when their feedback is acted upon</li>
                  <li>Use analytics to understand feedback patterns</li>
                </ul>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">Conclusion</h2>
                <p>
                  Feedback widgets are powerful tools for collecting user feedback in SaaS
                  applications. They're easy to install, highly customizable, and integrate
                  seamlessly with your workflow. By understanding how they work and following best
                  practices, you can use feedback widgets to collect valuable user input that helps
                  you build better products.
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
                  Ready to Add a Feedback Widget?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Get started with Reflect's feedback widget. Easy installation, full customization,
                  and seamless integrations.
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
