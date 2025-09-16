import { Navbar } from '@/components/landing/Navbar'
import { HeroSection } from '@/components/landing/HeroSection'
import { BeforeAfterSection } from '@/components/landing/BeforeAfterSection'
import { VideoSection } from '@/components/landing/VideoSection'
import { PlatformSection } from '@/components/landing/PlatformSection'
import { InteractiveModulesSection } from '@/components/landing/InteractiveModulesSection'
import { SocialProofSection } from '@/components/landing/SocialProofSection'
import { TrustSection } from '@/components/landing/TrustSection'
import { PricingSection } from '@/components/landing/PricingSection'
import { FaqSection } from '@/components/landing/FaqSection'
import { CtaSection } from '@/components/landing/CtaSection'
import { Footer } from '@/components/landing/Footer'
import { SEOHead } from '@/components/common/SEOHead'
import { Analytics } from '@/components/common/Analytics'

export const LandingPage = () => {
  return (
    <>
      <SEOHead
        title="User Feedback Platform - Bug Reports, Feature Requests & Surveys"
        description="Collect user feedback with Reflect's powerful widget. Bug reports, feature requests, surveys, and roadmaps in one platform. 3-minute setup, free plan available."
        keywords="user feedback, bug tracking, feature requests, customer feedback, feedback widget, user surveys, product roadmap, customer insights, feedback management, user experience"
        canonicalUrl="https://reflect.com"
        ogImage="/og-image.jpg"
      />
      <Analytics />
      <main className="min-h-screen">
        <Navbar />
        <HeroSection />
        <BeforeAfterSection />
        <VideoSection />
        <PlatformSection />
        <InteractiveModulesSection />
        <SocialProofSection />
        <TrustSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
        <Footer />
      </main>
    </>
  )
}
