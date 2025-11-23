import { lazy, Suspense } from 'react'
import { Navbar } from '@/components/landing/Navbar'
import { HeroSection } from '@/components/landing/HeroSection'
import { BeforeAfterSection } from '@/components/landing/BeforeAfterSection'
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
        title="Reflect — In-App Feedback & Bug Reporting Widget"
        description="Collect in-app feedback, bug reports, and feature requests with Reflect. 3-minute install for React/Vue, integrations with Slack & Jira. Start free."
        keywords="user feedback, bug tracking, feature requests, customer feedback, feedback widget, user surveys, NPS survey, CSAT survey, CES survey, product roadmap, customer insights, feedback management, user experience, SaaS feedback tool, customer feedback software, bug reporting tool, feature voting, user feedback widget, feedback analytics, customer satisfaction"
        canonicalUrl="https://reflectfeedback.com"
        ogImage="https://reflectfeedback.com/og-image.jpg"
      />
      <Analytics />
      <main className="min-h-screen overflow-x-hidden">
        <Navbar />
        <HeroSection />
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
        <LazyVisible>
          <Suspense fallback={<div className="h-64 bg-muted animate-pulse" />}>
            <Footer />
          </Suspense>
        </LazyVisible>
      </main>
    </>
  )
}
