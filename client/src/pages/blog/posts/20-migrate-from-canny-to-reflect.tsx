import { motion } from 'framer-motion'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { SEOHead } from '@/components/common/SEOHead'
import { usePageAnalytics } from '@/hooks/usePageAnalytics'
import { Link } from 'react-router-dom'

export default function MigrateFromCannyToReflect() {
  usePageAnalytics()

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'How to Migrate from Canny to Reflect — Complete Guide',
    description:
      'Step-by-step guide to export data from Canny and import into Reflect with a migration checklist and CSV examples.',
    datePublished: '2025-12-04',
    dateModified: '2025-12-04',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'https://reflectfeedback.com/blog/migrate-from-canny-to-reflect',
    },
    author: {
      '@type': 'Person',
      name: 'Reflect Team',
    },
    image: ['https://reflectfeedback.com/og-image.png'],
    url: 'https://reflectfeedback.com/blog/migrate-from-canny-to-reflect',
  }

  return (
    <>
      <SEOHead
        title="How to Migrate from Canny to Reflect — Complete Guide | Reflect Blog"
        description="Step-by-step guide to export data from Canny and import into Reflect with a migration checklist and CSV examples."
        keywords="migrate from canny, canny to reflect migration, feedback tool migration, canny alternative"
        canonicalUrl="https://reflectfeedback.com/blog/migrate-from-canny-to-reflect"
        ogImage="https://reflectfeedback.com/og-image.png"
        schemaType="blog"
        ogType="article"
        structuredData={articleSchema}
      />
      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        <article className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
                  How to Migrate from Canny to Reflect — Complete Guide
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  <strong>TL;DR</strong> — Export posts and votes from Canny, map fields to the
                  Reflect CSV, import posts then votes/comments, and run the migration checklist.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="prose prose-lg max-w-none text-muted-foreground space-y-6"
              >
                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">Why migrate?</h2>
                <p>
                  In-app capture, richer bug context, simpler pricing, and developer-friendly SDKs.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Step 1 — Export your data from Canny
                </h2>
                <ol>
                  <li>Admin → Export → select Posts and Votes (download JSON/CSV)</li>
                  <li>Preserve attachments and user email mappings</li>
                </ol>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Step 2 — Map fields
                </h2>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code>
                    {`external_id,title,description,status,created_at,updated_at,author_email,votes_count,comments_count,public,labels,linked_jira_issue,attachments`}
                  </code>
                </pre>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Step 3 — Import into Reflect
                </h2>
                <p>
                  Use the migration CSV import tool: import posts first, then import votes based on
                  external_id.
                </p>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
                  Post-migration checklist
                </h2>
                <ul>
                  <li>Validate imports in staging</li>
                  <li>Reconfigure integrations (Jira/GitHub/Slack)</li>
                  <li>Notify users & close the loop on migrated requests</li>
                </ul>

                <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">Need help?</h2>
                <p>
                  <Link to="/contact" className="text-primary hover:underline">
                    Request a migration plan
                  </Link>{' '}
                  — we can assist with mapping and import.
                </p>
              </motion.div>
            </div>
          </div>
        </article>
      </div>
      <Footer />
    </>
  )
}
