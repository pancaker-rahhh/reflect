import { Navbar } from '@/components/landing/Navbar'
import { HeroSection } from '@/components/landing/HeroSection'
import { BeforeAfterSection } from '@/components/landing/BeforeAfterSection'
import { PlatformSection } from '@/components/landing/PlatformSection'
import { InteractiveModulesSection } from '@/components/landing/InteractiveModulesSection'
import { SocialProofSection } from '@/components/landing/SocialProofSection'
import { PricingSection } from '@/components/landing/PricingSection'
import { FaqSection } from '@/components/landing/FaqSection'
import { BrandingSection } from '@/components/landing/BrandingSection'
import { Footer } from '@/components/landing/Footer'
import { SEOHead } from '@/components/common/SEOHead'
import { Analytics } from '@/components/common/Analytics'

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
        <PlatformSection />
        <InteractiveModulesSection />
        <SocialProofSection />
        <PricingSection />
        <FaqSection />
        <BrandingSection />
        <Footer />
      </main>
    </>
  )
}
