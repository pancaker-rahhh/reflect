import { motion } from 'framer-motion'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { SEOHead } from '@/components/common/SEOHead'
import { Code, Palette, Zap, Smartphone } from 'lucide-react'
import { usePageAnalytics } from '@/hooks/usePageAnalytics'
import { Link } from 'react-router-dom'

const benefits = [
  {
    icon: <Code className="h-6 w-6" />,
    title: 'One-Line Installation',
    description:
      'Add our lightweight script to your site. No npm packages, no build steps, no complexity.',
  },
  {
    icon: <Palette className="h-6 w-6" />,
    title: 'Full Customization',
    description:
      'Match your brand colors, fonts, and styling. Customize fields, categories, and positioning.',
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Lightweight & Fast',
    description:
      'Less than 50KB gzipped. No performance impact. Loads asynchronously without blocking your page.',
  },
  {
    icon: <Smartphone className="h-6 w-6" />,
    title: 'Mobile Optimized',
    description:
      'Works flawlessly on all devices. Responsive design that adapts to any screen size. Mobile-optimized in-app feedback widget for seamless user experience.',
  },
]

export default function FeedbackWidgetPage() {
  usePageAnalytics()

  return (
    <>
      <SEOHead
        title="Feedback Widget for SaaS - Fast & Customizable | Reflect"
        description="Install Reflect's lightweight, customizable feedback widget to collect bug reports and feature requests inside your app - quick install, no performance impact."
        keywords="feedback widget, in-app feedback widget, user feedback widget, feedback collection widget, SaaS feedback widget"
        canonicalUrl="https://reflectfeedback.com/feedback-widget"
        ogImage="https://reflectfeedback.com/og-image.png"
        schemaType="product"
        breadcrumbs={[
          { name: 'Home', url: 'https://reflectfeedback.com/' },
          { name: 'Feedback Widget', url: 'https://reflectfeedback.com/feedback-widget' },
        ]}
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
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6">
                A Beautiful, Lightweight In-App Feedback Widget for Your SaaS
              </h1>
              <p className="mt-6 text-lg sm:text-xl leading-8 text-muted-foreground max-w-3xl mx-auto">
                Install our feedback widget in minutes and start collecting user feedback directly
                inside your application. No bloat, no performance impact, just a simple widget that
                works. Reflect's embeddable feedback widget script works seamlessly inside modern
                SaaS apps.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Installation Section */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                  Install the Feedback Widget in Minutes
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Add Reflect to your app with a single script tag. No complicated setup, no
                  dependencies, no build process required. Built for SaaS teams and product managers
                  who need instant feedback collection.
                </p>
                <div className="bg-muted rounded-xl p-6 border border-border">
                  <pre className="text-sm overflow-x-auto">
                    <code>{`<script>
  window.reflectConfig = { 
    key: "your-widget-key",
    position: "bottom_right"
  };
</script>
<script async src="https://cdn.reflect.app/widgets/your-widget-key/widget.js"></script>`}</code>
                  </pre>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                  Full Customization for Branding and Fields
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Customize every aspect of your feedback widget to match your brand and collect the
                  information you need. Create a fully custom-branded feedback widget that matches
                  your product UI.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-card rounded-xl p-6 border border-border">
                    <h3 className="text-xl font-bold text-foreground mb-3">Custom Fields</h3>
                    <p className="text-muted-foreground">
                      Add custom fields for name, email, category, priority, and more. Collect
                      exactly the information your team needs. Perfect for collecting{' '}
                      <Link to="/bug-reporting" className="text-primary hover:underline">
                        bug reports
                      </Link>{' '}
                      and{' '}
                      <Link to="/feature-requests" className="text-primary hover:underline">
                        feature voting
                      </Link>{' '}
                      directly inside your app.
                    </p>
                  </div>
                  <div className="bg-card rounded-xl p-6 border border-border">
                    <h3 className="text-xl font-bold text-foreground mb-3">Brand Theming</h3>
                    <p className="text-muted-foreground">
                      Match your exact brand colors, fonts, and styling. Remove our branding on Pro
                      plans to make it look native to your app.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                  Lightweight, Fast & Performance-Safe
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Our feedback widget is designed to provide the best user experience while
                  collecting valuable feedback. Designed for product teams who need a reliable
                  feedback widget without performance tradeoffs.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={benefit.title}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start gap-4 bg-card rounded-xl p-6 border border-border"
                    >
                      <div className="flex-shrink-0 text-primary">{benefit.icon}</div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2">{benefit.title}</h3>
                        <p className="text-muted-foreground">{benefit.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
                className="mt-12"
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                  Mobile-Optimized In-App Feedback Widget
                </h2>
                <p className="text-lg text-muted-foreground">
                  Our feedback widget works flawlessly on all devices with responsive design that
                  adapts to any screen size, ensuring a seamless experience for mobile users.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                viewport={{ once: true }}
                className="mt-12"
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                  Built for SaaS Teams and Product Managers
                </h2>
                <p className="text-lg text-muted-foreground">
                  Reflect's feedback widget is designed specifically for SaaS teams and product
                  managers who need reliable, fast feedback collection without performance tradeoffs
                  or complex setup.
                </p>
              </motion.div>
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
                Why Reflect's Feedback Widget Is Better
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                No complicated setup. Lightweight script, no bloat. A powerful alternative to Canny
                and Sleekplan, built for fast SaaS teams.
              </p>
              <motion.a
                href="/login"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                Install the Widget
              </motion.a>
            </motion.div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
