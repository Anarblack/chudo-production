// Паттерн из reactbits.dev/text-animations/blur-text
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function BlurText({
  text = '',
  delay = 0,
  stepDelay = 60,
  duration = 0.65,
  splitBy = 'words',
  className = '',
  once = true,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: '-10% 0px' });

  const parts = splitBy === 'chars' ? text.split('') : text.split(' ');

  return (
    <span ref={ref} className={`blur-text ${className}`} aria-label={text}>
      {parts.map((part, i) => (
        <motion.span
          key={i}
          className="blur-text__part"
          aria-hidden="true"
          initial={{ opacity: 0, filter: 'blur(18px)', y: 16 }}
          animate={inView
            ? { opacity: 1, filter: 'blur(0px)', y: 0 }
            : { opacity: 0, filter: 'blur(18px)', y: 16 }
          }
          transition={{
            duration,
            delay: delay / 1000 + i * (stepDelay / 1000),
            ease: [0.2, 0.8, 0.2, 1],
          }}
        >
          {part}{splitBy === 'words' && i < parts.length - 1 ? '\u00a0' : ''}
        </motion.span>
      ))}
    </span>
  );
}
