import { Play } from 'phosphor-react'
import { motion } from 'framer-motion'

export const VideoSection = () => {
  return (
    <motion.div
      id="video-section"
      className="bg-surface-2 py-12 sm:py-16 lg:py-20"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-2xl text-center"
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
            See Reflect in <span className="text-primary">Action</span>
          </motion.h2>
          <motion.p
            className="mt-4 text-lg leading-8 text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Watch a quick walkthrough to see just how easy it is to collect, manage, and act on user
            feedback.
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-16 mx-auto max-w-4xl"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="relative aspect-video w-full rounded-2xl shadow-2xl overflow-hidden group ring-4 ring-primary/20"
            whileHover={{
              scale: 1.02,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.img
              src="https://placehold.co/1920x1080/1a202c/dc2626?text=Reflect+Demo"
              alt="Video placeholder"
              className="w-full h-full object-cover"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.button
                className="h-24 w-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white group-hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/50"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [1, 1.03],
                  opacity: 1,
                }}
                transition={{
                  delay: 0.8,
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                  scale: {
                    duration: 1,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                  },
                }}
                whileHover={{
                  scale: 1.15,
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ x: [0, 2, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Play className="h-12 w-12" fill="currentColor" />
                </motion.div>
              </motion.button>
            </div>

            {/* Floating elements for extra visual interest */}
            <motion.div
              className="absolute top-4 right-4 w-3 h-3 bg-white/30 rounded-full"
              animate={{
                y: [0, -10, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: 1,
              }}
            />
            <motion.div
              className="absolute bottom-4 left-4 w-2 h-2 bg-primary/40 rounded-full"
              animate={{
                y: [0, -8, 0],
                x: [0, 5, 0],
                opacity: [0.4, 0.9, 0.4],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: 1.5,
              }}
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
