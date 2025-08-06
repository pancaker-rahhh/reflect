import React from 'react';
import CtaSection from './components/CtaSection'; 
import Footer from './components/Footer';
import FaqSection from './components/FaqSection';
import PricingSection from './components/PricingSection';
import InteractiveModulesSection from './components/InteractiveModulesSection';
import PlatformSection from './components/PlatformSection';
import VideoSection from './components/VideoSection';
import BeforeAfterSection from './components/BeforeAfterSection';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';

const App = () => {
    return (
        <main>
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

export default App;