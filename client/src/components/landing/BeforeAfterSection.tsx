import { XCircle, CheckCircle } from 'phosphor-react'
import { motion } from 'framer-motion'

const beforeItems = [
  'Hard to identify friction points',
  '$189/months and 4 tools to handle all kind of feedback',
  'Blind decisions based on assumptions',
  'Annoying email surveys that disrupt users',
  'Back and forth emails exchange to understand the client context (OS, broken urls, etc.)',
  'Missed opportunities to improve customer experience',
]

const afterItems = [
  'User context provided in all bug reports (browser, device, screen size, etc.)',
  'Engage visitors with targeted, non-intrusive feedback widgets',
  'Centralized dashboard for all feedback',
  '3-minute setup with no-code installation',
  'Shareable public roadmap',
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
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

export const BeforeAfterSection = () => {
  return (
    <motion.div
      id="features"
      className="bg-background py-24 sm:py-32"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div className="mx-auto max-w-3xl text-center" variants={containerVariants}>
          <motion.h2
            className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl leading-tight"
            variants={itemVariants}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Stop guessing, start{' '}
            <motion.span
              className="text-primary"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              viewport={{ once: true }}
            >
              listening
            </motion.span>
          </motion.h2>
          <motion.p
            className="mt-8 text-xl leading-8 text-muted-foreground max-w-3xl mx-auto"
            variants={itemVariants}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Move from scattered feedback and blind decisions to a clear, centralized hub of user
            insights. See the difference Reflect makes.
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-28 grid grid-cols-1 gap-20 rounded-3xl lg:grid-cols-2 lg:gap-20 bg-gradient-to-br from-slate-50 to-white p-16 shadow-2xl border border-slate-200/50"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          {/* Before Column */}
          <motion.div
            className="p-12"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <motion.h3
              className="text-4xl font-bold text-slate-800 mb-10 tracking-tight"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              viewport={{ once: true }}
            >
              Before...
            </motion.h3>
            <div className="space-y-8">
              {beforeItems.map((item, index) => (
                <motion.div
                  key={index}
                  className={`bg-white p-8 rounded-2xl shadow-lg border border-red-200/50 flex items-center gap-5 hover:shadow-xl hover:border-red-300/50 transition-all duration-300 ${
                    index % 2 === 0 ? '-rotate-1 hover:rotate-0' : 'rotate-1 hover:rotate-0'
                  }`}
                  initial={{ opacity: 0, x: -30, rotate: index % 2 === 0 ? -10 : 10 }}
                  whileInView={{
                    opacity: 1,
                    x: 0,
                    rotate: index % 2 === 0 ? -1 : 1,
                  }}
                  transition={{
                    duration: 0.6,
                    delay: 0.7 + index * 0.1,
                    ease: 'easeOut',
                  }}
                  whileHover={{
                    scale: 1.02,
                    rotate: 0,
                    transition: { duration: 0.2 },
                  }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1, type: 'spring', stiffness: 200 }}
                    viewport={{ once: true }}
                  >
                    <XCircle className="h-7 w-7 text-red-500 flex-shrink-0" />
                  </motion.div>
                  <p className="text-slate-700 text-lg leading-relaxed">{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* After Column */}
          <motion.div
            className="relative rounded-2xl p-12 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200/50 shadow-2xl hover:shadow-3xl transition-shadow duration-300"
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="absolute top-0 right-0 -mt-4 -mr-4 bg-red-500 text-white font-bold py-2 px-4 rounded-full text-sm shadow-lg"
              initial={{ opacity: 0, scale: 0, rotate: -45 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
              viewport={{ once: true }}
            >
              RECOMMENDED
            </motion.div>
            <motion.h3
              className="text-4xl font-bold mb-10 tracking-tight text-slate-800"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              viewport={{ once: true }}
            >
              With Reflect
            </motion.h3>
            <motion.div
              className="bg-white/60 p-10 rounded-2xl backdrop-blur-sm border border-green-200/30"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              viewport={{ once: true }}
            >
              <ul className="space-y-8">
                {afterItems.map((item, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start gap-6"
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.8 + index * 0.1,
                      ease: 'easeOut',
                    }}
                    viewport={{ once: true }}
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{
                        delay: 0.9 + index * 0.1,
                        type: 'spring',
                        stiffness: 200,
                      }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle className="h-7 w-7 text-green-500 flex-shrink-0 mt-1" />
                    </motion.div>
                    <p className="text-lg text-slate-700 leading-relaxed font-medium">{item}</p>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.button
            onClick={() => (window.location.href = '/login')}
            className="inline-block rounded-2xl bg-red-500 px-12 py-6 text-xl font-semibold text-white shadow-xl hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 transition-all duration-300 border border-red-500/20"
            whileHover={{
              scale: 1.02,
              boxShadow: '0 25px 50px rgba(220, 38, 38, 0.4)',
            }}
            whileTap={{ scale: 0.98 }}
          >
            Ready to improve your customer experience?
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}
