import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { SEOHead } from '@/components/common/SEOHead'
import { Link } from 'react-router-dom'

export const DocsApiPage = () => {
  return (
    <>
      <SEOHead
        title="Reflect Documentation — Install & API Guide"
        description="Developer docs for Reflect: widget installation, API reference, and integration examples."
        keywords="Reflect API, feedback widget API, in-app feedback API, SaaS feedback API, REST API documentation, feedback management API, programmatic feedback"
        canonicalUrl="https://reflectfeedback.com/docs/api"
        ogImage="https://reflectfeedback.com/og-image.png"
        schemaType="default"
        breadcrumbs={[
          { name: 'Home', url: 'https://reflectfeedback.com/' },
          { name: 'Documentation', url: 'https://reflectfeedback.com/docs' },
          { name: 'API Reference', url: 'https://reflectfeedback.com/docs/api' },
        ]}
      />

      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-primary/3 to-background py-16 sm:py-20 lg:py-24">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6">
                Reflect API Reference for Developers
              </h1>
              <p className="mt-6 text-lg sm:text-xl leading-8 text-muted-foreground max-w-3xl mx-auto">
                Integrate Reflect with your backend. Create feedback, retrieve responses, and sync
                data programmatically. Our REST API enables seamless integration with your SaaS
                application for automated feedback management.
              </p>
              <p className="mt-4 text-base text-muted-foreground max-w-2xl mx-auto">
                Need help getting started? Check our{' '}
                <Link to="/docs" className="text-primary hover:underline">
                  main documentation
                </Link>{' '}
                for widget installation, or explore our{' '}
                <Link to="/features" className="text-primary hover:underline">
                  feature capabilities
                </Link>
                .
              </p>
              <div className="mt-8">
                <a
                  href="https://docs.reflectfeedback.com"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-xl hover:shadow-2xl"
                >
                  View API Documentation
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
