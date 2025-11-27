import { memo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

import {
  ArrowRight,
  MessageSquare,
  Layout,
  Bug,
  Lightbulb,
  DollarSign,
  BookOpen,
  GitCompare,
  Plug,
} from 'lucide-react'

const links = [
  {
    title: 'Features',
    description: 'Discover powerful in-app feedback tools for SaaS teams.',
    href: '/features',
    icon: <MessageSquare className="h-6 w-6" />,
  },
  {
    title: 'Feedback Widget',
    description: 'A beautiful, lightweight widget that installs in minutes.',
    href: '/feedback-widget',
    icon: <Layout className="h-6 w-6" />,
  },
  {
    title: 'Bug Reporting',
    description: 'Capture bugs with screenshots and automatic context.',
    href: '/bug-reporting',
    icon: <Bug className="h-6 w-6" />,
  },
  {
    title: 'Feature Requests',
    description: 'Collect, organize, and prioritize what users want.',
    href: '/feature-requests',
    icon: <Lightbulb className="h-6 w-6" />,
  },
  {
    title: 'Pricing',
    description: 'Simple, transparent pricing with a free plan available.',
    href: '/pricing',
    icon: <DollarSign className="h-6 w-6" />,
  },
  {
    title: 'Blog',
    description: 'Learn how great SaaS teams collect and act on feedback.',
    href: '/blog',
    icon: <BookOpen className="h-6 w-6" />,
  },
  {
    title: 'Comparisons',
    description: 'See how Reflect compares to Canny, UserVoice, and more.',
    href: '/comparisons/reflect-vs-canny',
    icon: <GitCompare className="h-6 w-6" />,
  },
  {
    title: 'Integrations',
    description: 'Connect Reflect with Slack, Linear, GitHub, and more.',
    href: '/integrations/slack',
    icon: <Plug className="h-6 w-6" />,
  },
]

export const InternalLinksSection = memo(() => {
  return (
    <motion.section
      id="internal-links"
      className="bg-background py-12 sm:py-16 lg:py-20"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Explore Reflect
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn more about our features, tools, and how we help SaaS teams collect better
            feedback.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {links.map((link, index) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link
                to={link.href}
                className="group block bg-card rounded-2xl p-6 border border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/50"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 text-primary group-hover:scale-110 transition-transform duration-300">
                    {link.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">{link.description}</p>
                    <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                      <span>Learn more</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
})

InternalLinksSection.displayName = 'InternalLinksSection'
