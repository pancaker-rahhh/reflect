import { memo } from 'react'
import { XCircle, CheckCircle } from 'phosphor-react'
import { motion } from 'framer-motion'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const SUNSET_MSG = 'Reflect has been sunset and is no longer accepting new sign-ups.'

const beforeItems = [
  'Spending $189/month on 4 different tools',
  'The loudest voice wins - not the majority',
  'No idea what your NPS actually is - never measured it',
  'Bugs reported via Slack DMs, emails, everywhere',
  'Support keeps answering the same questions',
  'Building features based on assumptions, not votes',
]

const afterItems = [
  'One widget at $9.99/month - all feedback types',
  'Every voice counts - see which ideas get 100+ votes',
  'Track NPS, CSAT, CES over time',
  'Organized bug reports with priority levels',
  'Public roadmap shows users you listen',
  '3-minute setup - no developer needed',
  'Real-time analytics dashboard',
  'Custom branding - looks like your app',
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
  },
}

export const BeforeAfterSection = memo(() => {
  return (
    <motion.div
      id="features"
      className="bg-background py-12 sm:py-16 lg:py-20"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div className="mx-auto max-w-3xl text-center" variants={containerVariants}>
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight"
            variants={itemVariants}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Replace four tools with{' '}
            <em className="font-serif italic font-normal">one widget.</em>
          </motion.h2>
        </motion.div>

        <motion.div
          className="mt-12 sm:mt-16 lg:mt-20 grid grid-cols-1 gap-8 sm:gap-10 rounded-2xl sm:rounded-3xl lg:grid-cols-2 lg:gap-12 bg-gradient-to-br from-slate-50 to-white p-4 sm:p-6 lg:p-8 shadow-2xl border border-slate-200/50"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          viewport={{ once: true }}
        >
          {/* Before Column */}
          <motion.div
            className="p-4 sm:p-6 lg:p-8"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <motion.h3
              className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8 tracking-tight"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              Before...
            </motion.h3>
            <div className="space-y-4 sm:space-y-6">
              {beforeItems.map((item, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-red-200/50 flex items-start sm:items-center gap-3 sm:gap-4 hover:shadow-xl hover:border-red-300/50 transition-all duration-150"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  viewport={{ once: true }}
                >
                  <XCircle className="h-6 w-6 sm:h-7 sm:w-7 text-destructive flex-shrink-0 mt-0.5 sm:mt-0" />
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* After Column */}
          <motion.div
            className="relative rounded-2xl p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200/50 shadow-2xl hover:shadow-3xl transition-shadow duration-300"
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-destructive text-destructive-foreground font-bold py-1.5 px-3 sm:py-2 sm:px-4 rounded-full text-xs sm:text-sm shadow-lg"
              initial={{ opacity: 0, scale: 0, rotate: -45 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              viewport={{ once: true }}
            >
              RECOMMENDED
            </motion.div>
            <motion.h3
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 lg:mb-10 tracking-tight text-foreground"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              With Reflect
            </motion.h3>
            <motion.div
              className="bg-white/60 p-6 sm:p-8 lg:p-10 rounded-xl sm:rounded-2xl backdrop-blur-sm border border-green-200/30"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <ul className="grid grid-cols-1 md:grid-cols-1 gap-6 sm:gap-8">
                {afterItems.map((item, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start gap-4 sm:gap-6"
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.06,
                      ease: 'easeOut',
                    }}
                    viewport={{ once: true }}
                  >
                    <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                      <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 text-green-500" />
                    </div>
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium">
                      {item}
                    </p>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="text-center mt-12 sm:mt-16 lg:mt-20 px-4 sm:px-0"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0} className="inline-block cursor-not-allowed w-full sm:w-auto">
                <button
                  disabled
                  aria-disabled="true"
                  className="inline-block rounded-2xl bg-destructive px-8 sm:px-12 py-4 sm:py-6 text-base sm:text-lg lg:text-xl font-semibold text-destructive-foreground shadow-xl opacity-50 pointer-events-none transition-all duration-300 border border-destructive/20 w-full sm:w-auto"
                >
                  See it in action
                </button>
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-foreground text-background max-w-[220px] text-center">
              {SUNSET_MSG}
            </TooltipContent>
          </Tooltip>
        </motion.div>
      </div>
    </motion.div>
  )
})
