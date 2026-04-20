import { memo } from 'react'
import { motion } from 'framer-motion'

const pills = ['Free plan', 'No credit card', '3-min install', 'Works in any stack']

export const SocialProofSection = memo(() => {
  return (
    <motion.section
      className="bg-surface-2 py-8 sm:py-10"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3">
          {pills.map((pill, index) => (
            <div key={pill} className="flex items-center gap-x-6">
              <span className="text-sm sm:text-base font-medium text-muted-foreground">
                {pill}
              </span>
              {index < pills.length - 1 && (
                <span className="text-muted-foreground/40 select-none">·</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  )
})

SocialProofSection.displayName = 'SocialProofSection'
