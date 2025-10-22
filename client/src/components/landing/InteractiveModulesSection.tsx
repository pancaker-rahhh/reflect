import { useState } from 'react'
import { Star, FileText, Bug, Lightbulb, ChatCircle, Lightning, X } from 'phosphor-react'
import { motion, AnimatePresence } from 'framer-motion'

// Define the structure for a module
interface Module {
  id: 'reviews' | 'surveys' | 'bugs' | 'features'
  name: string
  description: string
  icon: React.ReactNode
}

// Module data with specific icon colors
const modules: Module[] = [
  {
    id: 'reviews',
    name: 'Reviews & Surveys',
    description: 'Turn 5-star reviews into sales',
    icon: <Star className="text-success" />,
  },
  {
    id: 'surveys',
    name: 'Custom Surveys',
    description: 'Measure satisfaction, boost retention',
    icon: <FileText className="text-info" />,
  },
  {
    id: 'bugs',
    name: 'Bug Reports',
    description: 'Fix bugs 3x faster with context',
    icon: <Bug className="text-destructive" />,
  },
  {
    id: 'features',
    name: 'Feature Requests',
    description: 'Build what users actually want',
    icon: <Lightbulb className="text-primary" />,
  },
]

export const InteractiveModulesSection = () => {
  const [activeModules, setActiveModules] = useState({
    reviews: true,
    surveys: true,
    bugs: true,
    features: true,
  })

  const handleToggle = (id: Module['id']) => {
    setActiveModules((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const activeCount = Object.values(activeModules).filter(Boolean).length

  return (
    <motion.div
      id="interactive-modules"
      className="bg-surface-2 py-12 sm:py-16 lg:py-20"
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
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <span className="text-foreground">4 Feedback Tools</span>,{' '}
            <span className="text-primary">1 Widget</span>,{' '}
            <span className="text-foreground">$160/Month Saved</span>
          </motion.h2>
          <motion.p
            className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl leading-7 sm:leading-8 text-muted-foreground max-w-3xl mx-auto px-4 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <motion.span
              className="font-semibold text-primary"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              viewport={{ once: true }}
            >
              Toggle any module on/off
            </motion.span>{' '}
            and watch your widget adapt instantly. One code snippet powers all feedback types. The
            only widget that grows with your business.
          </motion.p>
        </motion.div>

        <motion.div
          className="mx-auto mt-12 sm:mt-16 max-w-6xl rounded-2xl sm:rounded-3xl bg-background p-4 sm:p-6 lg:p-8 shadow-2xl border-2 border-border/30"
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16 items-start lg:items-center">
            {/* Module Controls */}
            <motion.div
              className="space-y-3 sm:space-y-4 bg-muted/30 rounded-xl sm:rounded-2xl p-4 sm:p-6"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.h3
                className="text-xl sm:text-2xl font-bold text-foreground px-2 mb-4 sm:mb-6 tracking-tight"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                viewport={{ once: true }}
              >
                Module Controls
              </motion.h3>
              {modules.map((module, index) => (
                <motion.div
                  key={module.id}
                  className="p-4 sm:p-6 flex items-center justify-between rounded-xl sm:rounded-2xl hover:bg-muted/50 transition-all duration-300 border border-transparent hover:border-border/30"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.8 + index * 0.1,
                    ease: 'easeOut',
                  }}
                  whileHover={{
                    scale: 1.02,
                    x: 5,
                    backgroundColor: 'rgba(243, 244, 246, 0.8)',
                    transition: { type: 'spring', stiffness: 400, damping: 25 },
                  }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-3 sm:gap-5 min-w-0 flex-1">
                    <motion.div
                      className="bg-muted p-3 sm:p-4 rounded-lg sm:rounded-xl flex-shrink-0"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <motion.div
                        animate={activeModules[module.id] ? { scale: 1.1 } : { scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      >
                        {module.icon}
                      </motion.div>
                    </motion.div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-foreground text-base sm:text-lg truncate">
                        {module.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {module.description}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => handleToggle(module.id)}
                    className={`relative inline-flex h-6 w-11 sm:h-7 sm:w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      activeModules[module.id] ? 'bg-primary' : 'bg-muted'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={`Toggle ${module.name}`}
                  >
                    <motion.span
                      aria-hidden="true"
                      className="pointer-events-none inline-block h-5 w-5 sm:h-6 sm:w-6 transform rounded-full bg-background shadow ring-0"
                      animate={{
                        x: activeModules[module.id] ? 20 : 0,
                        scale: activeModules[module.id] ? 1.05 : 1,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  </motion.button>
                </motion.div>
              ))}
              <motion.div
                className="pt-4 px-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="bg-accent text-accent-foreground font-semibold p-4 rounded-xl text-center flex items-center justify-center gap-2"
                  key={activeCount}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    key={`zap-${activeCount}`}
                  >
                    <Lightning size={16} />
                  </motion.div>
                  {activeCount} {activeCount === 1 ? 'module' : 'modules'} active
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Live Widget Preview */}
            <motion.div
              className="lg:sticky lg:top-28 h-[450px] sm:h-[500px] bg-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border-2 border-border/20"
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg h-full flex flex-col overflow-hidden"
                whileHover={{
                  scale: 1.02,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Header */}
                <motion.div
                  className="bg-primary p-4 sm:p-6 text-primary-foreground rounded-t-xl sm:rounded-t-2xl flex-shrink-0"
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex-shrink-0"
                      >
                        <ChatCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                      </motion.div>
                      <h4 className="text-base sm:text-lg lg:text-xl font-bold truncate">
                        How can we help you today?
                      </h4>
                    </div>
                    <button
                      className="text-primary-foreground/70 hover:text-primary-foreground transition-colors flex-shrink-0"
                      aria-label="Close"
                    >
                      <X size={18} className="sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </motion.div>

                {/* Content */}
                <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 flex-grow overflow-y-auto">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-lg sm:text-xl">👏</span>
                      <h3 className="text-sm sm:text-base font-semibold text-foreground">
                        How can we help?
                      </h3>
                    </div>
                    <button
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Close"
                    >
                      <X size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                  </div>

                  {/* Instruction */}
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Choose a feedback type to get started
                  </p>

                  {/* Feedback Type Grid */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <AnimatePresence mode="popLayout">
                      {modules.map(
                        (module) =>
                          activeModules[module.id] && (
                            <motion.button
                              key={`preview-${module.id}`}
                              initial={{
                                opacity: 0,
                                height: 0,
                                scale: 0.8,
                              }}
                              animate={{
                                opacity: 1,
                                height: 'auto',
                                scale: 1,
                              }}
                              exit={{
                                opacity: 0,
                                height: 0,
                                scale: 0.8,
                              }}
                              transition={{
                                duration: 0.4,
                                ease: 'easeInOut',
                                layout: { duration: 0.3 },
                              }}
                              layout
                              className="flex items-center gap-2 p-3 rounded-lg border border-border/30 bg-white hover:border-primary/50 hover:bg-primary/5 transition-all w-full"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="text-base sm:text-lg">
                                {module.id === 'bugs' && '🐛'}
                                {module.id === 'features' && '💡'}
                                {module.id === 'reviews' && '⭐'}
                                {module.id === 'surveys' && '💬'}
                              </div>
                              <span className="text-[11px] sm:text-xs font-medium text-foreground">
                                {module.id === 'bugs'
                                  ? 'Bug Report'
                                  : module.id === 'features'
                                    ? 'Feature Request'
                                    : module.id === 'reviews'
                                      ? 'Review'
                                      : 'General'}
                              </span>
                            </motion.button>
                          )
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="text-center mt-12 sm:mt-16 lg:mt-20 px-4 sm:px-0"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.button
            onClick={() => (window.location.href = '/login')}
            className="inline-block rounded-2xl bg-primary px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-primary-foreground shadow-xl hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all border border-primary/20 w-full sm:w-auto"
            whileHover={{
              scale: 1.02,
              boxShadow: '0 25px 50px rgba(220, 38, 38, 0.4)',
            }}
            whileTap={{ scale: 0.98 }}
          >
            Start Saving $160/Month Today
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}
