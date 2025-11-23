import { Helmet } from 'react-helmet-async'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

export const BlogPage = () => {
  return (
    <>
      <Helmet>
        <title>Reflect Blog — Product Feedback, UX & Engineering</title>
        <meta
          name="description"
          content="Practical articles about user feedback strategies, in-app UX, bug reporting best practices, and how product teams prioritize features using feedback."
        />
      </Helmet>

      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-primary/3 to-background py-16 sm:py-20 lg:py-24">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6">
                Insights on Product Feedback & Building Better Products
              </h1>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-lg text-muted-foreground">
                Blog content coming soon. Check back for articles about user feedback strategies,
                in-app UX, and bug reporting best practices.
              </p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
