import { motion } from 'framer-motion'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { SEOHead } from '@/components/common/SEOHead'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { usePageAnalytics } from '@/hooks/usePageAnalytics'
import { Link } from 'react-router-dom'

const blogPosts = [
  {
    title: 'How to Collect In-App Feedback Without Annoying Users',
    excerpt:
      'Learn best practices for collecting in-app feedback that users actually want to provide. Discover the right timing, placement, and messaging to maximize response rates.',
    date: '2024-11-20',
    readTime: '8 min read',
    category: 'UX Design',
    slug: '01-collect-in-app-feedback',
    canonicalPath: 'collect-in-app-feedback',
  },
  {
    title: 'The Psychology Behind Effective User Feedback Loops',
    excerpt:
      'Discover the psychological principles that make feedback loops successful. Learn how to motivate users to provide constructive input and feel heard.',
    date: '2024-11-18',
    readTime: '10 min read',
    category: 'Psychology',
    slug: '02-psychology-of-feedback',
    canonicalPath: 'psychology-of-feedback',
  },
  {
    title: 'Top 5 In-App Feedback Tools for SaaS in 2025',
    excerpt:
      'A comprehensive review of the leading in-app feedback tools available for SaaS companies this year. Compare features, pricing, and usability to find your perfect match.',
    date: '2024-11-15',
    readTime: '12 min read',
    category: 'Guides',
    slug: '03-best-in-app-feedback-tools',
    canonicalPath: 'best-in-app-feedback-tools',
  },
  {
    title: 'In-App vs. Email Feedback: Which is Better for Your Product?',
    excerpt:
      'An in-depth comparison of collecting feedback directly in-app versus through email. Explore the pros and cons of each method and determine the optimal strategy for your product.',
    date: '2024-11-12',
    readTime: '7 min read',
    category: 'Product',
    slug: '04-inapp-vs-email-feedback',
    canonicalPath: 'inapp-vs-email-feedback',
  },
  {
    title: 'How to Get Better Bug Reports from Users',
    excerpt:
      'Learn how to collect better bug reports with screenshots, context, and actionable details. Discover best practices for bug reporting workflows that help your team fix issues faster.',
    date: '2024-11-10',
    readTime: '9 min read',
    category: 'Engineering',
    slug: '05-get-better-bug-reports',
    canonicalPath: 'get-better-bug-reports',
  },
  {
    title: 'Screenshot Bug Reporting: A Game Changer for SaaS Teams',
    excerpt:
      'Explore how integrated screenshot capture and annotation in bug reporting can revolutionize your development workflow and accelerate issue resolution.',
    date: '2024-11-08',
    readTime: '8 min read',
    category: 'Engineering',
    slug: '06-screenshot-bug-reporting',
    canonicalPath: 'screenshot-bug-reporting',
  },
  {
    title: 'Building Effective Bug Workflows for SaaS Teams',
    excerpt:
      'Learn how to create efficient bug reporting workflows that help your team triage, prioritize, and fix issues faster. Discover best practices for bug management in SaaS products.',
    date: '2024-11-05',
    readTime: '10 min read',
    category: 'Engineering',
    slug: '07-bug-workflows-saas',
    canonicalPath: 'bug-workflows-saas',
  },
  {
    title: 'How to Let Users Report Bugs Inside Your App',
    excerpt:
      'Learn how to implement in-app bug reporting that makes it easy for users to report issues without leaving your application. Discover best practices for in-app bug reporting.',
    date: '2024-11-03',
    readTime: '8 min read',
    category: 'Engineering',
    slug: '08-report-bugs-inside-your-app',
    canonicalPath: 'report-bugs-inside-your-app',
  },
  {
    title: 'How Feedback Widgets Work: A Complete Guide',
    excerpt:
      'Learn how feedback widgets work, how to implement them, and best practices for using them to collect user feedback in your SaaS application.',
    date: '2024-11-01',
    readTime: '9 min read',
    category: 'Guides',
    slug: '09-how-feedback-widgets-work',
    canonicalPath: 'how-feedback-widgets-work',
  },
  {
    title: 'Feature Request Prioritization: A Data-Driven Approach',
    excerpt:
      'Learn how to prioritize feature requests using voting, analytics, and user segmentation. Stop guessing what features to build and start making data-driven decisions.',
    date: '2024-10-28',
    readTime: '11 min read',
    category: 'Product',
    slug: '10-feature-request-prioritization',
    canonicalPath: 'feature-request-prioritization',
  },
  {
    title: 'How to Build a Public Roadmap That Builds Trust',
    excerpt:
      'Learn how to create a public product roadmap that builds trust, manages expectations, and keeps users engaged. Discover best practices for public roadmaps in SaaS.',
    date: '2024-10-25',
    readTime: '9 min read',
    category: 'Product',
    slug: '11-build-public-roadmap',
    canonicalPath: 'build-public-roadmap',
  },
  {
    title: "Feature Voting vs. Feature Requests: What's the Difference?",
    excerpt:
      'Understand the difference between feature voting and feature requests, and learn when to use each approach to prioritize product development effectively.',
    date: '2024-10-22',
    readTime: '8 min read',
    category: 'Product',
    slug: '12-feature-voting-vs-requests',
    canonicalPath: 'feature-voting-vs-requests',
  },
  {
    title: 'Why Product Managers Fail at Feature Prioritization',
    excerpt:
      'Discover the common mistakes product managers make when prioritizing features and learn how to use data-driven approaches to make better decisions.',
    date: '2024-10-20',
    readTime: '10 min read',
    category: 'Product',
    slug: '13-why-pms-fail-prioritization',
    canonicalPath: 'why-pms-fail-prioritization',
  },
  {
    title: 'How to Close the Feedback Loop and Build User Trust',
    excerpt:
      'Learn why closing the feedback loop is essential for building user trust and engagement. Discover best practices for keeping users informed about their feedback.',
    date: '2024-10-18',
    readTime: '9 min read',
    category: 'Growth',
    slug: '14-close-feedback-loop',
    canonicalPath: 'close-feedback-loop',
  },
  {
    title: 'Asking the Right Feedback Questions: A Guide for SaaS Teams',
    excerpt:
      'Learn how to ask the right questions when collecting user feedback. Discover which questions yield actionable insights and which ones to avoid.',
    date: '2024-10-15',
    readTime: '8 min read',
    category: 'UX Design',
    slug: '15-right-feedback-questions',
    canonicalPath: 'right-feedback-questions',
  },
  {
    title: 'Customer Feedback for SaaS: A Complete Guide',
    excerpt:
      'Learn how to collect, analyze, and act on customer feedback in SaaS. Discover best practices for building a customer feedback system that drives product improvement.',
    date: '2024-10-12',
    readTime: '11 min read',
    category: 'Guides',
    slug: '16-customer-feedback-for-saas',
    canonicalPath: 'customer-feedback-for-saas',
  },
  {
    title: 'Building a Customer-Driven Product: A SaaS Guide',
    excerpt:
      'Learn how to build a customer-driven product by listening to users, prioritizing based on feedback, and making data-driven decisions. Discover the principles of customer-driven product development.',
    date: '2024-10-10',
    readTime: '10 min read',
    category: 'Product',
    slug: '17-customer-driven-product',
    canonicalPath: 'customer-driven-product',
  },
  {
    title: 'Building a Lean Feedback Loop for Faster Product Iteration',
    excerpt:
      'Learn how to build a lean feedback loop that helps you iterate faster and build better products. Discover principles and practices for efficient feedback collection and action.',
    date: '2024-10-08',
    readTime: '9 min read',
    category: 'Product',
    slug: '18-lean-feedback-loop',
    canonicalPath: 'lean-feedback-loop',
  },
  {
    title: 'Validate Features with In-App Surveys Before Building',
    excerpt:
      'Learn how to use in-app surveys to validate features before building them. Discover best practices for feature validation that saves time and resources.',
    date: '2024-10-05',
    readTime: '8 min read',
    category: 'Product',
    slug: '19-validate-features-inapp-surveys',
    canonicalPath: 'validate-features-inapp-surveys',
  },
  {
    title: 'How Feedback Loops Reduce Churn in SaaS',
    excerpt:
      'Learn how effective feedback loops can reduce customer churn by building trust, addressing concerns, and showing users that their input matters. Discover the connection between feedback and retention.',
    date: '2024-10-03',
    readTime: '10 min read',
    category: 'Growth',
    slug: '20-feedback-loops-reduce-churn',
    canonicalPath: 'feedback-loops-reduce-churn',
  },
]

export function BlogPage() {
  usePageAnalytics()

  const siteUrl = 'https://reflectfeedback.com'

  const blogItemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Reflect Blog - In-App Feedback & SaaS Product Growth',
    url: `${siteUrl}/blog`,
    itemListElement: blogPosts.map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${siteUrl}/blog/${post.canonicalPath}`,
      name: post.title,
      description: post.excerpt,
    })),
  }

  return (
    <>
      <SEOHead
        title="SaaS Feedback & Product Growth Blog - In-App Feedback Insights | Reflect"
        description="Expert articles on in-app feedback tools, SaaS UX, product-led growth, bug reporting workflows, feature prioritization, and customer feedback strategies. Learn from real SaaS teams."
        keywords="SaaS feedback blog, in-app feedback strategies, product feedback articles, bug reporting best practices, feature prioritization guides, SaaS product growth, user feedback insights"
        canonicalUrl="https://reflectfeedback.com/blog"
        ogImage="https://reflectfeedback.com/og-image.png"
        schemaType="blog"
        structuredData={blogItemListSchema}
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
                SaaS Feedback & Product Growth Insights
              </h1>
              <p className="mt-6 text-lg sm:text-xl leading-8 text-muted-foreground max-w-3xl mx-auto">
                Practical articles about user feedback strategies, in-app UX, bug reporting best
                practices, and how product teams prioritize features using feedback. Learn how
                successful SaaS teams use in-app feedback tools to build better products.
              </p>
              <p className="mt-4 text-base text-muted-foreground max-w-2xl mx-auto">
                Looking for alternatives to Canny, UserVoice, Sleekplan or Frill? See our comparison
                guides:{' '}
                <Link to="/comparisons/reflect-vs-canny" className="text-primary hover:underline">
                  Reflect vs Canny
                </Link>
                ,{' '}
                <Link
                  to="/comparisons/reflect-vs-uservoice"
                  className="text-primary hover:underline"
                >
                  Reflect vs UserVoice
                </Link>
                ,{' '}
                <Link
                  to="/comparisons/reflect-vs-sleekplan"
                  className="text-primary hover:underline"
                >
                  Reflect vs Sleekplan
                </Link>
                ,{' '}
                <Link to="/comparisons/reflect-vs-frill" className="text-primary hover:underline">
                  Reflect vs Frill
                </Link>
                .
              </p>
              <p className="mt-4 text-base text-muted-foreground max-w-2xl mx-auto">
                Explore our{' '}
                <Link to="/features" className="text-primary hover:underline">
                  feedback platform features
                </Link>{' '}
                or learn about our{' '}
                <Link to="/bug-reporting" className="text-primary hover:underline">
                  bug reporting tools
                </Link>{' '}
                to see how Reflect helps SaaS teams collect better feedback.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Blog Posts Section */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogPosts.map((post, index) => (
                  <Link key={post.slug} to={`/blog/posts/${post.slug}`}>
                    <motion.article
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="bg-card rounded-2xl p-6 border border-border shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer group h-full flex flex-col"
                    >
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                          {post.category}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-muted-foreground mb-4 leading-relaxed flex-grow">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(post.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                        <span>Read more</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </motion.article>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
