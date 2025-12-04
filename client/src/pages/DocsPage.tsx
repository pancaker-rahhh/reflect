import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { SEOHead } from '@/components/common/SEOHead'
import { Link } from 'react-router-dom'

export const DocsPage = () => {
  return (
    <>
      <SEOHead
        title="Reflect Documentation — Install & API Guide"
        description="Developer docs for Reflect: widget installation, API reference, and integration examples."
        keywords="Reflect API documentation, feedback widget installation, in-app feedback widget docs, Reflect integrations, feedback widget API, SaaS feedback widget setup"
        canonicalUrl="https://reflectfeedback.com/docs"
        ogImage="https://reflectfeedback.com/og-image.png"
        schemaType="default"
        breadcrumbs={[
          { name: 'Home', url: 'https://reflectfeedback.com/' },
          { name: 'Documentation', url: 'https://reflectfeedback.com/docs' },
        ]}
      />

      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-primary/3 to-background py-16 sm:py-20 lg:py-24">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6">
                Reflect Developer Documentation
              </h1>
              <p className="mt-6 text-lg sm:text-xl leading-8 text-muted-foreground max-w-3xl mx-auto">
                Get started with Reflect's feedback widget. Install, integrate, and start collecting
                user feedback in minutes. Our documentation covers everything from widget
                installation to API integration for SaaS development teams.
              </p>
              <p className="mt-4 text-base text-muted-foreground max-w-2xl mx-auto">
                Explore our{' '}
                <Link to="/docs/api" className="text-primary hover:underline">
                  API documentation
                </Link>{' '}
                for programmatic access, or learn about our{' '}
                <Link to="/features" className="text-primary hover:underline">
                  complete feature set
                </Link>{' '}
                for in-app feedback collection.
              </p>
              <div className="mt-8">
                <a
                  href="https://docs.reflectfeedback.com"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-xl hover:shadow-2xl"
                >
                  View Full Documentation
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
