import { lazy, Suspense, memo } from 'react'
import { motion } from 'framer-motion'
import NotBackedBadge from '@/components/common/NotBackedBadge'
import { LazyVisible } from '@/components/system/LazyVisible'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const SUNSET_MSG = 'Reflect has been sunset and is no longer accepting new sign-ups.'

// Lazy load video component
const VideoPlayer = lazy(() => import('./VideoPlayer'))

export const HeroSection = memo(() => {
  return (
    <motion.div
      id="hero"
      className="relative isolate overflow-hidden min-h-screen bg-gradient-to-br from-surface-1 via-surface-2 to-surface-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Clean Background */}
      <motion.div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/95" />

      {/* Main Content - Centered */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-16 sm:py-20 pt-24 sm:pt-32 pb-8 sm:pb-12">
        <div className="max-w-4xl mx-auto text-center space-y-8 sm:space-y-12">
          {/* Slogan and Description */}
          <motion.div
            className="space-y-4 sm:space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {/* Badge: centered directly above headline */}
            <div className="mx-auto mb-2 flex flex-col items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-muted/40 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
                Sunset · May 2025 – Dec 2025. Kept online as an archive.
              </span>
              <NotBackedBadge className="mx-auto px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm shadow-2xl ring-2 ring-primary/20 bg-white text-foreground border border-border/8" />
            </div>
            {/* SEO: Primary H1 for homepage */}
            <motion.h1
              className="site-hero__title text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.05] tracking-tight px-4 sm:px-0"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <span
                className="inline-block"
                style={{
                  background:
                    'linear-gradient(45deg, hsl(var(--foreground)), hsl(var(--primary)), hsl(var(--accent)), hsl(var(--foreground)))',
                  backgroundSize: '300% 300%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                In-App Feedback Tool for SaaS Teams
              </span>
            </motion.h1>

            <motion.h2
              className="text-xl sm:text-2xl md:text-3xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-medium px-4 sm:px-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              Capture bugs, ideas, and NPS - <em className="font-serif italic font-normal">instantly.</em>
            </motion.h2>
            {/* CTA Button */}
            <motion.div
              className="mt-6 sm:mt-8 flex justify-center px-4 sm:px-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0} className="cursor-not-allowed w-full sm:w-auto">
                    <button
                      disabled
                      aria-disabled="true"
                      className="inline-block rounded-2xl bg-primary px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-primary-foreground shadow-xl opacity-50 pointer-events-none transition-all border border-primary/20 w-full sm:w-auto"
                      style={{ boxShadow: '0 8px 32px rgba(220,38,38,0.18)' }}
                    >
                      Start for free
                    </button>
                  </span>
                </TooltipTrigger>
                <TooltipContent className="bg-foreground text-background max-w-[220px] text-center">
                  {SUNSET_MSG}
                </TooltipContent>
              </Tooltip>
            </motion.div>
          </motion.div>

          {/* Video Section - Blended underneath - Lazy loaded */}
          <LazyVisible rootMargin="100px">
            <motion.div
              className="w-full max-w-4xl mx-auto px-4 sm:px-0"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="relative">
                {/* Video Container with nice blending */}
                <motion.div
                  className="relative aspect-video w-full rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden border border-primary/20 backdrop-blur-sm"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: '0 30px 60px -12px rgba(220, 38, 38, 0.3)',
                  }}
                  transition={{ duration: 0.15 }}
                  style={{
                    willChange: 'transform',
                    backfaceVisibility: 'hidden',
                    transform: 'translateZ(0)',
                  }}
                >
                  <Suspense
                    fallback={
                      <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center">
                        <span className="text-muted-foreground">Loading video...</span>
                      </div>
                    }
                  >
                    <VideoPlayer
                      src="https://cdn.reflectfeedback.com/assets/reflect-intro-1080p.mp4"
                      poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Crect width='1920' height='1080' fill='%23111827'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' fill='%23dc2626' font-family='system-ui, sans-serif' font-size='48' font-weight='600'%3EDemo Loading...%3C/text%3E%3C/svg%3E"
                      ariaLabel="Reflect widget demonstration video"
                      autoPlay
                      loop
                      muted
                    />
                  </Suspense>

                  {/* Subtle overlay for better text readability */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  />
                </motion.div>
              </div>
            </motion.div>
          </LazyVisible>
        </div>
      </div>
    </motion.div>
  )
})
