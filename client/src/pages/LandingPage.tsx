import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { BeforeAfterSection } from '@/components/landing/BeforeAfterSection';
import { VideoSection } from '@/components/landing/VideoSection';
import { PlatformSection } from '@/components/landing/PlatformSection';
import { InteractiveModulesSection } from '@/components/landing/InteractiveModulesSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { CtaSection } from '@/components/landing/CtaSection';
import { Footer } from '@/components/landing/Footer';

export const LandingPage = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <BeforeAfterSection />
      <VideoSection />
      <PlatformSection />
      <InteractiveModulesSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </main>
  );
};
