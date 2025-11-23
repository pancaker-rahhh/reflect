import React from 'react'
import { CaretDown } from 'phosphor-react'
import { motion, AnimatePresence } from 'framer-motion'

// Define the props for the FaqItem component
interface FaqItemProps {
  question: string
  answer: string
  icon: React.ReactNode
  isOpen: boolean
  onClick: () => void
}

export const FaqItem: React.FC<FaqItemProps> = ({ question, answer, icon, isOpen, onClick }) => {
  return (
    <motion.div
      className="bg-background border border-border/30 rounded-2xl shadow-lg overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{
        scale: 1.02,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        borderColor: 'hsl(var(--border))',
        y: -3,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }}
      layout
    >
      <dt>
        <motion.button
          onClick={onClick}
          className={`flex w-full items-center justify-between text-left text-foreground p-8 focus:outline-none ${
            isOpen ? 'rounded-t-2xl' : 'rounded-2xl'
          }`}
          aria-expanded={isOpen}
          aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${question}`}
          whileHover={{
            backgroundColor: isOpen ? 'hsl(var(--primary) / 0.05)' : 'hsl(var(--muted) / 0.05)',
            transition: { duration: 0.2 },
          }}
          whileTap={{ scale: 0.995 }}
          transition={{ duration: 0.15 }}
        >
          <div className="flex items-center gap-5">
            <motion.span
              className={`transition-colors duration-200 ${
                isOpen ? 'text-primary' : 'text-muted-foreground'
              }`}
              animate={{
                scale: isOpen ? 1.1 : 1,
                rotate: isOpen ? 5 : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: isOpen ? 200 : 400,
                damping: isOpen ? 20 : 25,
                duration: 0.4,
              }}
            >
              {icon}
            </motion.span>
            <motion.span
              className={`text-lg font-semibold leading-7 transition-colors duration-200 ${
                isOpen ? 'text-primary' : 'text-foreground'
              }`}
              animate={{ x: isOpen ? 5 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {question}
            </motion.span>
          </div>
          <span className="ml-6 flex h-7 items-center">
            <motion.div
              animate={{
                rotate: isOpen ? 180 : 0,
                scale: isOpen ? 1.1 : 1,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
              }}
            >
              <CaretDown
                className={`h-6 w-6 transition-colors duration-200 ${
                  isOpen ? 'text-primary' : 'text-muted-foreground'
                }`}
                aria-hidden="true"
              />
            </motion.div>
          </span>
        </motion.button>
      </dt>

      <AnimatePresence>
        {isOpen && (
          <motion.dd
            initial={{
              height: 0,
              opacity: 0,
              y: -10,
            }}
            animate={{
              height: 'auto',
              opacity: 1,
              y: 0,
            }}
            exit={{
              height: 0,
              opacity: 0,
              y: -10,
            }}
            transition={{
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="overflow-hidden"
          >
            <motion.div
              className="px-8 pb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{
                delay: isOpen ? 0.15 : 0,
                duration: 0.3,
                ease: 'easeOut',
              }}
            >
              <motion.div
                className="ml-12"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  delay: 0.2,
                  duration: 0.4,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                style={{ originX: 0 }}
              >
                <motion.p
                  className="text-lg leading-7 text-muted-foreground"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.25,
                    duration: 0.4,
                    ease: 'easeOut',
                  }}
                >
                  {answer}
                </motion.p>
              </motion.div>
            </motion.div>
          </motion.dd>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
