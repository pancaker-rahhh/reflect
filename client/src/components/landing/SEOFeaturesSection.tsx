import { memo } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Bug, Lightbulb, Layout, CheckCircle2 } from 'lucide-react'

const features = [
  {
    title: 'In-App Feedback Tool',
    description: 'Collect feedback, ideas, and requests — without leaving your app.',
    icon: <MessageSquare className="h-8 w-8" />,
  },
  {
    title: 'Bug Reporting Tool',
    description: 'Screenshots, annotations, and device details — sent directly to your dashboard.',
    icon: <Bug className="h-8 w-8" />,
  },
  {
    title: 'Feature Request Tool',
    description: 'Let users vote on features. Build what they actually want.',
    icon: <Lightbulb className="h-8 w-8" />,
  },
  {
    title: 'Feedback Widget',
    description: 'Installs in minutes. Matches your brand. Zero friction for users.',
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
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-3xl mx-auto text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            One widget.{' '}
            <em className="font-serif italic font-normal">Four tools.</em>
          </h2>
        </motion.div>
        {/* Feature Cards */}
        <div className="grid grid-cols-1 gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-2 mb-16 sm:mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-lg hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
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
          transition={{ duration: 0.4, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-6 sm:mb-8 text-center">
            Why SaaS Teams Choose Reflect
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {benefits.map((benefit, index) => (
              <motion.li
                key={index}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.06 }}
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
