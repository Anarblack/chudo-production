// ─── СПИСОК ПАРТНЁРОВ ─────────────────────────────────────────────────────────
//
// КАК ДОБАВИТЬ РЕАЛЬНЫЙ ЛОГОТИП:
//
//   Вариант A — прямая ссылка Google Drive:
//     1. Загрузите логотип в Google Drive
//     2. Откройте доступ "По ссылке — просматривать"
//     3. Скопируйте FILE_ID из URL: drive.google.com/file/d/FILE_ID/view
//     4. В поле logoUrl вставьте:
//        'https://drive.google.com/uc?export=view&id=FILE_ID'
//        или прямую CDN ссылку:
//        'https://lh3.googleusercontent.com/d/FILE_ID'
//
//   Вариант B — автоматически из Google Drive API:
//     Используйте src/lib/googleDriveLogos.js
//     Смотрите комментарии в том файле.
//
//   Вариант C — локальный файл:
//     Положите логотип в /public/partners/
//     Укажите logoUrl: '/partners/megacom.svg'
//
// Поля:
//   id                 — уникальный slug
//   companyName        — полное название (для fallback-генератора и hover-label)
//   logoUrl            — URL логотипа (null = показать сгенерированный wordmark)
//   isGeneratedFallback — true если логотип сгенерирован автоматически
//   wide               — занимать 2 колонки в сетке (для длинных или важных имён)
// ──────────────────────────────────────────────────────────────────────────────

// ↓↓↓ Замените logoUrl: null на реальные ссылки ↓↓↓
export const PARTNER_LOGOS = [
  { id: 'p01', companyName: 'МегаКом',        logoUrl: null, isGeneratedFallback: true, wide: false },
  { id: 'p02', companyName: 'Beeline',         logoUrl: null, isGeneratedFallback: true, wide: true  },
  { id: 'p03', companyName: 'O!',              logoUrl: null, isGeneratedFallback: true, wide: false },
  { id: 'p04', companyName: 'Optima Bank',     logoUrl: null, isGeneratedFallback: true, wide: false },
  { id: 'p05', companyName: 'Freedom Finance', logoUrl: null, isGeneratedFallback: true, wide: false },
  { id: 'p06', companyName: 'БайТушум',        logoUrl: null, isGeneratedFallback: true, wide: true  },
  { id: 'p07', companyName: 'Manas Air',       logoUrl: null, isGeneratedFallback: true, wide: false },
  { id: 'p08', companyName: 'N Group',         logoUrl: null, isGeneratedFallback: true, wide: false },
  { id: 'p09', companyName: 'Авангард',        logoUrl: null, isGeneratedFallback: true, wide: false },
  { id: 'p10', companyName: 'Avia Traffic',    logoUrl: null, isGeneratedFallback: true, wide: true  },
  { id: 'p11', companyName: 'Шоро',            logoUrl: null, isGeneratedFallback: true, wide: false },
  { id: 'p12', companyName: 'Дордой',          logoUrl: null, isGeneratedFallback: true, wide: false },
  { id: 'p13', companyName: 'Технодом',        logoUrl: null, isGeneratedFallback: true, wide: false },
  { id: 'p14', companyName: 'GreenCity',       logoUrl: null, isGeneratedFallback: true, wide: true  },
  { id: 'p15', companyName: 'Chevrolet',       logoUrl: null, isGeneratedFallback: true, wide: false },
  { id: 'p16', companyName: 'RSK Bank',        logoUrl: null, isGeneratedFallback: true, wide: false },
  { id: 'p17', companyName: 'RAMS',            logoUrl: null, isGeneratedFallback: true, wide: false },
  { id: 'p18', companyName: 'Samsung',         logoUrl: null, isGeneratedFallback: true, wide: true  },
  { id: 'p19', companyName: 'TechHub',         logoUrl: null, isGeneratedFallback: true, wide: false },
  { id: 'p20', companyName: 'Air Manas',       logoUrl: null, isGeneratedFallback: true, wide: false },
];
// ──────────────────────────────────────────────────────────────────────────────
