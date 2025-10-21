import { useState } from 'react'
import { Bug, ChartBar, FileText, Lightbulb, GitMerge, Play, X, Palette } from 'phosphor-react'
import { motion, AnimatePresence } from 'framer-motion'

const features = [
  {
    name: 'Widget Studio',
    icon: Palette,
    color: 'text-info',
    bgColor: 'bg-info/10',
    title: 'Design Once, Deploy Everywhere',
    description:
      'Pick from 4 pre-built themes or customize every color, position, and text field. Enable multiple feedback types (NPS, CSAT, reviews, bugs) in one widget. Your users get a menu, your dashboard gets organized data. No CSS required.',
    videoUrl: 'https://cdn.reflectfeedback.com/assets/create-widget-showcase.mp4',
    thumbnail: 'https://cdn.reflectfeedback.com/assets/create-widget-showcase.mp4',
  },
  {
    name: 'Bug Reports',
    icon: Bug,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    title: 'Severity Levels That Actually Get Fixed',
    description:
      'Users describe the bug, pick severity (Low, Medium, High, Critical), and submit. You get structured reports in your dashboard with no more hunting through Slack threads. Filter by severity, assign priorities, close the loop faster.',
    videoUrl: 'https://cdn.reflectfeedback.com/assets/bug-report-showcase.mp4',
    thumbnail: 'https://cdn.reflectfeedback.com/assets/bug-report-showcase.mp4',
  },
  {
    name: 'Analytics Hub',
    icon: ChartBar,
    color: 'text-info',
    bgColor: 'bg-info/10',
    title: 'Your Feedback At a Glance',
    description:
      'See total feedback count, average rating, new bugs, and feature requests in real-time. Visual pie charts show distribution by type (NPS, bugs, requests). Filter recent activity by date. Turn data into decisions, not spreadsheets.',
    videoUrl: 'https://cdn.reflectfeedback.com/assets/dashboard-showcase.mp4',
    thumbnail: 'https://cdn.reflectfeedback.com/assets/dashboard-showcase.mp4',
  },
  {
    name: 'Survey Engine',
    icon: FileText,
    color: 'text-success',
    bgColor: 'bg-success/10',
    title: 'NPS, CSAT, CES. All In-App',
    description:
      'Deploy Net Promoter Score (0-10), Customer Satisfaction (emoji or star ratings), or Customer Effort Score surveys without leaving your product. Users respond in seconds, you track trends over time. Higher completion rates when surveys feel native.',
    videoUrl: 'https://cdn.reflectfeedback.com/assets/survey-responses-showcase.mp4',
    thumbnail: 'https://cdn.reflectfeedback.com/assets/survey-responses-showcase.mp4',
  },
  {
    name: 'Feature Voting',
    icon: Lightbulb,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    title: 'Let Users Vote, You Build Smarter',
    description:
      'Users submit feature ideas with priority levels, then upvote existing requests they want most. See which features have 50+ votes vs. 2. Your roadmap becomes data-driven, not opinion-driven. Democracy for product decisions.',
    videoUrl: 'https://cdn.reflectfeedback.com/assets/feature-request-showcase.mp4',
    thumbnail: 'https://cdn.reflectfeedback.com/assets/feature-request-showcase.mp4',
  },
  {
    name: 'Public Roadmap',
    icon: GitMerge,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    title: 'Show Progress, Build Trust',
    description:
      'Create columns like "Planned," "In Progress," "Shipped." Drag features between stages. Users see what you\'re working on in real-time. Convert feedback directly into roadmap items, add tags, set priorities. Transparency equals retention.',
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
              Every Tool You Need to <span className="text-primary">Close the Loop</span>
            </motion.h2>
            <motion.p
              className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-muted-foreground max-w-3xl mx-auto px-4 sm:px-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Watch how teams collect, organize, analyze, and act on feedback. All without leaving
              their workflow. Click any demo to see the full feature in action.
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

                <div
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4 ${feature.bgColor}`}
                >
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  <h3 className={`text-sm font-bold ${feature.color}`}>{feature.name}</h3>
                </div>

                <h4 className="text-xl font-bold tracking-tight text-foreground mb-3">
                  {feature.title}
                </h4>

                <p className="text-sm leading-6 text-muted-foreground">{feature.description}</p>
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
