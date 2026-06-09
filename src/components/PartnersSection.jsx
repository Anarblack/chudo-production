import React from 'react';
import { motion } from 'framer-motion';
import { PARTNER_LOGOS } from '../data/partnersLogos.js';
import PartnerLogoGrid from './PartnerLogoGrid.jsx';

// ─── GOOGLE DRIVE ИНТЕГРАЦИЯ ──────────────────────────────────────────────────
// Когда будет готов Google Drive API, раскомментируйте import и useEffect ниже.
// Подробная инструкция в src/lib/googleDriveLogos.js
//
// import { useState, useEffect } from 'react';
// import { fetchLogosFromDrive } from '../lib/googleDriveLogos.js';
//
// В компоненте:
//   const [logos, setLogos] = useState(PARTNER_LOGOS);
//   useEffect(() => {
//     const folderId = import.meta.env.VITE_GDRIVE_FOLDER_ID;
//     const apiKey   = import.meta.env.VITE_GDRIVE_API_KEY;
//     if (!folderId || !apiKey) return;
//     fetchLogosFromDrive(folderId, apiKey)
//       .then(setLogos)
//       .catch(() => {/* используем локальный список */});
//   }, []);
// ──────────────────────────────────────────────────────────────────────────────

export default function PartnersSection() {
  const count = PARTNER_LOGOS.length;

  return (
    <section
      id="partners"
      className="pt-section"
      aria-labelledby="pt-title"
    >
      {/* Decorative background layers */}
      <div className="pt-grain"   aria-hidden="true" />
      <div className="pt-ambient" aria-hidden="true" />
      <div className="pt-grid-bg" aria-hidden="true" />

      {/* ── Heading ─────────────────────────────────────────────────────── */}
      <motion.header
        className="pt-heading"
        initial={{ opacity: 0, y: 36, filter: 'blur(16px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.85, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <p className="eyebrow">Клиенты &amp; Партнёры</p>
        <h2 id="pt-title">Нам доверяют</h2>
        <p className="pt-subtitle">
          Партнёры и бренды, с которыми мы уже работали
        </p>

        {/* Counter badge */}
        <motion.div
          className="pt-counter"
          initial={{ opacity: 0, scale: 0.88 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, delay: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
          aria-label={`${count} партнёров и клиентов`}
        >
          <strong>{count}</strong>
          <span>+</span>
          <em>партнёров и клиентов</em>
        </motion.div>
      </motion.header>

      {/* ── Interactive logo grid ─────────────────────────────────────── */}
      <motion.div
        className="pt-grid-wrapper"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <PartnerLogoGrid logos={PARTNER_LOGOS} />
      </motion.div>

      {/* ── Hint ─────────────────────────────────────────────────────── */}
      <motion.p
        className="pt-hint"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.2, delay: 0.4 }}
        aria-hidden="true"
      >
        <span className="pt-hint__desktop">Наведите курсор, чтобы раскрыть архив</span>
        <span className="pt-hint__mobile">Коснитесь экрана, чтобы увидеть партнёров</span>
      </motion.p>

      {/* ── Tagline ──────────────────────────────────────────────────── */}
      <motion.p
        className="pt-tagline"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.7 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
      >
        Создаём визуальные решения, которые работают на&nbsp;бренд
      </motion.p>
    </section>
  );
}
