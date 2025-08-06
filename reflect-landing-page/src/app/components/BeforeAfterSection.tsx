"use client";

import React from 'react';
import { XCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const beforeItems = [
  'Hard to identify friction points',
  '$189/months and 4 tools to handle all kind of feedback',
  'Blind decisions based on assumptions',
  'Annoying email surveys that disrupt users',
  'Back and forth emails exchange to understand the client context (OS, broken urls, etc.)',
  'Missed opportunities to improve customer experience',
];

const afterItems = [
  'User context provided in all bug reports (browser, device, screen size, etc.)',
  'Engage visitors with targeted, non-intrusive feedback widgets',
  'Centralized dashboard for all feedback',
  '3-minute setup with no-code installation',
  'Shareable public roadmap',
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8, rotate: -5 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    rotate: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const BeforeAfterSection = () => {
  return (
    <motion.div 
      id="features" 
      className="bg-white py-24 sm:py-32"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          className="mx-auto max-w-3xl text-center"
          variants={containerVariants}
        >
          <motion.h2 
            className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl"
            variants={itemVariants}
          >
            Stop guessing, start <motion.span 
              className="text-purple-600"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              viewport={{ once: true }}
            >
              listening
            </motion.span>
          </motion.h2>
          <motion.p 
            className="mt-6 text-lg leading-8 text-gray-600"
            variants={itemVariants}
          >
            Move from scattered feedback and blind decisions to a clear, centralized hub of user insights. See the difference Reflect makes.
          </motion.p>
        </motion.div>

        <motion.div 
          className="mt-16 grid grid-cols-1 gap-12 rounded-2xl lg:grid-cols-2 lg:gap-8 bg-slate-50 p-8"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          {/* Before Column */}
          <motion.div 
            className="p-6"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <motion.h3 
              className="text-2xl font-bold text-gray-800 mb-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              viewport={{ once: true }}
            >
              Before...
            </motion.h3>
            <div className="space-y-4">
              {beforeItems.map((item, index) => (
                <motion.div 
                  key={index} 
                  className={`bg-white p-4 rounded-lg shadow-md border border-gray-200 flex items-center gap-3 hover:shadow-lg transition-all duration-300 ${index % 2 === 0 ? '-rotate-1 hover:rotate-0' : 'rotate-1 hover:rotate-0'}`}
                  initial={{ opacity: 0, x: -30, rotate: index % 2 === 0 ? -10 : 10 }}
                  whileInView={{ 
                    opacity: 1, 
                    x: 0, 
                    rotate: index % 2 === 0 ? -1 : 1
                  }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.7 + (index * 0.1),
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    scale: 1.02, 
                    rotate: 0,
                    transition: { duration: 0.2 }
                  }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.8 + (index * 0.1), type: "spring", stiffness: 200 }}
                    viewport={{ once: true }}
                  >
                    <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                  </motion.div>
                  <p className="text-gray-600">{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* After Column */}
          <motion.div 
            className="relative rounded-2xl p-8 bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-2xl hover:shadow-3xl transition-shadow duration-300"
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
             <motion.div 
               className="absolute top-0 right-0 -mt-3 -mr-3 bg-white text-purple-600 font-bold py-1 px-3 rounded-full text-sm shadow-lg"
               initial={{ opacity: 0, scale: 0, rotate: -45 }}
               whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
               transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
               viewport={{ once: true }}
             >
              RECOMMENDED
            </motion.div>
            <motion.h3 
              className="text-2xl font-bold mb-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              viewport={{ once: true }}
            >
              With Reflect
            </motion.h3>
            <motion.div 
              className="bg-white/10 p-6 rounded-lg backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              viewport={{ once: true }}
            >
                <ul className="space-y-4">
                {afterItems.map((item, index) => (
                    <motion.li 
                      key={index} 
                      className="flex items-start gap-4"
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 0.6, 
                        delay: 0.8 + (index * 0.1),
                        ease: "easeOut"
                      }}
                      viewport={{ once: true }}
                    >
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        transition={{ 
                          delay: 0.9 + (index * 0.1), 
                          type: "spring", 
                          stiffness: 200 
                        }}
                        viewport={{ once: true }}
                      >
                        <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0 mt-1" />
                      </motion.div>
                      <p className="text-lg">{item}</p>
                    </motion.li>
                ))}
                </ul>
            </motion.div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
        >
            <motion.a 
              href="#" 
              className="inline-block rounded-full bg-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transition-all duration-300"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(147, 51, 234, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
            >
                Ready to improve your customer experience?
            </motion.a>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BeforeAfterSection;