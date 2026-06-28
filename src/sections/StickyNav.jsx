import { useState, useEffect } from 'react';
import { navItems } from '../data/navItems.js';
import { startAnchorScroll } from '../lib/anchor.js';

export function AnchorNav({ compact = false }) {
  return (
    <nav className={compact ? 'anchor-nav anchor-nav--compact' : 'anchor-nav'} aria-label="Навигация по предложению">
      {navItems.map((item) => (
        <a key={item.href} href={item.href} onClick={startAnchorScroll}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}

export default function StickyNav() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.querySelector('.hero-section');
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`sticky-nav${visible ? ' sticky-nav--visible' : ''}`}
      aria-hidden={!visible}
    >
      <AnchorNav compact />
    </div>
  );
}
