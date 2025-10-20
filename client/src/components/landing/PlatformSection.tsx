import { useState } from 'react'
import {
  Bug,
  ChartBar,
  FileText,
  Lightbulb,
  GitMerge,
  Play,
  X,
  Palette,
} from 'phosphor-react'
import { motion, AnimatePresence } from 'framer-motion'

const features = [
    {
    name: 'Create Widget',
    icon: Palette,
    color: 'text-info',
    bgColor: 'bg-info/10',
    title: 'Customize Your Feedback Widget',
    description:
      'Design and configure your feedback widget to match your brand. Easily embed it in your application and start collecting valuable user insights.',
    videoUrl: 'https://cdn.reflectfeedback.com/assets/create-widget-showcase.mp4',
    thumbnail: 'https://cdn.reflectfeedback.com/assets/create-widget-showcase.mp4',
  },
  {
    name: 'Bug Reports',
    icon: Bug,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    title: 'Streamline Your Bug Tracking',
    description:
      'Track and manage bug reports with detailed information, screenshots, and priority levels. Users can easily report issues directly from your application.',
    videoUrl: 'https://cdn.reflectfeedback.com/assets/bug-report-showcase.mp4',
    thumbnail: 'https://cdn.reflectfeedback.com/assets/bug-report-showcase.mp4',
  },
  {
    name: 'Dashboard',
    icon: ChartBar,
    color: 'text-info',
    bgColor: 'bg-info/10',
    title: 'Get a Complete Overview',
    description:
      'Our comprehensive analytics dashboard gives you real-time insights and performance metrics to track your user engagement and feedback trends.',
    videoUrl: 'https://cdn.reflectfeedback.com/assets/dashboard-showcase.mp4',
    thumbnail: 'https://cdn.reflectfeedback.com/assets/dashboard-showcase.mp4',
  },
  {
    name: 'Survey Responses',
    icon: FileText,
    color: 'text-success',
    bgColor: 'bg-success/10',
    title: 'Analyze Survey Results',
    description:
      'Build custom surveys, NPS, and CSAT forms to gather targeted feedback. View detailed response analytics and insights to understand your users better.',
    videoUrl: 'https://cdn.reflectfeedback.com/assets/survey-responses-showcase.mp4',
    thumbnail: 'https://cdn.reflectfeedback.com/assets/survey-responses-showcase.mp4',
  },
  {
    name: 'Feature Requests',
    icon: Lightbulb,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    title: 'Prioritize Your Roadmap',
    description:
      'Let your users submit ideas and vote on their favorite features. Our voting system helps you build a data-driven roadmap your users will love.',
    videoUrl: 'https://cdn.reflectfeedback.com/assets/feature-request-showcase.mp4',
    thumbnail: 'https://cdn.reflectfeedback.com/assets/feature-request-showcase.mp4',
  },
  {
    name: 'Roadmap',
    icon: GitMerge,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    title: 'Share Your Vision',
    description:
      "Keep your users in the loop with a beautiful, public-facing roadmap. Show them what you're working on and what's coming next to build trust and excitement.",
    videoUrl: 'https://cdn.reflectfeedback.com/assets/roadmap-showcase.mp4',
    thumbnail: 'https://cdn.reflectfeedback.com/assets/roadmap-showcase.mp4',
  },
]

export const PlatformSection = () => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

  const handlePlayVideo = (videoUrl: string) => {
    setSelectedVideo(videoUrl)
    setIsVideoLoaded(false)
  }

  const handleCloseModal = () => {
    setSelectedVideo(null)
    setIsVideoLoaded(false)
  }

  return (
    <>
      <motion.div
        id="platform"
        className="bg-background py-16 sm:py-20 lg:py-24"
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
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              One platform to handle your <span className="text-primary">feedback</span>
            </motion.h2>
            <motion.p
              className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-muted-foreground max-w-3xl mx-auto px-4 sm:px-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Explore our key features through videos showcasing the platform. See how Reflect can
              streamline your entire feedback lifecycle.
            </motion.p>
          </motion.div>

          <div className="mt-12 sm:mt-16 lg:mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                className="group relative rounded-2xl bg-background p-6 shadow-lg ring-1 ring-border/30 hover:shadow-2xl transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <button
                  onClick={() => handlePlayVideo(feature.videoUrl)}
                  className="relative aspect-video w-full rounded-xl overflow-hidden shadow-md mb-6 cursor-pointer"
                >
                  <video
                    src={feature.thumbnail}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    preload="metadata"
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="h-14 w-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-foreground transition-all duration-300 group-hover:scale-110">
                      <Play className="h-6 w-6 ml-1" fill="currentColor" />
                    </div>
                  </div>
                </button>

                <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4 ${feature.bgColor}`}>
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  <h3 className={`text-sm font-bold ${feature.color}`}>
                    {feature.name}
                  </h3>
                </div>

                <h4 className="text-xl font-bold tracking-tight text-foreground mb-3">
                  {feature.title}
                </h4>

                <p className="text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div
              className="relative w-full max-w-6xl bg-background rounded-2xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors text-foreground"
                aria-label="Close video"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="relative aspect-video w-full bg-black">
                {!isVideoLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                )}
                <video
                  src={selectedVideo}
                  className="w-full h-full"
                  controls
                  autoPlay
                  playsInline
                  onLoadedData={() => setIsVideoLoaded(true)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
