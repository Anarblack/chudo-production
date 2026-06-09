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

export default function FallbackLogo({ companyName }) {
  const label  = createFallbackLabel(companyName);
  const split  = shouldSplit(label);
  const parts  = label.split(' ');

  // Размер шрифта в зависимости от длины
  const rawLen = label.replace(/\s+/g, '').length;
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
      {split ? (
        // Двустрочный wordmark для длинных двухсловных имён
        <>
          <line x1="24" y1="11" x2="136" y2="11" stroke="white" strokeWidth="0.5" opacity="0.22" />
          <text
            x="80" y="28"
            textAnchor="middle" dominantBaseline="middle"
            fontFamily="Unbounded, Tektur, sans-serif"
            fontWeight="700"
            fontSize={fontSize}
            fill="white"
            letterSpacing={tracking}
          >
            {parts[0]}
          </text>
          <line x1="48" y1="33" x2="112" y2="33" stroke="white" strokeWidth="0.3" opacity="0.18" />
          <text
            x="80" y="44"
            textAnchor="middle" dominantBaseline="middle"
            fontFamily="Unbounded, Tektur, sans-serif"
            fontWeight="500"
            fontSize={fontSize * 0.85}
            fill="white"
            letterSpacing={tracking + 1}
            opacity="0.75"
          >
            {parts[1]}
          </text>
          <line x1="24" y1="51" x2="136" y2="51" stroke="white" strokeWidth="0.5" opacity="0.22" />
        </>
      ) : (
        // Однострочный wordmark
        <>
          <line x1="24" y1="16" x2="136" y2="16" stroke="white" strokeWidth="0.5" opacity="0.22" />
          <text
            x="80" y="33"
            textAnchor="middle" dominantBaseline="middle"
            fontFamily="Unbounded, Tektur, sans-serif"
            fontWeight="700"
            fontSize={fontSize}
            fill="white"
            letterSpacing={tracking}
          >
            {label}
          </text>
          <line x1="24" y1="46" x2="136" y2="46" stroke="white" strokeWidth="0.5" opacity="0.22" />
        </>
      )}
    </svg>
  );
}
