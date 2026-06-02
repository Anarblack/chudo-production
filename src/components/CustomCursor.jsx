import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [variant, setVariant] = useState('default');

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const dotX   = useMotionValue(-100);
  const dotY   = useMotionValue(-100);

  const cursorX = useSpring(mouseX, { damping: 38, stiffness: 380, mass: 0.7 });
  const cursorY = useSpring(mouseY, { damping: 38, stiffness: 380, mass: 0.7 });
  const trailX  = useSpring(dotX,   { damping: 22, stiffness: 200, mass: 0.5 });
  const trailY  = useSpring(dotY,   { damping: 22, stiffness: 200, mass: 0.5 });

  useEffect(() => {
    if (window.matchMedia('(max-width: 760px)').matches) return;

    const move = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      setVisible(true);
    };

    const over = (e) => {
      const el = e.target.closest('button, a, [data-cursor]');
      if (!el) return;
      setVariant(el.dataset.cursor === 'camera' ? 'camera' : 'hover');
    };

    const out = (e) => {
      if (e.target.closest('button, a, [data-cursor]')) setVariant('default');
    };

    window.addEventListener('mousemove', move, { passive: true });
    document.addEventListener('mouseover', over);
    document.addEventListener('mouseout', out);
    return () => {
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', over);
      document.removeEventListener('mouseout', out);
    };
  }, [mouseX, mouseY, dotX, dotY]);

  const sizes = {
    default: { width: 30, height: 30 },
    hover:   { width: 52, height: 52 },
    camera:  { width: 50, height: 50 },
  };

  return (
    <>
      <motion.div
        className={`custom-cursor custom-cursor--${variant}`}
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: visible ? 1 : 0,
        }}
        animate={sizes[variant]}
        transition={{ duration: 0.16, ease: 'easeOut' }}
      >
        {variant === 'camera' && (
          <>
            <span className="cursor-crosshair cursor-crosshair--h" />
            <span className="cursor-crosshair cursor-crosshair--v" />
            <span className="cursor-corner cursor-corner--tl" />
            <span className="cursor-corner cursor-corner--tr" />
            <span className="cursor-corner cursor-corner--bl" />
            <span className="cursor-corner cursor-corner--br" />
          </>
        )}
      </motion.div>

      <motion.div
        className="cursor-trail"
        style={{
          x: trailX,
          y: trailY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: visible ? 0.8 : 0,
        }}
      />
    </>
  );
}
