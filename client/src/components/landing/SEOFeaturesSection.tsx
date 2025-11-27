import { memo } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Bug, Lightbulb, Layout, CheckCircle2 } from 'lucide-react'

const features = [
  {
    title: 'In-App Feedback Tool',
    description:
      'Reflect makes it easy to collect feedback from users directly inside your application. With one simple widget, customers can submit suggestions, report issues, or share ideas without leaving your product.',
    icon: <MessageSquare className="h-8 w-8" />,
  },
  {
    title: 'Bug Reporting Tool',
    description:
      'Users can capture screenshots, annotate issues, and send detailed bug reports instantly. Reflect gives your team clearer visibility so you can fix problems faster and reduce churn.',
    icon: <Bug className="h-8 w-8" />,
  },
  {
    title: 'Feature Request Tool',
    description:
      'Let users vote, submit, and prioritize the features they want most. Reflect organizes requests for you automatically so your team can build what customers actually need.',
    icon: <Lightbulb className="h-8 w-8" />,
  },
  {
    title: 'Feedback Widget',
    description:
      'Our feedback widget installs in minutes and blends seamlessly into your UI. Customize its design, fields, and categories to match your brand.',
    icon: <Layout className="h-8 w-8" />,
  },
]

const benefits = [
  'Capture feedback at the moment it happens',
  'Reduce support inbox noise',
  'Understand what features matter most',
  'Fix bugs faster with screenshot reports',
  'Build a better product using real customer insights',
]

export const SEOFeaturesSection = memo(() => {
  return (
    <motion.section
      id="seo-features"
      className="bg-background py-12 sm:py-16 lg:py-20"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Feature Cards */}
        <div className="grid grid-cols-1 gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-2 mb-16 sm:mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-lg hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 text-primary">{feature.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Why SaaS Teams Use Reflect */}
        <motion.div
          className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 border border-primary/20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-6 sm:mb-8 text-center">
            Why SaaS Teams Use Reflect
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {benefits.map((benefit, index) => (
              <motion.li
                key={index}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                viewport={{ once: true }}
              >
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground text-sm sm:text-base">{benefit}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </motion.section>
  )
})

SEOFeaturesSection.displayName = 'SEOFeaturesSection'
