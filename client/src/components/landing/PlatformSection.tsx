import { useState } from 'react'
import {
  Bug,
  ChartBar,
  FileText,
  Lightbulb,
  GitMerge,
  Star,
  Play,
  CaretLeft,
  CaretRight,
  Check,
} from 'phosphor-react'
import { motion } from 'framer-motion'

const features = [
  {
    name: 'Bug Reports',
    icon: Bug,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    title: 'Streamline Your Bug Tracking',
    description:
      'Track and manage bug reports with detailed information, screenshots, and priority levels. Users can easily report issues with screenshot capture.',
    keyFeatures: [
      'Screenshot capture',
      'Priority classification',
      'Status tracking',
      'Automatic link where the bug is reported',
    ],
    image: 'https://placehold.co/1200x800/2d3748/ffffff?text=Bug+Reports+UI',
  },
  {
    name: 'Dashboard',
    icon: ChartBar,
    color: 'text-info',
    bgColor: 'bg-info/10',
    title: 'Get a Complete Overview',
    description:
      'Our comprehensive analytics dashboard gives you real-time insights and performance metrics to track your user engagement and feedback trends.',
    keyFeatures: [
      'Real-time analytics',
      'Performance metrics',
      'Customizable widgets',
      'Track user engagement',
    ],
    image: 'https://placehold.co/1200x800/4a5568/ffffff?text=Dashboard+UI',
  },
  {
    name: 'Survey',
    icon: FileText,
    color: 'text-success',
    bgColor: 'bg-success/10',
    title: 'Create Powerful Surveys',
    description:
      'Build custom surveys, NPS, and CSAT forms to gather targeted feedback. Understand your users better with flexible and powerful form creation.',
    keyFeatures: [
      'NPS & CSAT forms',
      'Custom form builder',
      'Conditional logic',
      'In-depth response analysis',
    ],
    image: 'https://placehold.co/1200x800/718096/ffffff?text=Survey+UI',
  },
  {
    name: 'Feature Requests',
    icon: Lightbulb,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    title: 'Prioritize Your Roadmap',
    description:
      'Let your users submit ideas and vote on their favorite features. Our voting system helps you build a data-driven roadmap your users will love.',
    keyFeatures: [
      'Public voting system',
      'Feature status updates',
      'User comment threads',
      'Internal team notes',
    ],
    image: 'https://placehold.co/1200x800/a0aec0/ffffff?text=Feature+Requests+UI',
  },
  {
    name: 'Roadmap',
    icon: GitMerge,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    title: 'Share Your Vision',
    description:
      "Keep your users in the loop with a beautiful, public-facing roadmap. Show them what you're working on and what's coming next to build trust and excitement.",
    keyFeatures: [
      'Public & private roadmaps',
      'Drag-and-drop interface',
      'User subscriptions for updates',
      'Link to feature requests',
    ],
    image: 'https://placehold.co/1200x800/a0aec0/ffffff?text=Roadmap+UI',
  },
  {
    name: 'Reviews & Testimonials',
    icon: Star,
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    title: 'Showcase Social Proof',
    description:
      'Easily collect and display glowing reviews and testimonials from your happiest customers. Build trust and credibility with authentic social proof.',
    keyFeatures: [
      'Collect text & video testimonials',
      'Embeddable review widgets',
      'Request reviews from specific users',
      'Schema markup for SEO',
    ],
    image: 'https://placehold.co/1200x800/a0aec0/ffffff?text=Reviews+UI',
  },
]

export const PlatformSection = () => {
  const [activeIndex, setActiveIndex] = useState(0)

  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % features.length)
  }

  const handlePrev = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + features.length) % features.length)
  }

  const activeFeature = features[activeIndex]

  return (
    <motion.div
      id="platform"
      className="bg-background py-16 sm:py-20 lg:py-24"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            One platform to handle your <span className="text-primary">feedback</span>
          </motion.h2>
          <motion.p
            className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-muted-foreground max-w-3xl mx-auto px-4 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Explore our key features through real screenshots of the platform. See how Reflect can
            streamline your entire feedback lifecycle.
          </motion.p>
        </motion.div>

        <div className="mt-12 sm:mt-16 lg:mt-24 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex justify-start sm:justify-center space-x-3 sm:space-x-4 lg:space-x-6 min-w-max sm:min-w-0">
            {features.map((feature, index) => (
              <button
                key={feature.name}
                onClick={() => setActiveIndex(index)}
                className={`flex-shrink-0 flex items-center gap-2 sm:gap-4 rounded-xl sm:rounded-2xl px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold transition-all duration-300 ${
                  activeIndex === index
                    ? 'bg-primary text-primary-foreground shadow-xl'
                    : 'bg-background text-muted-foreground hover:bg-muted ring-1 ring-inset ring-border/50 hover:shadow-lg'
                }`}
              >
                <feature.icon
                  className={`h-4 w-4 sm:h-5 sm:w-5 ${
                    activeIndex === index ? 'text-primary-foreground' : feature.color
                  }`}
                />
                <span className="whitespace-nowrap">{feature.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 sm:mt-16 rounded-2xl sm:rounded-3xl bg-background p-4 sm:p-8 lg:p-12 shadow-2xl ring-1 ring-border/30">
          <div className="grid grid-cols-1 gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="relative aspect-video w-full rounded-xl sm:rounded-2xl overflow-hidden group shadow-xl">
              <img
                src={activeFeature.image}
                alt={`${activeFeature.name} UI`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <button className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
                  <Play className="h-8 w-8 sm:h-10 sm:w-10" fill="currentColor" />
                </button>
              </div>
            </div>

            <div>
              <div
                className={`inline-flex items-center gap-2 sm:gap-3 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 ${activeFeature.bgColor}`}
              >
                <activeFeature.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${activeFeature.color}`} />
                <h3 className={`text-sm sm:text-base font-bold ${activeFeature.color}`}>
                  {activeFeature.name}
                </h3>
              </div>
              <h4 className="mt-6 sm:mt-8 text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {activeFeature.title}
              </h4>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-muted-foreground">
                {activeFeature.description}
              </p>
              <ul className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
                {activeFeature.keyFeatures.map((kf) => (
                  <li key={kf} className="flex items-center gap-3 sm:gap-4 text-sm sm:text-base text-muted-foreground">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 flex-none text-primary" />
                    <span>{kf}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 flex items-center justify-between px-2 sm:px-0">
            <button
              onClick={handlePrev}
              className="p-1.5 sm:p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Previous feature"
            >
              <CaretLeft className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {features.map((_, index) => (
                <button
                  key={`dot-${index}`}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full transition-colors ${
                    activeIndex === index ? 'bg-primary' : 'bg-muted hover:bg-muted-foreground'
                  }`}
                  aria-label={`Go to feature ${index + 1}`}
                />
              ))}
            </div>
            <button
              onClick={handleNext}
              className="p-1.5 sm:p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Next feature"
            >
              <CaretRight className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
