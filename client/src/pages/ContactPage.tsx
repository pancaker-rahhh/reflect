import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { EnvelopeSimple, MapPin, Phone, InstagramLogo } from 'phosphor-react'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

export const ContactPage = () => {

  return (
    <>
      <Helmet>
        <title>Contact Us - Reflect</title>
        <meta
          name="description"
          content="Get in touch with the Reflect team. We'd love to hear from you."
        />
      </Helmet>

      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-primary/3 to-background py-20 sm:py-32">
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
                <span className="text-sm font-semibold text-primary">Contact Us</span>
              </motion.div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6">
                Let's Start a{' '}
                <span className="text-primary bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Conversation
                </span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl leading-8 text-muted-foreground max-w-3xl mx-auto">
                Have a question or want to work together? We'd love to hear from you. Send us a
                message and we'll respond as soon as possible.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Info Section */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                    Contact Information
                  </h2>
                  <p className="text-base sm:text-lg text-muted-foreground">
                    Reach out to us through any of these channels. We're here to help!
                  </p>
                </div>

                <div className="space-y-6">
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-all duration-300"
                  >
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                      <EnvelopeSimple className="h-7 w-7 text-primary" weight="fill" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2 text-lg">Email</h3>
                      <a
                        href="mailto:hello@reflectfeedback.com"
                        className="text-muted-foreground hover:text-primary transition-colors text-base"
                      >
                        support@reflectfeedback.com
                      </a>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-all duration-300"
                  >
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-7 w-7 text-primary" weight="fill" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2 text-lg">Location</h3>
                      <p className="text-muted-foreground text-base">
                        Bengaluru, KA
                        <br />
                        India
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-all duration-300"
                  >
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Phone className="h-7 w-7 text-primary" weight="fill" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2 text-lg">Support</h3>
                      <p className="text-muted-foreground text-base">
                        Available Monday - Friday
                        <br />
                        5:00 PM - 12:00 AM IST
                      </p>
                    </div>
                  </motion.div>
                </div>

                <div className="pt-8 border-t border-border">
                  <h3 className="font-semibold text-foreground mb-4 text-lg">Follow Us</h3>
                  <div className="flex items-center gap-4">
                    <motion.a
                      href="https://x.com/Reflectfeedback"
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-12 h-12 rounded-xl bg-muted hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors shadow-sm"
                      aria-label="X (Twitter)"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </motion.a>
                    <motion.a
                      href="https://www.instagram.com/reflect_feedback/"
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-12 h-12 rounded-xl bg-muted hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors shadow-sm"
                      aria-label="Instagram"
                    >
                      <InstagramLogo className="h-6 w-6" weight="fill" />
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
