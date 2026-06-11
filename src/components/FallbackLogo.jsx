import React from 'react';

// Слова, которые убираем при сокращении длинных названий
const STOP_WORDS = new Set([
  'банк', 'bank', 'group', 'групп', 'groups',
  'бишкек', 'bishkek', 'кг', 'kg', 'kyrgyz', 'кыргыз',
  'плаза', 'plaza', 'центр', 'center', 'centre',
  'сервис', 'service', 'строй', 'building', 'build',
  'corp', 'корп', 'ltd', 'llc', 'ооо', 'зао', 'ип',
  'finance', 'финанс', 'project', 'проект',
  'hub', 'tech', 'digital', 'media', 'медиа',
]);

// Принимает название компании, возвращает короткий wordmark
export function createFallbackLabel(companyName) {
  const name = companyName.trim();

  // Короткое название — показать полностью
  if (name.length <= 10) return name.toUpperCase();

  const words = name.split(/[\s\-_]+/).filter(Boolean);

  // Два слова и общая длина ≤ 13 — показать оба
  if (words.length === 2 && name.length <= 13) return name.toUpperCase();

  // Убираем служебные слова, оставляем брендовые
  const mainWords = words.filter(w => !STOP_WORDS.has(w.toLowerCase()));

  if (mainWords.length >= 1) {
    const two = mainWords.slice(0, 2).join(' ');
    return (two.length <= 12 ? two : mainWords[0]).toUpperCase();
  }

  return words[0].toUpperCase();
}

// Определяет, разбивать ли wordmark на 2 строки
function shouldSplit(label) {
  const parts = label.split(' ');
  return parts.length === 2 && label.length > 7;
}

// Угловые скобки — 4 штуки, как viewfinder
function CornerBrackets() {
  const arm = 9;
  const m   = 7;
  const r   = 160 - m;
  const b   = 60  - m;
  const sw  = '0.9';
  const op  = '0.26';
  return (
    <>
      <path d={`M${m} ${m + arm} L${m} ${m} L${m + arm} ${m}`}
            stroke="white" strokeWidth={sw} fill="none" opacity={op}/>
      <path d={`M${r - arm} ${m} L${r} ${m} L${r} ${m + arm}`}
            stroke="white" strokeWidth={sw} fill="none" opacity={op}/>
      <path d={`M${m} ${b - arm} L${m} ${b} L${m + arm} ${b}`}
            stroke="white" strokeWidth={sw} fill="none" opacity={op}/>
      <path d={`M${r - arm} ${b} L${r} ${b} L${r} ${b - arm}`}
            stroke="white" strokeWidth={sw} fill="none" opacity={op}/>
    </>
  );
}

export default function FallbackLogo({ companyName }) {
  const label  = createFallbackLabel(companyName);
  const split  = shouldSplit(label);
  const parts  = label.split(' ');

  // Размер шрифта в зависимости от длины
  const rawLen   = label.replace(/\s+/g, '').length;
  const fontSize = split
    ? (parts[0].length <= 5 && parts[1].length <= 5 ? 13 : 10)
    : rawLen <= 4 ? 18 : rawLen <= 6 ? 15 : rawLen <= 9 ? 12 : rawLen <= 12 ? 9.5 : 8;

  const tracking = rawLen <= 6 ? 4 : rawLen <= 9 ? 3 : 2;

  return (
    <svg
      viewBox="0 0 160 60"
      xmlns="http://www.w3.org/2000/svg"
      className="fallback-logo"
      aria-label={companyName}
      role="img"
    >
      <CornerBrackets />

      {split ? (
        <>
          <text
            x="80" y="25"
            textAnchor="middle" dominantBaseline="middle"
            fontFamily="Unbounded, Tektur, sans-serif"
            fontWeight="700"
            fontSize={fontSize}
            fill="white"
            letterSpacing={tracking}
          >
            {parts[0]}
          </text>
          <line x1="64" y1="32" x2="96" y2="32" stroke="white" strokeWidth="0.35" opacity="0.18"/>
          <text
            x="80" y="39"
            textAnchor="middle" dominantBaseline="middle"
            fontFamily="Unbounded, Tektur, sans-serif"
            fontWeight="500"
            fontSize={fontSize * 0.85}
            fill="white"
            letterSpacing={tracking + 1}
            opacity="0.6"
          >
            {parts[1]}
          </text>
        </>
      ) : (
        <text
          x="80" y="31"
          textAnchor="middle" dominantBaseline="middle"
          fontFamily="Unbounded, Tektur, sans-serif"
          fontWeight="700"
          fontSize={fontSize}
          fill="white"
          letterSpacing={tracking}
        >
          {label}
        </text>
      )}
    </svg>
  );
}
