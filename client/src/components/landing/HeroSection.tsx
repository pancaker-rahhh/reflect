import { motion } from 'framer-motion'
import NotBackedBadge from '@/components/common/NotBackedBadge'

export const HeroSection = () => {
  return (
    <motion.div
      id="hero"
      className="relative isolate overflow-hidden min-h-screen bg-gradient-to-br from-surface-1 via-surface-2 to-surface-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
    >
      {/* Clean Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/95"
      />

      {/* Main Content - Centered */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-16 sm:py-20 pt-24 sm:pt-32 pb-8 sm:pb-12">
        <div className="max-w-4xl mx-auto text-center space-y-8 sm:space-y-12">
          {/* Slogan and Description */}
          <motion.div
            className="space-y-4 sm:space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Badge: centered directly above headline */}
            <div className="mx-auto mb-2">
              <NotBackedBadge
                className="mx-auto px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm shadow-2xl ring-2 ring-primary/20 bg-white text-[hsl(var(--foreground))] border border-[hsl(var(--border))/0.08]"
              />
            </div>
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[hsl(var(--foreground))] leading-[1.1] tracking-tight px-4 sm:px-0"
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
              className="text-base sm:text-lg md:text-xl text-[hsl(var(--muted-foreground))] leading-relaxed max-w-2xl mx-auto font-light px-4 sm:px-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              The fastest way to collect bug reports, feature requests, and user insights.
              <strong className="text-[hsl(var(--foreground))]"> No coding required.</strong> Free
              plan available.
            </motion.p>
            {/* CTA Button */}
            <motion.div
              className="mt-6 sm:mt-8 flex justify-center px-4 sm:px-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <button
                onClick={() => window.location.href = '/login'}
                className="inline-block rounded-2xl bg-primary px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg font-semibold text-primary-foreground shadow-xl hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all border border-primary/20 w-full sm:w-auto"
                style={{ boxShadow: '0 8px 32px rgba(220,38,38,0.18)' }}
              >
              Get Started
              </button>
            </motion.div>
          </motion.div>

          {/* Video Section - Blended underneath */}
          <motion.div
            className="w-full max-w-4xl mx-auto px-4 sm:px-0"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="relative">
              {/* Video Container with nice blending */}
              <motion.div
                className="relative aspect-video w-full rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden border border-[hsl(var(--primary))]/20 backdrop-blur-sm"
                whileHover={{
                  scale: 1.02,
                  boxShadow: '0 30px 60px -12px rgba(220, 38, 38, 0.3)',
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
                  <source src="https://cdn.reflectfeedback.com/assets/reflect-intro-720p.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Subtle overlay for better text readability */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
