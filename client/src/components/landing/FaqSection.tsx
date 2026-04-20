import { useState, memo } from 'react'
import { FaqItem } from './FaqItem'
import { LifeBuoy, Timer, Bug, Lightbulb, BadgeCheck, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

const faqData = [
  {
    question: 'What is an in-app feedback tool?',
    answer:
      '3 minutes from signup to live. One line of code — no developer needed.',
    icon: <Timer size={24} />,
  },
  {
    question: "What's the catch with the free plan?",
    answer:
      "No catch — it's free forever: 1 widget, 20 responses/month, full customization. When you need more, Pro is $9.99/month.",
    icon: <BadgeCheck size={24} />,
  },
  {
    question: 'Can users report bugs with screenshots?',
    answer: 'Yes. Reflect includes screenshot capture and annotation.',
    icon: <Bug size={24} />,
  },
  {
    question: 'Does Reflect support feature requests?',
    answer: 'Yes. Users can submit and vote on features.',
    icon: <Lightbulb size={24} />,
  },
  {
    question: 'Is Reflect easy to install?',
    answer: 'Yes. It takes less than 5 minutes with a single script.',
    icon: <Clock size={24} />,
  },
]

export const FaqSection = memo(() => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  // FAQ Schema Markup for SEO
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <motion.div
      id="faq"
      className="bg-background"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-16">
            <motion.div
              className="lg:col-span-5"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <motion.p
                className="text-lg font-semibold leading-7 text-primary"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                viewport={{ once: true }}
              >
                FAQ
              </motion.p>
              <motion.h2
                className="mt-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-9 tracking-tight text-foreground"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                viewport={{ once: true }}
              >
                Common questions
              </motion.h2>
              <motion.p
                className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                viewport={{ once: true }}
              >
                All the answers to start collecting your feedback today. Can&apos;t find the answer
                you&apos;re looking for? Reach out to our customer support team.
              </motion.p>
              <motion.button
                onClick={() => (window.location.href = '/login')}
                className="mt-8 sm:mt-12 inline-flex items-center gap-3 sm:gap-4 rounded-2xl bg-primary px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-primary-foreground shadow-xl hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all w-full sm:w-auto justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 10px 25px rgba(220, 38, 38, 0.3)',
                }}
                whileTap={{ scale: 0.95 }}
                viewport={{ once: true }}
              >
                <div className="flex-shrink-0">
                  <LifeBuoy className="h-5 w-5" />
                </div>
                <span>Contact Support</span>
              </motion.button>
            </motion.div>
            <motion.div
              className="mt-10 sm:mt-12 lg:col-span-7 lg:mt-0"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <dl className="space-y-4 sm:space-y-6">
                {faqData.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.06,
                      ease: [0.25, 0.46, 0.45, 0.94],
                      type: 'spring',
                      stiffness: 100,
                    }}
                    whileHover={{
                      y: -3,
                      transition: { type: 'spring', stiffness: 400, damping: 25 },
                    }}
                    viewport={{ once: true }}
                  >
                    <FaqItem
                      question={faq.question}
                      answer={faq.answer}
                      icon={faq.icon}
                      isOpen={openIndex === index}
                      onClick={() => handleToggle(index)}
                    />
                  </motion.div>
                ))}
              </dl>
            </motion.div>
          </div>
        </div>
      </div>

      {/* FAQ Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </motion.div>
  )
})

FaqSection.displayName = 'FaqSection'
