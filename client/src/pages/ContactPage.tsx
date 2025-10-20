import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { EnvelopeSimple, MapPin, Phone, TwitterLogo, InstagramLogo } from 'phosphor-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

export const ContactPage = () => {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: 'Message sent!',
      description: "We'll get back to you as soon as possible.",
    })

    setFormData({ name: '', email: '', subject: '', message: '' })
    setIsSubmitting(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

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

        {/* Contact Form & Info Section */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 max-w-7xl mx-auto">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="order-2 lg:order-1"
              >
                <div className="rounded-3xl bg-background p-8 sm:p-10 shadow-2xl ring-1 ring-border/50 hover:ring-primary/20 transition-all duration-300">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
                    Send us a message
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-semibold text-foreground mb-2"
                      >
                        Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className="w-full h-12 text-base"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-foreground mb-2"
                      >
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full h-12 text-base"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-semibold text-foreground mb-2"
                      >
                        Subject
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="How can we help?"
                        className="w-full h-12 text-base"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-semibold text-foreground mb-2"
                      >
                        Message
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us more about your inquiry..."
                        rows={6}
                        className="w-full text-base"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 text-base font-semibold"
                      size="lg"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </div>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="order-1 lg:order-2 space-y-8"
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
                        hello@reflectfeedback.com
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
                        San Francisco, CA
                        <br />
                        United States
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
                        9:00 AM - 5:00 PM PST
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
                      aria-label="Twitter"
                    >
                      <TwitterLogo className="h-6 w-6" weight="fill" />
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
