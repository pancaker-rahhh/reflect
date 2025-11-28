import { Helmet } from 'react-helmet-async'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

export const DocsPage = () => {
  return (
    <>
      <Helmet>
        <title>Reflect Docs Install, Integrations & Usage</title>
        <meta
          name="description"
          content="Developer docs for Reflect: install the feedback widget, integrate with Slack/Jira, and use the API. Step-by-step guides for React, Vue and plain JS."
        />
      </Helmet>

      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-primary/3 to-background py-16 sm:py-20 lg:py-24">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6">
                Reflect Documentation
              </h1>
              <p className="mt-6 text-lg sm:text-xl leading-8 text-muted-foreground max-w-3xl mx-auto">
                Get started with Reflect's feedback widget. Install, integrate, and start collecting
                user feedback in minutes.
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
