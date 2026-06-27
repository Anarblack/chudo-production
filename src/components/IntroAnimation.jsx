import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion';

const ARCHAR_PATH = 'M17155 12995 c-22 -8 -51 -14 -65 -13 -14 0 -36 -4 -51 -10 -15 -6 -31 -6 -41 -1 -9 5 -34 1 -69 -11 -29 -11 -65 -20 -79 -19 -14 0 -58 -12 -99 -26 -40 -14 -79 -24 -87 -21 -7 3 -16 -3 -19 -14 -3 -10 -20 -27 -38 -38 -48 -28 -237 -203 -237 -220 0 -4 -13 -21 -28 -38 -58 -67 -112 -150 -112 -174 0 -11 -9 -29 -20 -40 -11 -11 -20 -23 -20 -27 0 -21 -61 -167 -72 -174 -7 -5 -14 -21 -15 -36 -6 -123 -18 -196 -32 -201 -6 -2 -9 -7 -6 -11 7 -12 9 -220 2 -227 -3 -4 1 -23 9 -43 8 -20 14 -36 13 -36 0 0 4 -20 11 -44 6 -23 9 -49 6 -56 -2 -7 4 -23 15 -36 10 -12 19 -28 19 -36 0 -8 11 -31 25 -51 14 -20 25 -45 25 -54 0 -10 4 -18 9 -18 5 0 14 -15 22 -32 7 -18 16 -35 19 -38 4 -3 23 -26 42 -51 37 -50 44 -58 83 -102 14 -16 22 -33 19 -39 -4 -6 -2 -8 4 -5 10 7 28 -6 97 -68 18 -17 65 -48 104 -69 39 -22 71 -43 71 -48 0 -4 11 -8 25 -8 15 0 39 -7 54 -15 31 -16 53 -21 156 -39 39 -7 79 -17 90 -23 29 -14 107 -16 115 -2 5 6 43 18 86 25 44 7 95 16 114 19 19 4 51 15 71 25 20 11 39 17 43 13 3 -3 6 -1 6 5 0 6 12 18 28 26 26 14 82 65 111 100 7 10 30 57 50 104 35 83 37 93 40 207 1 65 3 121 6 123 2 2 -5 12 -16 23 -10 10 -19 31 -19 45 0 14 -14 53 -30 86 -17 34 -28 63 -26 66 3 2 1 9 -5 16 -49 59 -50 61 -56 47 -3 -7 -13 -20 -23 -29 -10 -8 -16 -21 -13 -28 7 -18 -100 -227 -138 -269 -77 -85 -147 -145 -183 -158 -100 -37 -156 -49 -188 -43 -18 4 -48 9 -67 11 -18 1 -38 8 -44 14 -6 6 -19 11 -28 11 -26 0 -129 81 -135 107 -4 13 -12 23 -20 23 -22 0 -78 60 -109 115 -15 28 -39 66 -52 87 -14 20 -26 42 -27 50 -1 7 -8 30 -15 51 -7 21 -10 44 -7 52 3 8 -1 18 -8 22 -29 17 -34 46 -19 107 14 52 13 63 0 97 -14 36 -14 41 4 76 11 21 24 56 30 78 20 73 147 244 187 249 8 2 16 10 18 20 4 27 42 55 66 48 14 -3 19 -1 14 6 -7 12 29 48 74 72 74 40 178 90 185 90 5 0 28 9 52 21 24 12 62 23 86 27 23 3 52 12 65 20 14 9 57 17 110 20 79 4 122 4 288 3 53 0 104 -15 115 -33 4 -6 22 -11 40 -10 34 1 69 -13 81 -32 4 -6 13 -11 20 -12 7 0 20 -2 29 -2 19 -2 142 -84 188 -126 67 -62 72 -68 67 -82 -3 -9 -1 -12 4 -9 12 8 53 -33 95 -96 17 -24 34 -46 38 -47 4 -2 21 -29 38 -60 16 -32 36 -68 44 -82 39 -73 65 -129 65 -144 0 -9 4 -16 9 -16 11 0 41 -85 41 -115 0 -11 9 -38 20 -60 11 -22 20 -45 20 -52 0 -7 11 -46 25 -87 18 -53 24 -90 21 -126 -2 -27 0 -50 4 -50 14 0 20 -31 10 -51 -6 -11 -7 -19 -1 -19 15 0 20 -26 11 -64 -6 -29 -5 -38 8 -45 15 -8 16 -30 13 -183 -1 -95 -7 -181 -12 -190 -5 -10 -7 -32 -4 -49 6 -31 -10 -99 -23 -99 -4 0 -7 -19 -7 -42 -1 -53 -79 -213 -133 -272 -115 -124 -225 -208 -251 -191 -5 3 -12 -4 -16 -15 -3 -11 -18 -23 -33 -26 -15 -3 -45 -15 -68 -25 -22 -10 -49 -19 -60 -19 -10 -1 -37 -7 -58 -15 -26 -9 -45 -11 -57 -5 -12 7 -19 6 -22 -3 -2 -7 -23 -13 -48 -14 -24 -1 -84 -5 -132 -9 -58 -4 -97 -2 -116 6 -32 13 -73 15 -148 6 -36 -5 -55 -3 -65 7 -7 7 -31 14 -53 14 -52 1 -176 9 -240 17 -27 3 -63 5 -80 5 -16 0 -39 0 -50 0 -11 0 -51 7 -90 16 -55 13 -97 16 -192 11 -97 -4 -125 -3 -136 8 -8 9 -19 11 -27 6 -8 -5 -19 -6 -24 -2 -6 3 -24 5 -40 4 -16 -2 -39 4 -52 13 -13 8 -33 14 -46 13 -26 -2 -148 41 -148 52 0 4 -18 12 -40 19 -21 6 -45 17 -52 24 -7 8 -43 30 -81 51 -67 38 -101 71 -91 88 3 5 0 9 -7 7 -32 -4 -41 2 -110 66 -14 13 -48 41 -75 61 -27 20 -59 47 -71 58 -71 69 -126 92 -172 71 -78 -35 -131 -118 -158 -245 -8 -36 -15 -72 -17 -80 -2 -8 -6 -27 -10 -42 -12 -41 -13 -447 -1 -451 5 -2 11 -46 12 -98 2 -52 5 -128 6 -169 2 -41 -1 -85 -6 -96 -7 -16 -4 -29 8 -48 15 -22 17 -41 12 -103 -3 -43 -1 -85 4 -95 14 -25 27 -124 34 -254 1 -34 6 -71 10 -84 10 -32 16 -71 15 -102 0 -16 4 -28 8 -28 20 0 30 -46 16 -72 -12 -23 -11 -28 7 -49 13 -15 18 -30 14 -44 -10 -30 -8 -57 5 -65 6 -4 27 -37 45 -74 61 -117 58 -116 240 -88 36 5 67 6 78 0 12 -6 23 -3 39 12 13 11 33 23 45 26 12 3 29 16 37 28 13 21 12 25 -15 52 -16 16 -42 42 -57 58 -15 16 -41 43 -57 60 -36 36 -87 121 -78 129 3 3 -8 20 -25 37 -17 16 -36 47 -43 67 -6 21 -16 41 -21 44 -29 19 -45 328 -24 444 4 17 8 40 10 53 2 13 8 28 15 35 6 6 11 19 11 29 0 26 48 118 64 124 8 3 19 18 26 34 13 32 82 98 144 139 23 14 46 32 51 39 12 15 92 35 106 27 5 -4 16 1 25 9 10 11 21 13 31 8 9 -5 30 -4 52 3 51 17 231 7 272 -16 13 -6 47 -13 77 -15 29 -3 61 -8 71 -13 9 -5 46 -13 80 -17 37 -4 71 -14 80 -23 11 -11 40 -17 86 -20 43 -2 92 -12 127 -26 31 -13 59 -21 61 -18 9 8 87 -17 87 -29 0 -6 9 -8 21 -5 28 8 77 -11 90 -35 6 -10 16 -17 22 -15 26 9 194 -78 217 -113 3 -4 19 -14 35 -23 17 -9 41 -27 55 -41 50 -52 112 -106 121 -106 3 0 10 -9 15 -19 5 -10 28 -41 51 -67 97 -113 169 -236 157 -268 -3 -8 4 -16 18 -19 15 -4 30 -21 42 -47 9 -22 23 -46 29 -53 7 -6 20 -24 29 -39 56 -86 180 -202 245 -229 l53 -21 64 32 c104 54 118 100 56 191 -16 24 -30 50 -30 57 0 6 -4 12 -10 12 -12 0 -49 71 -43 86 2 6 -8 16 -21 22 -30 13 -85 125 -93 187 -14 112 -14 213 -1 226 8 8 13 33 13 59 -1 50 24 131 49 155 9 9 16 25 16 35 0 10 7 26 16 34 8 9 17 24 19 35 5 26 34 81 43 81 4 1 22 25 41 54 19 29 50 61 69 72 24 13 36 27 37 43 1 13 10 28 19 33 10 5 33 25 53 44 19 19 41 34 48 34 7 0 15 6 18 14 6 16 223 126 248 126 9 0 32 6 50 13 20 8 80 15 144 16 173 3 183 29 62 153 -190 195 -250 315 -249 498 1 112 7 162 27 235 9 33 18 80 21 105 3 25 12 56 20 68 16 24 15 77 0 172 -3 19 -7 55 -9 80 -1 25 -6 48 -11 51 -5 4 -10 17 -12 30 -2 13 -11 51 -19 84 -9 33 -18 68 -20 79 -2 10 -14 36 -25 58 -11 21 -20 44 -20 50 0 7 -16 43 -36 80 -22 44 -33 76 -29 89 4 12 1 21 -9 25 -8 3 -20 22 -27 41 -6 19 -20 44 -30 54 -11 11 -19 28 -19 39 0 11 -4 20 -9 20 -5 0 -12 8 -16 19 -3 10 -13 28 -23 39 -9 11 -24 30 -32 43 -26 38 -146 181 -198 235 -19 18 -37 34 -41 34 -8 0 -69 44 -101 72 -9 8 -34 24 -55 37 -22 13 -45 29 -50 35 -6 6 -30 20 -55 32 -25 11 -74 35 -110 52 -36 16 -96 40 -135 51 -38 12 -85 27 -104 33 -19 6 -48 11 -66 13 -17 1 -38 5 -45 10 -7 4 -23 10 -34 11 -12 2 -43 8 -71 14 -27 6 -61 8 -75 4 -28 -7 -157 -6 -235 1 -31 3 -65 -1 -90 -10z';

// Archar center in viewBox "1528 6 395 461" space
const ARCH_CX = 1528 + 395 / 2;
const ARCH_CY = 6 + 461 / 2;
const RAY_COUNT = 10;
const RAY_LEN = 180;

const RAYS = Array.from({ length: RAY_COUNT }, (_, i) => {
  const angle = (i * (360 / RAY_COUNT) - 90) * (Math.PI / 180);
  return {
    x1: ARCH_CX,
    y1: ARCH_CY,
    x2: ARCH_CX + Math.cos(angle) * RAY_LEN,
    y2: ARCH_CY + Math.sin(angle) * RAY_LEN,
  };
});

const EASE_MATERIALIZE = [0.16, 1, 0.3, 1];

export default function IntroAnimation({ onComplete }) {
  const [visible, setVisible] = useState(true);
  const [skipVisible, setSkipVisible] = useState(false);
  const [breathing, setBreathing] = useState(false);
  const [showRays, setShowRays] = useState(false);
  const completedRef = useRef(false);
  const blurRef = useRef(null);

  const mOpacity = useMotionValue(0);
  const mScale  = useMotionValue(0.4);
  const mBlur   = useMotionValue(40);
  const mY      = useMotionValue(30);
  const mGlowSD = useMotionValue(80);
  const mBg     = useMotionValue('#030405');

  const mFilter = useTransform(mBlur, v => `blur(${Math.max(0, v).toFixed(1)}px)`);

  function handleComplete() {
    if (completedRef.current) return;
    completedRef.current = true;
    setVisible(false);
  }

  useEffect(() => {
    const t = setTimeout(() => setSkipVisible(true), 1000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') handleComplete(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => mGlowSD.on('change', v => {
    blurRef.current?.setAttribute('stdDeviation', v.toFixed(2));
  }), [mGlowSD]);

  useEffect(() => {
    const timers = [];

    // 0.5s — materialisation (1.0s → done at 1.5s)
    timers.push(setTimeout(() => {
      animate(mOpacity, 1,  { duration: 1.0, ease: EASE_MATERIALIZE });
      animate(mScale,  1,   { duration: 1.0, ease: EASE_MATERIALIZE });
      animate(mBlur,   0,   { duration: 1.0, ease: EASE_MATERIALIZE });
      animate(mY,      0,   { duration: 1.0, ease: EASE_MATERIALIZE });
      animate(mGlowSD, 12,  { duration: 1.0, ease: EASE_MATERIALIZE });
    }, 500));

    // 1.5s — flash: glow spike + rays + overscale + bg flicker
    timers.push(setTimeout(() => {
      // Glow: 12 → 200 (150ms rise) → 12 (350ms fall)
      animate(mGlowSD, [12, 200, 12], { duration: 0.5, times: [0, 0.3, 1], ease: 'easeInOut' });

      // Overscale: 1.0 → 1.25 → 1.0
      animate(mScale, [1, 1.25, 1], { duration: 0.5, times: [0, 0.3, 1], ease: 'easeInOut' });

      // BG flicker: #3a2010 in 150ms, back in 100ms
      animate(mBg, '#3a2010', { duration: 0.15 });
      timers.push(setTimeout(() => animate(mBg, '#030405', { duration: 0.1 }), 150));

      // Rays: appear at flash peak, fade after 400ms
      setShowRays(true);
      timers.push(setTimeout(() => setShowRays(false), 400));
    }, 1500));

    // 2.1s — breathing loop
    timers.push(setTimeout(() => setBreathing(true), 2100));

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!breathing) return;
    const ctrl = animate(mScale, [1, 1.02, 1], {
      duration: 3,
      ease: 'easeInOut',
      repeat: Infinity,
    });
    return () => ctrl.stop();
  }, [breathing]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          style={{ ...styles.overlay, backgroundColor: mBg }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <style>{`
            @keyframes intro-noise-pulse {
              0%, 100% { opacity: 0.05; }
              50%       { opacity: 0.07; }
            }
          `}</style>

          <svg style={styles.noise} aria-hidden="true">
            <filter id="intro-noise-f">
              <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect
              width="100%" height="100%"
              filter="url(#intro-noise-f)"
              style={{ animation: 'intro-noise-pulse 14s ease-in-out infinite' }}
            />
          </svg>

          <motion.div style={{
            opacity: mOpacity,
            scale: mScale,
            filter: mFilter,
            y: mY,
            ...styles.archWrapper,
          }}>
            <svg
              viewBox="1528 6 395 461"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
            >
              <defs>
                <filter id="intro-archar-glow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur ref={blurRef} in="SourceAlpha" stdDeviation="80" result="blur" />
                  <feFlood floodColor="#ff4a0a" floodOpacity="1" result="orange" />
                  <feComposite in="orange" in2="blur" operator="in" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <AnimatePresence>
                {showRays && RAYS.map((r, i) => (
                  <motion.line
                    key={i}
                    x1={r.x1} y1={r.y1}
                    x2={r.x2} y2={r.y2}
                    stroke="#ff4a0a"
                    strokeLinecap="round"
                    initial={{ opacity: 0, strokeWidth: 1 }}
                    animate={{ opacity: 0.65, strokeWidth: 4 }}
                    exit={{ opacity: 0, strokeWidth: 0 }}
                    transition={{ duration: 0.15, delay: i * 0.01 }}
                  />
                ))}
              </AnimatePresence>

              <g
                transform="translate(0,1307) scale(0.1,-0.1)"
                fill="#ff4a0a"
                stroke="none"
                filter="url(#intro-archar-glow)"
              >
                <path d={ARCHAR_PATH} />
              </g>
            </svg>
          </motion.div>

          <AnimatePresence>
            {skipVisible && (
              <motion.button
                style={styles.skipBtn}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={handleComplete}
                onMouseEnter={e => { e.currentTarget.style.color = 'rgba(244,245,242,1)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(244,245,242,0.5)'; }}
              >
                Пропустить →
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noise: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    filter: 'blur(3px)',
  },
  archWrapper: {
    height: '40vh',
    aspectRatio: '395 / 461',
    position: 'relative',
    zIndex: 1,
  },
  skipBtn: {
    position: 'absolute',
    bottom: '32px',
    right: '32px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'rgba(244,245,242,0.5)',
    fontFamily: 'inherit',
    fontSize: '14px',
    letterSpacing: '0.05em',
    padding: '8px 12px',
    transition: 'color 0.2s',
    zIndex: 2,
  },
};
