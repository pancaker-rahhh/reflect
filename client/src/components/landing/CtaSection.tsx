import { CheckCircle, Rocket } from 'phosphor-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export const CtaSection = () => {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    navigate('/login')
  }

  return (
    <section id="cta" className="bg-background py-16 sm:py-24">
      <div className="container mx-auto px-6">
        <motion.div
          className="relative isolate overflow-hidden bg-gradient-to-r from-primary to-primary/80 shadow-2xl rounded-3xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="p-8 md:p-16 lg:p-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div
              className="text-white"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Ready to 10x Your Feedback?
              </h2>
              <p className="mt-6 text-lg text-primary-foreground/80">
                Join hundreds of innovative companies who set up in minutes and see immediate
                results. No credit card required, ever.
              </p>
              <ul className="mt-8 space-y-4 text-primary-foreground/70">
                <motion.li
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <CheckCircle className="text-success" size={22} />
                  <span>
                    <span className="font-semibold">Completely Free:</span> Get started without any
                    cost.
                  </span>
                </motion.li>
                <motion.li
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  viewport={{ once: true }}
                >
                  <CheckCircle className="text-success" size={22} />
                  <span>
                    <span className="font-semibold">Effortless 3-Min Setup:</span> A single line of
                    code is all it takes.
                  </span>
                </motion.li>
                <motion.li
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  viewport={{ once: true }}
                >
                  <CheckCircle className="text-success" size={22} />
                  <span>
                    <span className="font-semibold">Modular by Design:</span> Enable only the
                    features you need.
                  </span>
                </motion.li>
              </ul>
              <motion.button
                onClick={handleGetStarted}
                className="mt-10 inline-flex items-center gap-3 rounded-md bg-background px-6 py-3 text-base font-semibold text-primary shadow-sm hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                viewport={{ once: true }}
              >
                Get Started for Free
                <Rocket size={18} />
              </motion.button>
            </motion.div>

            {/* Visual Representation */}
            <motion.div
              className="hidden lg:block relative w-full h-full"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300 overflow-hidden"
                whileHover={{ scale: 1.02 }}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between p-6 bg-surface-2 border-b border-border">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">👋</span>
                    <p className="font-bold text-lg text-foreground">How can we help?</p>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    &times;
                  </button>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-info/10 rounded-lg border border-info/20 hover:bg-info/20 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 text-info">
                        <span className="text-lg">🐛</span>
                        <span className="font-medium text-sm">Bug Report</span>
                      </div>
                    </div>
                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 text-primary">
                        <span className="text-lg">💡</span>
                        <span className="font-medium text-sm">Feature Request</span>
                      </div>
                    </div>
                    <div className="p-4 bg-success/10 rounded-lg border border-success/20 hover:bg-success/20 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 text-success">
                        <span className="text-lg">⭐</span>
                        <span className="font-medium text-sm">Review</span>
                      </div>
                    </div>
                    <div className="p-4 bg-warning/10 rounded-lg border border-warning/20 hover:bg-warning/20 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 text-warning">
                        <span className="text-lg">💬</span>
                        <span className="font-medium text-sm">General</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    Choose a feedback type to get started
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
