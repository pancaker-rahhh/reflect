import { useState } from 'react'
import { FaqItem } from './FaqItem'
import { LifeBuoy, Timer, BadgeCheck, Zap, Paintbrush, Smartphone, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'

const faqData = [
  {
    question: 'How fast can I start collecting feedback?',
    answer:
      '3 minutes from signup to live. One line of code, zero configuration, no developer needed. Your first user feedback could arrive before you finish your coffee.',
    icon: <Timer size={24} />,
  },
  {
    question: "What's the catch with the free plan?",
    answer:
      "No catch. It's free forever—1 widget, 20 responses/month, full customization. No credit card, no surprise charges. When you outgrow it, Pro is $29/month for unlimited everything.",
    icon: <BadgeCheck size={24} />,
  },
  {
    question: 'Why not just use a Google Form?',
    answer:
      'Google Forms take users away from your site to fill out a separate page. Reflect lives directly in your app where users already are. Plus, you get voting on feature requests and a public roadmap—not just a spreadsheet of responses.',
    icon: <Zap size={24} />,
  },
  {
    question: "Can I make it look like it's part of my app?",
    answer:
      "Absolutely. Match your exact brand colors, choose your position, write your own copy. On Pro, remove our badge entirely—it'll look like you built it in-house.",
    icon: <Paintbrush size={24} />,
  },
  {
    question: 'Does it work on mobile?',
    answer:
      'Flawlessly. Your users on iPhone, Android, tablets, desktops—everyone gets the same smooth experience.',
    icon: <Smartphone size={24} />,
  },
  {
    question: 'How do I know what users actually want?',
    answer:
      'See exactly which features get the most upvotes, track feedback trends over time, and spot patterns in your dashboard. Filter by week, month, or year. No more guessing—build what users are literally voting for.',
    icon: <BarChart3 size={24} />,
  },
]

export const FaqSection = () => {
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
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-16">
            <motion.div
              className="lg:col-span-5"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <motion.p
                className="text-lg font-semibold leading-7 text-primary"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                viewport={{ once: true }}
              >
                FAQ
              </motion.p>
              <motion.h2
                className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-bold leading-9 tracking-tight text-foreground"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                Frequently Asked Questions
              </motion.h2>
              <motion.p
                className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
              >
                All the answers to start collecting your feedback today. Can&apos;t find the answer
                you&apos;re looking for? Reach out to our customer support team.
              </motion.p>
              <motion.button
                onClick={() => (window.location.href = '/login')}
                className="mt-8 sm:mt-12 inline-flex items-center gap-3 sm:gap-4 rounded-xl sm:rounded-2xl bg-primary px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-primary-foreground shadow-xl hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all w-full sm:w-auto justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 10px 25px rgba(220, 38, 38, 0.3)',
                }}
                whileTap={{ scale: 0.95 }}
                viewport={{ once: true }}
              >
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  className="flex-shrink-0"
                >
                  <LifeBuoy className="h-5 w-5" />
                </motion.div>
                <span>Contact Support</span>
              </motion.button>
            </motion.div>
            <motion.div
              className="mt-10 sm:mt-12 lg:col-span-7 lg:mt-0"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <dl className="space-y-4 sm:space-y-6">
                {faqData.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.6 + index * 0.08,
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
}
