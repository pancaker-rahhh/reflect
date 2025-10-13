import { useState, useEffect, useRef, useCallback } from 'react'
import {
  MessageCircle,
  Send,
  Heart,
  Lightbulb,
  Bug,
  Star,
  BarChart3,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'

interface FeedbackParticle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  type: 'heart' | 'star' | 'idea' | 'bug'
  color: string
  size: number
  opacity: number
  life: number
}

interface FeedbackItem {
  id: string
  type: 'bug' | 'feature' | 'praise' | 'question'
  text: string
  timestamp: Date
}

export const HeroSection = () => {
  const [particles, setParticles] = useState<FeedbackParticle[]>([])
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([
    {
      id: '1',
      type: 'praise',
      text: 'Love the new design!',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: '2',
      type: 'feature',
      text: 'Add dark mode please',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
    },
    {
      id: '3',
      type: 'bug',
      text: 'Button not working on mobile',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
  ])
  const [isWidgetOpen, setIsWidgetOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [selectedType, setSelectedType] = useState<'bug' | 'feature' | 'praise' | 'question'>(
    'praise'
  )
  const [metrics] = useState({
    totalFeedback: 2847,
    satisfaction: 4.8,
    responseRate: 94,
    activeUsers: 1203,
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const particleIdRef = useRef(0)

  // Mouse tracking
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        mouseX.set(e.clientX - rect.left)
        mouseY.set(e.clientY - rect.top)
      }
    },
    [mouseX, mouseY]
  )

  // Particle system
  const createParticle = useCallback((x: number, y: number, type: FeedbackParticle['type']) => {
    const colors = {
      heart: '#ef4444',
      star: '#eab308',
      idea: '#8b5cf6',
      bug: '#f97316',
    }

    const newParticle: FeedbackParticle = {
      id: `particle-${particleIdRef.current++}`,
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      type,
      color: colors[type],
      size: Math.random() * 20 + 10,
      opacity: 1,
      life: 100,
    }

    setParticles((prev) => [...prev, newParticle])
  }, [])

  // Animate particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vx: particle.vx * 0.99,
            vy: particle.vy * 0.99,
            opacity: particle.opacity * 0.98,
            life: particle.life - 1,
          }))
          .filter((particle) => particle.life > 0 && particle.opacity > 0.01)
      )
    }, 16)

    return () => clearInterval(interval)
  }, [])

  // Auto-create ambient particles
  useEffect(() => {
    const interval = setInterval(() => {
      if (particles.length < 15) {
        const types: FeedbackParticle['type'][] = ['heart', 'star', 'idea', 'bug']
        createParticle(
          Math.random() * 100,
          Math.random() * 100,
          types[Math.floor(Math.random() * types.length)]
        )
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [particles.length, createParticle])

  // Submit feedback
  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) return

    const newFeedback: FeedbackItem = {
      id: Date.now().toString(),
      type: selectedType,
      text: feedbackText,
      timestamp: new Date(),
    }

    setFeedbackItems((prev) => [newFeedback, ...prev.slice(0, 4)])

    // Create celebration particles
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        createParticle(
          50,
          50,
          selectedType === 'praise'
            ? 'heart'
            : selectedType === 'feature'
              ? 'idea'
              : selectedType === 'bug'
                ? 'bug'
                : 'star'
        )
      }, i * 100)
    }

    setFeedbackText('')
  }

  // Background transforms based on mouse position
  const backgroundX = useTransform(mouseX, [0, 1000], [-20, 20])
  const backgroundY = useTransform(mouseY, [0, 600], [-10, 10])

  const typeIcons = {
    bug: <Bug size={16} />,
    feature: <Lightbulb size={16} />,
    praise: <Heart size={16} />,
    question: <MessageCircle size={16} />,
  }

  const typeColors = {
    bug: 'from-red-500 to-red-600',
    feature: 'from-blue-500 to-blue-600',
    praise: 'from-green-500 to-green-600',
    question: 'from-purple-500 to-purple-600',
  }

  return (
    <motion.div
      id="hero"
      ref={containerRef}
      className="relative isolate overflow-hidden min-h-screen bg-gradient-to-br from-surface-1 via-surface-2 to-surface-3"
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
    >
      {/* Clean Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/95"
        style={{ x: backgroundX, y: backgroundY }}
      />

      {/* Video Section */}
      <motion.div
        className="relative z-10 pt-32 pb-8"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Dark background for better contrast */}
          <div className="bg-[hsl(var(--background))/0.95] backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
            {/* Video Container */}
            <div className="relative">
              {/* Main Video Container - Made smaller with single border */}
              <motion.div
                className="relative aspect-video w-full rounded-3xl shadow-2xl overflow-hidden group border-2 border-[hsl(var(--primary))]/30"
                whileHover={{
                  scale: 1.02,
                  boxShadow: '0 30px 60px -12px rgba(220, 38, 38, 0.5)',
                }}
                transition={{ duration: 0.3 }}
                style={{
                  willChange: 'transform',
                  backfaceVisibility: 'hidden',
                  transform: 'translateZ(0)',
                }}
              >
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
                  poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Crect width='1920' height='1080' fill='%231a202c'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23dc2626' font-family='Inter, sans-serif' font-size='48' font-weight='bold'%3EReflect Demo%3C/text%3E%3C/svg%3E"
                  style={{
                    willChange: 'transform',
                    backfaceVisibility: 'hidden',
                    transform: 'translateZ(0)',
                  }}
                >
                  <source src="/reflect-intro-with-reviews.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Enhanced video overlay for better contrast */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                />

                {/* Play button overlay for better UX */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                    <div className="w-6 h-6 border-l-2 border-white border-t-2 border-b-2 border-r-0 transform rotate-45 translate-x-0.5"></div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center py-12 lg:py-16">
        {/* Left Column - Brand & CTA */}
        <motion.div
          className="text-center lg:text-left space-y-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[hsl(var(--foreground))] leading-[1.1] tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.span
              className="inline-block"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                background:
                  'linear-gradient(45deg, hsl(var(--foreground)), hsl(var(--primary)), hsl(var(--accent)), hsl(var(--foreground)))',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Collect User Feedback
            </motion.span>
            <br />
            <span className="text-[hsl(var(--muted-foreground))]">in 3 Minutes</span>
          </motion.h1>

          <motion.p
            className="text-xl sm:text-2xl text-[hsl(var(--muted-foreground))] leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            The fastest way to collect bug reports, feature requests, and user insights.
            <strong className="text-[hsl(var(--foreground))]"> No coding required.</strong> Free
            plan available.
          </motion.p>
        </motion.div>

        {/* Center Column - Interactive Widget */}
        <motion.div
          className="relative flex justify-center"
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, type: 'spring', stiffness: 100 }}
        >
          {/* Widget Container */}
          <motion.div
            className="bg-[hsl(var(--background))/0.95] backdrop-blur-xl border border-[hsl(var(--border))/0.3] rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl w-full max-w-2xl ring-1 ring-[hsl(var(--primary))]/10"
            whileHover={{
              scale: 1.02,
              boxShadow: '0 30px 60px rgba(0, 0, 0, 0.15)',
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="text-center mb-6 sm:mb-8"
              animate={{ y: [-2, 2, -2] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--foreground))] mb-3 tracking-tight">
                Live Demo Widget
              </h3>
              <p className="text-[hsl(var(--muted-foreground))] text-base sm:text-lg leading-relaxed">
                Leave feedback and watch the magic happen
              </p>
            </motion.div>

            {/* Widget Button */}
            <motion.button
              onClick={() => setIsWidgetOpen(!isWidgetOpen)}
              className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold py-5 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl border border-[hsl(var(--primary))]/20"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                animate={isWidgetOpen ? { rotate: 180 } : { rotate: 0 }}
                transition={{ duration: 0.3 }}
              >
                <MessageCircle size={20} />
              </motion.div>
              {isWidgetOpen ? 'Close Feedback' : 'Leave Feedback'}
            </motion.button>

            {/* Feedback Form */}
            <AnimatePresence>
              {isWidgetOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-4 space-y-4"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">👏</span>
                      <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                        How can we help?
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsWidgetOpen(false)}
                      className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Instruction */}
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Choose a feedback type to get started
                  </p>

                  {/* Feedback Type Grid */}
                  <div className="space-y-2">
                    {(Object.keys(typeIcons) as Array<keyof typeof typeIcons>).map((type) => (
                      <motion.button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`flex items-center gap-2 p-3 rounded-lg border transition-all w-full ${
                          selectedType === type
                            ? `border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10`
                            : 'border-[hsl(var(--border))/0.3] bg-white hover:border-[hsl(var(--primary))]/50 hover:bg-[hsl(var(--primary))]/5'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="text-lg">
                          {type === 'bug' && '🐛'}
                          {type === 'feature' && '💡'}
                          {type === 'praise' && '⭐'}
                          {type === 'question' && '💬'}
                        </div>
                        <span className="text-xs font-medium text-[hsl(var(--foreground))] capitalize">
                          {type === 'praise'
                            ? 'Review'
                            : type === 'question'
                              ? 'General'
                              : type === 'feature'
                                ? 'Feature Request'
                                : 'Bug Report'}
                        </span>
                      </motion.button>
                    ))}
                  </div>

                  {/* Text Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))]">
                      Share your thoughts
                    </label>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Tell us what's on your mind..."
                      className="w-full p-4 bg-[hsl(var(--background))/0.8] border-2 border-[hsl(var(--border))/0.3] rounded-xl text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))/0.6] resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] transition-all"
                      rows={2}
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    onClick={handleSubmitFeedback}
                    disabled={!feedbackText.trim()}
                    className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 disabled:bg-[hsl(var(--muted))] text-[hsl(var(--primary-foreground))] disabled:text-[hsl(var(--muted-foreground))] font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
                    whileHover={feedbackText.trim() ? { scale: 1.02 } : {}}
                    whileTap={feedbackText.trim() ? { scale: 0.98 } : {}}
                  >
                    <Send size={16} />
                    Submit Feedback
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Right Column - Live Metrics & Recent Feedback */}
        <motion.div
          className="space-y-6 sm:space-y-8 w-full max-w-lg mx-auto lg:max-w-none"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {/* Metrics Dashboard */}
          <motion.div
            className="bg-[hsl(var(--background))/0.95] backdrop-blur-xl border border-[hsl(var(--border))/0.3] rounded-3xl p-6 sm:p-8 shadow-xl ring-1 ring-[hsl(var(--primary))]/5"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-base sm:text-lg font-semibold text-[hsl(var(--foreground))] mb-3 sm:mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="sm:w-5 sm:h-5" />
              Live Metrics
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <motion.div className="text-center" whileHover={{ scale: 1.1 }}>
                <motion.div
                  className="text-lg sm:text-2xl font-bold text-[hsl(var(--foreground))] break-words"
                  animate={{ scale: [1, 1.03] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                  }}
                >
                  {metrics.totalFeedback.toLocaleString()}
                </motion.div>
                <div className="text-[hsl(var(--muted-foreground))] text-xs sm:text-sm">
                  Total Feedback
                </div>
              </motion.div>
              <motion.div className="text-center" whileHover={{ scale: 1.1 }}>
                <motion.div
                  className="text-lg sm:text-2xl font-bold text-[hsl(var(--foreground))] flex items-center justify-center gap-1"
                  animate={{ scale: [1, 1.03] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                    delay: 0.5,
                  }}
                >
                  <span className="break-words">{metrics.satisfaction.toFixed(1)}</span>
                  <Star
                    size={14}
                    className="text-[hsl(var(--tint-warning))] sm:w-4 sm:h-4 flex-shrink-0"
                  />
                </motion.div>
                <div className="text-[hsl(var(--muted-foreground))] text-xs sm:text-sm">
                  Satisfaction
                </div>
              </motion.div>
              <motion.div className="text-center" whileHover={{ scale: 1.1 }}>
                <motion.div
                  className="text-lg sm:text-2xl font-bold text-[hsl(var(--foreground))] break-words"
                  animate={{ scale: [1, 1.03] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                    delay: 1,
                  }}
                >
                  {metrics.responseRate}%
                </motion.div>
                <div className="text-[hsl(var(--muted-foreground))] text-xs sm:text-sm">
                  Response Rate
                </div>
              </motion.div>
              <motion.div className="text-center" whileHover={{ scale: 1.1 }}>
                <motion.div
                  className="text-lg sm:text-2xl font-bold text-[hsl(var(--foreground))] flex items-center justify-center gap-1"
                  animate={{ scale: [1, 1.03] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                    delay: 1.5,
                  }}
                >
                  <span className="break-words">{metrics.activeUsers.toLocaleString()}</span>
                  <Users
                    size={14}
                    className="text-[hsl(var(--tint-info))] sm:w-4 sm:h-4 flex-shrink-0"
                  />
                </motion.div>
                <div className="text-[hsl(var(--muted-foreground))] text-xs sm:text-sm">
                  Active Users
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Recent Feedback */}
          <motion.div
            className="bg-[hsl(var(--background))/0.95] backdrop-blur-xl border border-[hsl(var(--border))/0.3] rounded-3xl p-6 sm:p-8 shadow-xl ring-1 ring-[hsl(var(--primary))]/5"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-base sm:text-lg font-semibold text-[hsl(var(--foreground))] mb-3 sm:mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="sm:w-5 sm:h-5" />
              Live Feedback
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <AnimatePresence>
                {feedbackItems.slice(0, 3).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-[hsl(var(--muted))/0.05] rounded-lg hover:bg-[hsl(var(--muted))/0.1] transition-colors min-h-[3.5rem]"
                  >
                    <div
                      className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-r ${
                        typeColors[item.type]
                      } flex-shrink-0`}
                    >
                      {typeIcons[item.type]}
                    </div>
                    <div className="flex-1 min-w-0 w-full">
                      <p className="text-[hsl(var(--foreground))] text-xs sm:text-sm break-words leading-relaxed">
                        {item.text}
                      </p>
                      <p className="text-[hsl(var(--muted-foreground))/0.5] text-xs mt-1">
                        {item.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
