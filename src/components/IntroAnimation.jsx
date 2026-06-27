import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function IntroAnimation({ onComplete }) {
  const [visible, setVisible] = useState(true);
  const [skipVisible, setSkipVisible] = useState(false);
  const completedRef = useRef(false);

  function handleComplete() {
    if (completedRef.current) return;
    completedRef.current = true;
    setVisible(false);
  }

  useEffect(() => {
    const timer = setTimeout(() => setSkipVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleComplete(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          style={styles.overlay}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <span style={styles.placeholder}>INTRO ANIMATION PLACEHOLDER</span>

          <AnimatePresence>
            {skipVisible && (
              <motion.button
                style={styles.skipBtn}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={handleComplete}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(244,245,242,1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(244,245,242,0.5)'; }}
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
    background: '#030405',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    color: '#ff4a0a',
    fontFamily: 'monospace',
    fontSize: '18px',
    letterSpacing: '0.1em',
    userSelect: 'none',
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
  },
};
