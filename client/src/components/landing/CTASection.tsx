import { memo } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export const CTASection = memo(() => {
  return (
    <motion.section
      id="cta"
      className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-12 sm:py-16 lg:py-20"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6">
            Custom-Branded Widget That Installs in Minutes
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto">
            Drop in one snippet, match your colors, and start capturing structured feedback without
            touching the rest of your stack.
          </p>
          <motion.button
            onClick={() => (window.location.href = '/login')}
            className="inline-flex items-center gap-3 rounded-2xl bg-primary px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-semibold text-primary-foreground shadow-xl hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all border border-primary/20"
            whileHover={{
              scale: 1.05,
              boxShadow: '0 25px 50px rgba(220, 38, 38, 0.4)',
            }}
            whileTap={{ scale: 0.95 }}
          >
            Install the Widget
            <ArrowRight className="h-5 w-5" />
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  )
})

CTASection.displayName = 'CTASection'
