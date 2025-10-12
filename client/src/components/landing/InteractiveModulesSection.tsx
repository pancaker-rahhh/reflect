import { useState } from 'react';
import { Star, FileText, Bug, Lightbulb, CaretRight, ChatCircle, Lightning } from 'phosphor-react';
import { motion, AnimatePresence } from 'framer-motion';

// Define the structure for a module
interface Module {
  id: 'reviews' | 'surveys' | 'bugs' | 'features';
  name: string;
  description: string;
  icon: React.ReactNode;
}

// Module data with specific icon colors
const modules: Module[] = [
  { id: 'reviews', name: 'Reviews & Surveys', description: 'Customer feedback & ratings', icon: <Star className="text-success" /> },
  { id: 'surveys', name: 'Custom Surveys', description: 'NPS, CSAT & custom forms', icon: <FileText className="text-info" /> },
  { id: 'bugs', name: 'Bug Reports', description: 'Issue reporting with screenshots', icon: <Bug className="text-destructive" /> },
  { id: 'features', name: 'Feature Requests', description: 'Ideas with voting system', icon: <Lightbulb className="text-primary" /> },
];

export const InteractiveModulesSection = () => {
  const [activeModules, setActiveModules] = useState({
    reviews: true,
    surveys: true,
    bugs: true,
    features: true,
  });

  const handleToggle = (id: Module['id']) => {
    setActiveModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activeCount = Object.values(activeModules).filter(Boolean).length;

  return (
    <motion.div 
      id="interactive-modules" 
      className="bg-surface-2 py-24 sm:py-32"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              viewport={{ once: true }}
              className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
            >
              4 powerful modules
            </motion.span> in one widget
          </motion.h2>
          <motion.p 
            className="mt-6 text-lg leading-8 text-muted-foreground"
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
              Save $200/month
            </motion.span> by replacing separate tools.
            Toggle modules on/off to see how your widget adapts in real-time.
          </motion.p>
        </motion.div>

        <motion.div 
          className="mx-auto mt-16 max-w-6xl rounded-2xl bg-[hsl(var(--background))] p-4 sm:p-8 shadow-2xl ring-1 ring-[hsl(var(--border))/0.5]"
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 items-center">
              {/* Module Controls */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <motion.h3 
                  className="text-lg font-semibold text-foreground px-4 mb-2"
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
                    className="p-4 flex items-center justify-between rounded-lg hover:bg-[hsl(var(--muted))/0.5] transition-colors duration-200"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: 0.8 + (index * 0.1),
                      ease: "easeOut"
                    }}
                    whileHover={{ 
                      scale: 1.02,
                      x: 5,
                      backgroundColor: "rgba(243, 244, 246, 0.8)",
                      transition: { type: "spring", stiffness: 400, damping: 25 }
                    }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-center gap-4">
                      <motion.div 
                        className="bg-[hsl(var(--muted))] p-3 rounded-lg"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <motion.div
                          animate={activeModules[module.id] ? { scale: 1.1 } : { scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                          {module.icon}
                        </motion.div>
                      </motion.div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{module.name}</h4>
                        <p className="text-sm text-gray-500">{module.description}</p>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => handleToggle(module.id)}
                      className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2 ${
                        activeModules[module.id] ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--muted))]'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.span
                        aria-hidden="true"
                        className="pointer-events-none inline-block h-6 w-6 transform rounded-full bg-[hsl(var(--background))] shadow ring-0"
                        animate={{ 
                          x: activeModules[module.id] ? 20 : 0,
                          scale: activeModules[module.id] ? 1.05 : 1
                        }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 500, 
                          damping: 30 
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
                      className="bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] font-semibold p-4 rounded-xl text-center flex items-center justify-center gap-2"
                      key={activeCount}
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
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
                className="sticky top-28 h-[500px] bg-slate-100 rounded-2xl p-4"
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <motion.div 
                  className="bg-white rounded-xl shadow-lg h-full flex flex-col overflow-hidden"
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="bg-gradient-to-r from-purple-600 to-indigo-500 p-5 text-white rounded-t-xl"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <ChatCircle />
                        </motion.div>
                        <h4 className="text-lg font-bold">How can we help you today?</h4>
                    </div>
                  </motion.div>
                  <div className="p-4 space-y-2 flex-grow">
                    <AnimatePresence mode="popLayout">
                      {modules.map((module) => (
                        activeModules[module.id] && (
                          <motion.div
                            key={`preview-${module.id}`}
                            initial={{ 
                              opacity: 0, 
                              height: 0,
                              x: -20,
                              scale: 0.8
                            }}
                            animate={{ 
                              opacity: 1, 
                              height: "auto",
                              x: 0,
                              scale: 1
                            }}
                            exit={{ 
                              opacity: 0, 
                              height: 0,
                              x: 20,
                              scale: 0.8
                            }}
                            transition={{ 
                              duration: 0.4,
                              ease: "easeInOut",
                              layout: { duration: 0.3 }
                            }}
                            layout
                          >
                            <motion.div 
                              className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between cursor-pointer mb-2 hover:shadow-md transition-shadow"
                              whileHover={{ 
                                scale: 1.02,
                                backgroundColor: "#f9fafb",
                                borderColor: "#d1d5db",
                                y: -2,
                                boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)"
                              }}
                              whileTap={{ scale: 0.98, y: 0 }}
                              transition={{ 
                                type: "spring", 
                                stiffness: 300, 
                                damping: 20 
                              }}
                            >
                                <div className="flex items-center gap-4">
                                    <motion.div
                                      animate={{ 
                                        scale: [1, 1.08],
                                        rotate: [0, 2, -2, 0]
                                      }}
                                      transition={{ 
                                        scale: { type: "spring", stiffness: 300, damping: 20 },
                                        rotate: { duration: 0.8, ease: "easeInOut" }
                                      }}
                                    >
                                      {module.icon}
                                    </motion.div>
                                    <span className="font-medium text-gray-700">{module.name.split(' & ')[0]}</span>
                                </div>
                                <motion.div
                                  whileHover={{ x: 5 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <CaretRight className="text-gray-400" />
                                </motion.div>
                            </motion.div>
                          </motion.div>
                        )
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </motion.div>
            </div>
        </motion.div>
        
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
        >
            <motion.button 
              onClick={() => window.location.href = '/login'}
              className="inline-block rounded-full bg-purple-600 px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transition-all"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(147, 51, 234, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
            >
                Try it Free - Setup in 3 minutes
            </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};