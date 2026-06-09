import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import PartnerLogoItem from './PartnerLogoItem.jsx';

const LIGHT_RADIUS  = 280;  // px — radius of the flashlight beam
const LERP_SPEED    = 0.1;  // 0..1 — higher = snappier tracking
const AUTO_SPEED    = 0.003; // lemniscate animation speed when no pointer

function lerp(a, b, t) { return a + (b - a) * t; }

export default function PartnerLogoGrid({ logos }) {
  const wrapRef   = useRef(null);
  const cursorRef = useRef(null);

  useEffect(() => {
    const wrap     = wrapRef.current;
    const cursorEl = cursorRef.current;
    if (!wrap) return;

    // ── Animation state (plain JS — never triggers React re-render) ────────
    let tX = 0, tY = 0;   // target position (mouse / auto)
    let cX = 0, cY = 0;   // current smoothed position
    let hasPointer = false;
    let autoT = 0;
    let rafId;

    // Per-item cache — rebuilt on resize, avoids getBCR in the hot loop
    let cache = [];

    function buildCache() {
      const wRect = wrap.getBoundingClientRect();
      if (!wRect.width) return;
      const els = Array.from(wrap.querySelectorAll('.pLogo'));
      cache = els.map(el => {
        const r = el.getBoundingClientRect();
        return {
          el,
          cx:  r.left - wRect.left + r.width  / 2,
          cy:  r.top  - wRect.top  + r.height / 2,
          lit: 0,
        };
      });
      // Seed position to centre so first frames look natural
      tX = cX = wRect.width  / 2;
      tY = cY = wRect.height / 2;
    }

    function tick() {
      // ── Auto lemniscate when no pointer ──────────────────────────────────
      if (!hasPointer) {
        autoT += AUTO_SPEED;
        const { width, height } = wrap.getBoundingClientRect();
        const denom = 1 + Math.sin(autoT) ** 2;
        tX = width  / 2 + width  * 0.28 * Math.cos(autoT) / denom;
        tY = height / 2 + height * 0.20 * Math.sin(autoT) * Math.cos(autoT) / denom;
      }

      // ── Smooth follow ─────────────────────────────────────────────────────
      cX = lerp(cX, tX, LERP_SPEED);
      cY = lerp(cY, tY, LERP_SPEED);

      // ── Update overlay position via CSS vars ──────────────────────────────
      wrap.style.setProperty('--fl-x', `${cX}px`);
      wrap.style.setProperty('--fl-y', `${cY}px`);

      // ── Move custom cursor glow ───────────────────────────────────────────
      if (cursorEl) {
        cursorEl.style.left    = `${cX}px`;
        cursorEl.style.top     = `${cY}px`;
        cursorEl.style.opacity = hasPointer ? '1' : '0.5';
      }

      // ── Per-item lighting (opacity + scale + glow via CSS vars) ──────────
      for (const item of cache) {
        const dx   = item.cx - cX;
        const dy   = item.cy - cY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const goal = Math.max(0, 1 - dist / LIGHT_RADIUS);
        item.lit   = lerp(item.lit, goal, LERP_SPEED);
        item.el.style.setProperty('--lit', item.lit.toFixed(3));
      }

      rafId = requestAnimationFrame(tick);
    }

    // ── Event listeners ───────────────────────────────────────────────────────
    function onMove(e) {
      const rect = wrap.getBoundingClientRect();
      tX = e.clientX - rect.left;
      tY = e.clientY - rect.top;
      hasPointer = true;
    }
    function onLeave() { hasPointer = false; }
    function onTouch(e) {
      const t = e.touches[0];
      if (!t) return;
      const rect = wrap.getBoundingClientRect();
      tX = t.clientX - rect.left;
      tY = t.clientY - rect.top;
      hasPointer = true;
    }
    function onTouchEnd() { hasPointer = false; }

    wrap.addEventListener('mousemove',  onMove,      { passive: true });
    wrap.addEventListener('mouseleave', onLeave);
    wrap.addEventListener('touchmove',  onTouch,     { passive: true });
    wrap.addEventListener('touchend',   onTouchEnd);

    // Rebuild cache on resize (layout shift)
    const ro = new ResizeObserver(buildCache);
    ro.observe(wrap);

    // Initial build after first paint
    rafId = requestAnimationFrame(() => {
      buildCache();
      rafId = requestAnimationFrame(tick);
    });

    return () => {
      cancelAnimationFrame(rafId);
      wrap.removeEventListener('mousemove',  onMove);
      wrap.removeEventListener('mouseleave', onLeave);
      wrap.removeEventListener('touchmove',  onTouch);
      wrap.removeEventListener('touchend',   onTouchEnd);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="pGrid-wrap"
      data-cursor="flashlight"
    >
      {/* Glow dot — the visual flashlight source */}
      <div ref={cursorRef} className="pGrid-cursor" aria-hidden="true" />

      {/* Logo grid */}
      <div className="pGrid" role="list" aria-label="Логотипы партнёров">
        {logos.map((logo, i) => (
          <motion.div
            key={logo.id}
            role="listitem"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.04 }}
            transition={{
              duration: 0.55,
              delay: Math.min(i * 0.032, 0.55),
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <PartnerLogoItem logo={logo} />
          </motion.div>
        ))}
      </div>

      {/* Darkness overlay with radial hole = flashlight effect */}
      <div className="pGrid-overlay" aria-hidden="true" />
    </div>
  );
}
