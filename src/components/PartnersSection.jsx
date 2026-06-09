import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// ─── ЛОГОТИПЫ ПАРТНЁРОВ ────────────────────────────────────────────────────────
//
// КАК ДОБАВИТЬ РЕАЛЬНЫЕ ЛОГОТИПЫ:
//
// Вариант A — прямая ссылка из Google Drive:
//   1. Загрузите логотип в Google Drive, откройте доступ "По ссылке — просматривать"
//   2. Скопируйте FILE_ID из URL вида: drive.google.com/file/d/FILE_ID/view
//   3. Вставьте в src:
//      src: 'https://drive.google.com/uc?export=view&id=FILE_ID'
//
// Вариант B — Google Drive API (автоматическая загрузка из папки):
//   Раскомментируйте функцию fetchLogosFromDrive ниже и передайте
//   FOLDER_ID папки и API_KEY из Google Cloud Console.
//
// ─────────────────────────────────────────────────────────────────────────────
// ↓↓↓  ЗАМЕНИТЕ null на URL логотипов  ↓↓↓
const PARTNER_LOGOS = [
  { id: 'p01', name: 'МегаКом',      abbr: 'MC', src: null },
  { id: 'p02', name: 'O! Бишкек',    abbr: 'O!', src: null },
  { id: 'p03', name: 'Beeline KG',   abbr: 'BL', src: null },
  { id: 'p04', name: 'Ак Алтын',     abbr: 'AA', src: null },
  { id: 'p05', name: 'Optima Bank',  abbr: 'OP', src: null },
  { id: 'p06', name: 'ФридомФинанс', abbr: 'FF', src: null },
  { id: 'p07', name: 'Manas Air',    abbr: 'MA', src: null },
  { id: 'p08', name: 'Баракат',      abbr: 'BR', src: null },
  { id: 'p09', name: 'TechHub KG',   abbr: 'TH', src: null },
  { id: 'p10', name: 'NurMedia',     abbr: 'NM', src: null },
  { id: 'p11', name: 'GreenCity',    abbr: 'GC', src: null },
  { id: 'p12', name: 'AsiaFood',     abbr: 'AF', src: null },
  { id: 'p13', name: 'Dordoi Plaza', abbr: 'DR', src: null },
  { id: 'p14', name: 'AlphaBank',    abbr: 'AB', src: null },
  { id: 'p15', name: 'ProSport',     abbr: 'PS', src: null },
  { id: 'p16', name: 'EduPoint',     abbr: 'EP', src: null },
  { id: 'p17', name: 'UrbanDev',     abbr: 'UD', src: null },
  { id: 'p18', name: 'Trendyol',     abbr: 'TR', src: null },
];
// ──────────────────────────────────────────────────────────────────────────────

// ─── GOOGLE DRIVE API (подключить позже) ──────────────────────────────────────
//
// async function fetchLogosFromDrive(folderId, apiKey) {
//   const SUPPORTED = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
//   const seen = new Set();
//   const results = [];
//
//   async function scanFolder(id) {
//     const url =
//       `https://www.googleapis.com/drive/v3/files` +
//       `?q='${id}'+in+parents&key=${apiKey}` +
//       `&fields=files(id,name,mimeType,parents)`;
//     const data = await fetch(url).then(r => r.json());
//     for (const file of data.files ?? []) {
//       if (file.mimeType === 'application/vnd.google-apps.folder') {
//         await scanFolder(file.id); // рекурсия в подпапки
//       } else if (SUPPORTED.includes(file.mimeType) && !seen.has(file.id)) {
//         seen.add(file.id);
//         results.push({
//           id: file.id,
//           name: file.name.replace(/\.[^.]+$/, ''),
//           abbr: file.name.slice(0, 2).toUpperCase(),
//           src: `https://drive.google.com/uc?export=view&id=${file.id}`,
//         });
//       }
//     }
//   }
//
//   await scanFolder(folderId);
//   return results;
// }
//
// Использование в компоненте:
//   const [logos, setLogos] = useState(PARTNER_LOGOS);
//   useEffect(() => {
//     fetchLogosFromDrive('YOUR_FOLDER_ID', 'YOUR_API_KEY').then(setLogos);
//   }, []);
//
// ──────────────────────────────────────────────────────────────────────────────

function LogoPlaceholder({ abbr, name }) {
  const fontSize = abbr.length > 2 ? 18 : abbr.length === 2 ? 22 : 28;
  return (
    <svg
      viewBox="0 0 128 52"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={name}
      className="partner-logo__svg"
    >
      <text
        x="64"
        y="36"
        textAnchor="middle"
        fontFamily="Unbounded, Manrope, sans-serif"
        fontWeight="700"
        fontSize={fontSize}
        fill="white"
        letterSpacing="2"
      >
        {abbr}
      </text>
    </svg>
  );
}

function LogoItem({ logo }) {
  return (
    <div className="partner-logo" title={logo.name} aria-label={logo.name}>
      {logo.src ? (
        <img
          src={logo.src}
          alt={logo.name}
          className="partner-logo__img"
          loading="lazy"
          draggable={false}
        />
      ) : (
        <LogoPlaceholder abbr={logo.abbr} name={logo.name} />
      )}
    </div>
  );
}

export default function PartnersSection() {
  const sectionRef  = useRef(null);
  const targetRef   = useRef({ x: null, y: null });
  const currentRef  = useRef({ x: null, y: null });
  const rafRef      = useRef(null);
  const autoRafRef  = useRef(null);
  const tRef        = useRef(0);
  const [hasPointer, setHasPointer] = useState(false);

  // Apply flashlight position via CSS custom properties
  const applyLight = useCallback((x, y) => {
    const el = sectionRef.current;
    if (!el) return;
    el.style.setProperty('--fl-x', `${x}px`);
    el.style.setProperty('--fl-y', `${y}px`);
  }, []);

  // Lerp loop — smooth pointer following
  useEffect(() => {
    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      const cur  = currentRef.current;
      const tgt  = targetRef.current;
      if (cur.x !== null && tgt.x !== null) {
        cur.x = lerp(cur.x, tgt.x, 0.1);
        cur.y = lerp(cur.y, tgt.y, 0.1);
        applyLight(cur.x, cur.y);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [applyLight]);

  // Auto-animation (lemniscate figure-8) — active when no pointer
  useEffect(() => {
    const runAuto = () => {
      if (hasPointer) { autoRafRef.current = requestAnimationFrame(runAuto); return; }
      const el = sectionRef.current;
      if (!el) { autoRafRef.current = requestAnimationFrame(runAuto); return; }
      const { width, height } = el.getBoundingClientRect();
      tRef.current += 0.004;
      const tt = tRef.current;
      const d  = 1 + Math.sin(tt) ** 2;
      const px = width  / 2 + (width  * 0.3) * Math.cos(tt) / d;
      const py = height / 2 + (height * 0.22) * Math.sin(tt) * Math.cos(tt) / d;
      targetRef.current = { x: px, y: py };
      autoRafRef.current = requestAnimationFrame(runAuto);
    };
    autoRafRef.current = requestAnimationFrame(runAuto);
    return () => cancelAnimationFrame(autoRafRef.current);
  }, [hasPointer]);

  // Initialize position to center
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const cx = width / 2, cy = height / 2;
    targetRef.current  = { x: cx, y: cy };
    currentRef.current = { x: cx, y: cy };
  }, []);

  const handleMouseMove = useCallback((e) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    targetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (!hasPointer) setHasPointer(true);
  }, [hasPointer]);

  const handleMouseLeave = useCallback(() => {
    setHasPointer(false);
    const rect = sectionRef.current?.getBoundingClientRect();
    if (rect) targetRef.current = { x: rect.width / 2, y: rect.height / 2 };
  }, []);

  const handleTouchMove = useCallback((e) => {
    const touch = e.touches[0];
    const rect  = sectionRef.current?.getBoundingClientRect();
    if (!rect || !touch) return;
    targetRef.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    setHasPointer(true);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setHasPointer(false);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="partners"
      className="partners-section"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-labelledby="partners-title"
    >
      {/* Film grain */}
      <div className="partners-grain" aria-hidden="true" />

      {/* Ambient top glow */}
      <div className="partners-ambient" aria-hidden="true" />

      <motion.header
        className="partners-heading"
        initial={{ opacity: 0, y: 32, filter: 'blur(14px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.82, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <p className="eyebrow">Клиенты &amp; Партнёры</p>
        <h2 id="partners-title">Нам доверяют</h2>
        <p className="partners-subtitle">
          Партнёры и бренды, с которыми мы уже работали
        </p>
      </motion.header>

      {/* Logo grid + flashlight overlay */}
      <div className="partners-stage">
        <div className="partners-grid" role="list" aria-label="Логотипы партнёров">
          {PARTNER_LOGOS.map((logo, i) => (
            <motion.div
              key={logo.id}
              role="listitem"
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.05 }}
              transition={{
                duration: 0.55,
                delay: i * 0.038,
                ease: [0.2, 0.8, 0.2, 1],
              }}
            >
              <LogoItem logo={logo} />
            </motion.div>
          ))}
        </div>

        {/* Darkness overlay with transparent hole = flashlight */}
        <div className="partners-flashlight" aria-hidden="true" />

        {/* Subtle scanlines for cinematic feel */}
        <div className="partners-scanlines" aria-hidden="true" />
      </div>

      {/* Hint text */}
      <motion.p
        className="partners-hint"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 1, delay: 0.3 }}
        aria-hidden="true"
      >
        Наведите курсор, чтобы увидеть
      </motion.p>

      {/* Final tagline */}
      <motion.p
        className="partners-tagline"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.7 }}
        transition={{ duration: 0.75, delay: 0.15, ease: 'easeOut' }}
      >
        Создаём визуальные решения, которые работают на бренд
      </motion.p>
    </section>
  );
}
