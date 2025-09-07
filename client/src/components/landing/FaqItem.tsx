import React from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Define the props for the FaqItem component
interface FaqItemProps {
  question: string;
  answer: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
}

export const FaqItem: React.FC<FaqItemProps> = ({ question, answer, icon, isOpen, onClick }) => {
  return (
    <motion.div 
      className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 12px 35px rgba(0, 0, 0, 0.12)",
        borderColor: "#d1d5db",
        y: -2
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 25 
      }}
      layout
    >
      <dt>
        <motion.button
          onClick={onClick}
          className="flex w-full items-center justify-between text-left text-gray-900 p-6 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-inset"
          aria-expanded={isOpen}
          whileHover={{ 
            backgroundColor: isOpen ? "#fef7ff" : "#fafafb",
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.995 }}
          transition={{ duration: 0.15 }}
        >
          <div className="flex items-center gap-4">
            <motion.span 
              className={`transition-colors duration-200 ${isOpen ? 'text-purple-600' : 'text-gray-500'}`}
              animate={{ 
                scale: isOpen ? 1.1 : 1,
                rotate: isOpen ? 5 : 0
              }}
              transition={{ 
                type: "spring",
                stiffness: isOpen ? 200 : 400,
                damping: isOpen ? 20 : 25,
                duration: 0.4
              }}
            >
              {icon}
            </motion.span>
            <motion.span 
              className={`text-md font-semibold leading-7 transition-colors duration-200 ${isOpen ? 'text-purple-600' : 'text-gray-900'}`}
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
                scale: isOpen ? 1.1 : 1
              }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 25 
              }}
            >
              <ChevronDown
                className={`h-6 w-6 transition-colors duration-200 ${isOpen ? 'text-purple-600' : 'text-gray-500'}`}
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
              y: -10
            }}
            animate={{ 
              height: "auto",
              opacity: 1,
              y: 0
            }}
            exit={{ 
              height: 0,
              opacity: 0,
              y: -10
            }}
            transition={{ 
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className="overflow-hidden"
          >
            <motion.div 
              className="px-6 pb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ 
                delay: isOpen ? 0.15 : 0,
                duration: 0.3,
                ease: "easeOut"
              }}
            >
                <motion.div
                  className="border-t border-gray-200 pt-6 ml-10"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ 
                    delay: 0.2, 
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  style={{ originX: 0 }}
                >
                  <motion.p 
                    className="text-base leading-7 text-gray-700"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      delay: 0.25, 
                      duration: 0.4,
                      ease: "easeOut"
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
  );
};
