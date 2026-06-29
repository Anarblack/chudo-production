import { useState } from 'react';
import CustomCursor from './components/CustomCursor.jsx';
import IntroAnimation from './components/IntroAnimation.jsx';
import PartnersSection from './components/PartnersSection.jsx';
import ContactSection from './components/ContactSection.jsx';
import StickyNav from './sections/StickyNav.jsx';
import CasesSection from './sections/CasesSection.jsx';
import MarketPainsSection from './sections/MarketPainsSection.jsx';
import OfferSection from './sections/OfferSection.jsx';
import AboutSection from './sections/AboutSection.jsx';
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
      <CasesSection />
      <MarketPainsSection />
      <OfferSection />
      <AboutSection />
      <PartnersSection />
      <ContactSection />
    </main>
  );
}

export default App;
