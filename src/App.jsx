import { useState } from 'react';
import CustomCursor from './components/CustomCursor.jsx';
import IntroAnimation from './components/IntroAnimation.jsx';
import PartnersSection from './components/PartnersSection.jsx';
import ContactSection from './components/ContactSection.jsx';
import StickyNav from './sections/StickyNav.jsx';
import HeroSection from './sections/HeroSection.jsx';
import MarketPainsSection from './sections/MarketPainsSection.jsx';
import OfferSection from './sections/OfferSection.jsx';
import UniqueValueSection from './sections/UniqueValueSection.jsx';
import CasesSection from './sections/CasesSection.jsx';
import WorkflowSection from './sections/WorkflowSection.jsx';
import { shouldShowIntro, markIntroSeen } from './lib/intro.js';

function App() {
  const [introVisible, setIntroVisible] = useState(true);

  function handleIntroComplete() {
    markIntroSeen();
    setIntroVisible(false);
  }

  return (
    <main className="site-shell">
      {introVisible && (
        <IntroAnimation onComplete={handleIntroComplete} />
      )}
      <CustomCursor />
      <StickyNav />
      <HeroSection />
      <MarketPainsSection />
      <OfferSection />
      <UniqueValueSection />
      <CasesSection />
      <WorkflowSection />
      <PartnersSection />
      <ContactSection />
    </main>
  );
}

export default App;
