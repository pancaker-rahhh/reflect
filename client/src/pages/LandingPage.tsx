import { lazy, Suspense } from 'react'
import { Navbar } from '@/components/landing/Navbar'
import { HeroSection } from '@/components/landing/HeroSection'
import { BeforeAfterSection } from '@/components/landing/BeforeAfterSection'
import { SEOFeaturesSection } from '@/components/landing/SEOFeaturesSection'
import { InternalLinksSection } from '@/components/landing/InternalLinksSection'
import { CTASection } from '@/components/landing/CTASection'
import { LazyVisible } from '@/components/system/LazyVisible'
import { SEOHead } from '@/components/common/SEOHead'
import { Analytics } from '@/components/common/Analytics'

// Lazy load heavy components below the fold
const PlatformSection = lazy(() =>
  import('@/components/landing/PlatformSection').then((m) => ({ default: m.PlatformSection }))
)
const InteractiveModulesSection = lazy(() =>
  import('@/components/landing/InteractiveModulesSection').then((m) => ({
    default: m.InteractiveModulesSection,
  }))
)
const SocialProofSection = lazy(() =>
  import('@/components/landing/SocialProofSection').then((m) => ({ default: m.SocialProofSection }))
)
const PricingSection = lazy(() =>
  import('@/components/landing/PricingSection').then((m) => ({ default: m.PricingSection }))
)
const FaqSection = lazy(() =>
  import('@/components/landing/FaqSection').then((m) => ({ default: m.FaqSection }))
)
const BrandingSection = lazy(() =>
  import('@/components/landing/BrandingSection').then((m) => ({ default: m.BrandingSection }))
)
const Footer = lazy(() =>
  import('@/components/landing/Footer').then((m) => ({ default: m.Footer }))
)

export const LandingPage = () => {
  return (
    <>
      <SEOHead
        title="Reflect In-App Feedback Tool & Bug Reporting Widget for SaaS"
        description="Collect user feedback, bug reports, and feature requests directly inside your app. Reflect is the fastest in-app feedback widget for SaaS teams. Try it free."
        keywords="in-app feedback tool, feedback widget, bug reporting tool, feature request tool, user feedback tool for SaaS, customer feedback, feedback management, user experience, SaaS feedback, customer insights"
        canonicalUrl="https://reflectfeedback.com/"
        ogImage="https://reflectfeedback.com/og-image.png"
        schemaType="homepage"
      />
      <Analytics />
      <main className="min-h-screen overflow-x-hidden">
        <Navbar />
        <HeroSection />
        <SEOFeaturesSection />
        <InternalLinksSection />
        <BeforeAfterSection />
        <LazyVisible>
          <Suspense fallback={<div className="h-96 bg-muted animate-pulse" />}>
            <PlatformSection />
          </Suspense>
        </LazyVisible>
        <LazyVisible>
          <Suspense fallback={<div className="h-96 bg-muted animate-pulse" />}>
            <InteractiveModulesSection />
          </Suspense>
        </LazyVisible>
        <LazyVisible>
          <Suspense fallback={<div className="h-96 bg-muted animate-pulse" />}>
            <SocialProofSection />
          </Suspense>
        </LazyVisible>
        <LazyVisible>
          <Suspense fallback={<div className="h-96 bg-muted animate-pulse" />}>
            <PricingSection />
          </Suspense>
        </LazyVisible>
        <LazyVisible>
          <Suspense fallback={<div className="h-96 bg-muted animate-pulse" />}>
            <FaqSection />
          </Suspense>
        </LazyVisible>
        <LazyVisible>
          <Suspense fallback={<div className="h-32 bg-muted animate-pulse" />}>
            <BrandingSection />
          </Suspense>
        </LazyVisible>
        <CTASection />
        <LazyVisible>
          <Suspense fallback={<div className="h-64 bg-muted animate-pulse" />}>
            <Footer />
          </Suspense>
        </LazyVisible>
      </main>
    </>
  )
}
