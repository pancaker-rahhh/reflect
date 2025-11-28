/**
 * BLOG POST TEMPLATE
 *
 * Use this template to create the remaining blog posts.
 * Copy this file and rename it to match the blog post filename.
 *
 * Required elements:
 * 1. SEOHead with proper title, description, keywords, canonicalUrl
 * 2. usePageAnalytics() hook
 * 3. H1 at the top
 * 4. 800-1500 words of content
 * 4-8 subheadings (h2)
 * 5. Internal links to product pages (/features, /feedback-widget, /bug-reporting, /feature-requests)
 * 6. CTA at bottom linking to /login
 * 7. Navbar and Footer
 */

import { motion } from 'framer-motion'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { SEOHead } from '@/components/common/SEOHead'
import { usePageAnalytics } from '@/hooks/usePageAnalytics'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function BlogPostTemplate() {
  usePageAnalytics()

  return (
    <>
      <SEOHead
        title="[Blog Post Title] Reflect Blog"
        description="[Meta description - 150-160 characters]"
        keywords="[relevant keywords]"
        canonicalUrl="https://reflectfeedback.com/blog/[slug]"
        ogImage="https://reflectfeedback.com/og-image.png"
        schemaType="blog"
      />
      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        <article className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
                  [Blog Post Title]
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  [Brief introduction/description]
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="prose prose-lg max-w-none text-muted-foreground space-y-6"
              >
                {/* Add 4-8 h2 sections with 800-1500 words total */}
                {/* Include internal links to product pages */}
                {/* Example: <Link to="/features" className="text-primary hover:underline">link text</Link> */}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="mt-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20 text-center"
              >
                <h2 className="text-2xl font-bold text-foreground mb-4">Ready to [Action]?</h2>
                <p className="text-muted-foreground mb-6">[CTA description]</p>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-xl hover:shadow-2xl"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </motion.div>
            </div>
          </div>
        </article>
      </div>
      <Footer />
    </>
  )
}
