import { motion } from 'framer-motion'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { SEOHead } from '@/components/common/SEOHead'
import { founders } from '@/components/landing/data/founders'
import { teamMembers } from '@/components/landing/data/team-members'

export const AboutPage = () => {
  return (
    <>
      <SEOHead
        title="About Reflect - Our Story & Values"
        description="Learn about Reflect - building lightweight in-app feedback tools for product teams. Our mission, values, and team."
        canonicalUrl="https://reflectfeedback.com/about"
        ogImage="https://reflectfeedback.com/og-image.png"
        schemaType="default"
      />

      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-primary/3 to-background py-16 sm:py-20 lg:py-24">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              className="mx-auto max-w-4xl text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 mb-6"
              >
                <span className="text-sm font-semibold text-primary">About Us</span>
              </motion.div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6">
                About Reflect
              </h1>
              <p className="mt-6 text-lg sm:text-xl leading-8 text-muted-foreground max-w-3xl mx-auto">
                We're on a mission to help companies build better products by making feedback
                collection and management effortless.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                  Our Mission
                </h2>
                <div className="space-y-6 text-lg leading-8 text-muted-foreground">
                  <p>
                    At Reflect, we believe that the best products are built by listening to users.
                    That's why we're building the most comprehensive, yet simple-to-use feedback
                    management platform.
                  </p>
                  <p>
                    From bug reports to feature requests, surveys to roadmaps, we provide all the
                    tools you need to capture, organize, and act on user feedback, all in one place.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Meet the Team
              </h2>
              <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                The team behind Reflect is dedicated to transforming how companies gather and act on
                feedback.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 max-w-6xl mx-auto">
              {[...founders, ...teamMembers].map((founder, index) => (
                <motion.div
                  key={founder.name}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-3xl bg-background shadow-xl ring-1 ring-border/50 hover:shadow-2xl hover:ring-primary/20 transition-all duration-500">
                    <div className="aspect-square overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 relative">
                      <img
                        src={founder.image}
                        alt={founder.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                        decoding="async"
                        width={400}
                        height={400}
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            founder.name
                          )}&size=400&background=random`
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                        {founder.name}
                      </h3>
                      <p className="text-sm sm:text-base text-primary font-semibold mt-2">
                        {founder.role}
                      </p>
                      <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                        {founder.bio}
                      </p>
                      <div className="mt-5 flex items-center gap-3">
                        <a
                          href={`https://x.com/${founder.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                          aria-label={`${founder.name} on X`}
                        >
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-primary/5 to-background relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Want to Join Our Journey?
              </h2>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href="/contact"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-xl hover:shadow-2xl"
                >
                  Get in Touch
                </motion.a>
                <motion.a
                  href="/"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl bg-background text-foreground hover:bg-muted transition-all duration-300 border-2 border-border hover:border-primary"
                >
                  Try Reflect
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
