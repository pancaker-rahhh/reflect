import { memo } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const SUNSET_MSG = 'Reflect has been sunset and is no longer accepting new sign-ups.'

export const CTASection = memo(() => {
  return (
    <motion.section
      id="cta"
      className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-12 sm:py-16 lg:py-20"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6">
            Ready to{' '}
            <em className="font-serif italic font-normal">understand your users?</em>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto">
            Reflect has been sunset. Thanks for the ride.
          </p>
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0} className="inline-block cursor-not-allowed">
                <button
                  disabled
                  aria-disabled="true"
                  className="inline-flex items-center gap-3 rounded-2xl bg-primary px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-semibold text-primary-foreground shadow-xl opacity-50 pointer-events-none transition-all border border-primary/20"
                >
                  Get started for free
                  <ArrowRight className="h-5 w-5" />
                </button>
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-foreground text-background max-w-[220px] text-center">
              {SUNSET_MSG}
            </TooltipContent>
          </Tooltip>
        </motion.div>
      </div>
    </motion.section>
  )
})

CTASection.displayName = 'CTASection'
