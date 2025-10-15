import { useState } from 'react'
import { FaqItem } from './FaqItem'
import {
  LifeBuoy,
  Timer,
  BadgeCheck,
  MessageSquare,
  Paintbrush,
  Smartphone,
  BarChart3,
} from 'lucide-react'
import { motion } from 'framer-motion'

const faqData = [
  {
    question: 'How long does installation take?',
    answer:
      "Installation is incredibly fast and takes less than 30 seconds. It just involves copying a single line of code into your website's HTML.",
    icon: <Timer size={24} />,
  },
  {
    question: 'Is there really a free plan?',
    answer:
      'Yes, absolutely! Our free plan includes core features to start collecting valuable feedback from your users, with the option to upgrade for more features.',
    icon: <BadgeCheck size={24} />,
  },
  {
    question: 'What types of feedback can I collect?',
    answer:
      'You can collect various types of feedback, including bug reports, feature suggestions, general comments, and reviews. Our widget is flexible to suit your needs.',
    icon: <MessageSquare size={24} />,
  },
  {
    question: "Can I customize the widget's appearance?",
    answer:
      "Yes, you can customize the colors, position, and text of the widget to perfectly match your brand's look and feel directly from your dashboard.",
    icon: <Paintbrush size={24} />,
  },
  {
    question: 'Does it work on mobile?',
    answer:
      'Of course. The Reflect widget is fully responsive and designed to work flawlessly on all devices, including desktops, tablets, and smartphones.',
    icon: <Smartphone size={24} />,
  },
  {
    question: 'What kind of analytics do you provide?',
    answer:
      'We provide a comprehensive analytics dashboard that shows you trends in your feedback, common themes, and user satisfaction scores over time.',
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
  <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16">
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
                className="mt-4 text-3xl font-bold leading-9 tracking-tight text-foreground sm:text-4xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                Frequently Asked Questions
              </motion.h2>
              <motion.p
                className="mt-6 text-lg leading-7 text-muted-foreground"
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
                className="mt-12 inline-flex items-center gap-4 rounded-2xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-xl hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all"
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
                >
                  <LifeBuoy className="h-5 w-5" />
                </motion.div>
                Contact Support
              </motion.button>
            </motion.div>
            <motion.div
              className="mt-12 lg:col-span-7 lg:mt-0"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <dl className="space-y-6">
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
